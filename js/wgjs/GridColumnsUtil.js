/**
 * 
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	owner.SortColumnsByGroup = function(columns) {
		columns.sort(SortUtil.SortByGroup);
		return columns;
	};

	owner.SplitGroupAndColumns = function(data, typeField) {
		var groups = [],
			details = [],
			columns = [];
		$.each(data, function(index, element) {
			var type = element.FType;
			if(typeField) {
				type = element[typeField];
			}
			if(type == 'group') { // 分组
				groups.push(element);
			} else if(type == 'detail') { // 详情
				details.push(element);
			} else { // 字段
				columns.push(element);
			}
		});
		return {
			groups: groups,
			details: details,
			columns: columns
		};
	};

	owner.SetHeadSelfField = function(columns, adtColumns) {
		//修改表头自定义字段
		try {
			$.each(adtColumns, function(index, item) {
				var markColumn = null;
				// 查找columns对应的列
				$.each(columns, function(index1, item1) {
					if(item1.FField == item.FField) {
						markColumn = item1;
						return false;
					}
				});
				if(markColumn && markColumn.FTitle) {
					markColumn.FTitle = item.FTitle;
					markColumn.FIsHidden = !item.FIsShow;
				}
			});
		} catch(e) {}
	};

	owner.SetDetailSelfField = function(columns, adtColumns) {
		//修改表头自定义字段
		try {
			$.each(adtColumns, function(index, item) {
				// 只替换自定义字段和商品属性字段的显示文本
				if(dItem.field.indexOf('Field') >= 0 || dItem.field.indexOf('Attribute') >= 0) {
					var markColumn = null;
					// 查找columns对应的列
					$.each(columns, function(index1, item1) {
						if(item1.FField == item.FField) {
							markColumn = item1;
							return false;
						}
					});
					if(markColumn && markColumn.FTitle) {
						markColumn.FTitle = item.FTitle;
						markColumn.FIsHidden = !item.FIsShow;
					}
				}
			});
		} catch(e) {}
	};

	owner.OpenGridColumnWindow = function(webviewid, columns, savedColumnKey, showType) {
		if(!showType) {
			showType = ShowType.Detail;
		}
		var page = wgyun.openPage({
			url: '/view/CommonHelper/gridColumn.html',
			id: 'gridColumn',
			extras: {
				webviewid: webviewid,
				columns: columns,
				key: savedColumnKey,
				showType: showType
			}
		});

		return page;
	};

	var firstOpen = true;
	var GroupColumnHeadID = 'GroupColumnHead';
	var GroupColumnUrl = '/view/CommonHelper/GroupColumnHead.html';
	owner.OpenGroupColumnWindow = function(columns, savedColumnKey, showType, callback) {
		if(firstOpen)
			document.addEventListener('reloadAfterColumnConfig', callback);
		firstOpen = false;
		var page = wgyun.openPage({
			id: GroupColumnHeadID,
			url: GroupColumnUrl,
			styles: {
				left: '100%',
				top: '0px',
				bottom: '0px'
			},
			createNew: false,
			extras: {
				key: savedColumnKey,
				columns: columns,
				showType: showType
			}
		});
	};

	owner.getNewGroup = function(groupOrder, groups) {
		var maxId = 0;
		for(var i = 0; i < groups.length; i++) {
			var group = groups[i];
			var rs = new RegExp("(?:FGroup)(\\d{1,})").exec(group['FField']);
			if(rs != null) {
				var id = rs[1];
				if(!isNaN(id) && id > maxId) {
					maxId = id;
				}
			}
		}

		return {
			FField: 'FGroup' + (maxId * 1 + 1),
			FTitle: '',
			FOrder: groupOrder,
			FType: 'group',
			FIsAccordion: true
		};
	};

	owner.appendViewColumns = function(selector, columns, groups) {
		var table = selector;
		if(typeof(selector) == typeof('')) {
			table = document.querySelector(selector);
		}
		mui.each(columns, function(index, item) {
			var groupUl = owner.getGroup(table, item.FGroupOrder, groups, GridColumnsMode.View);
			// 插入字段
			var li = owner.genLiByConfig(item);
			// 此处使用折叠面板，故而需要找到mui-input-group才是存放表单的地方
			groupUl.querySelector('.mui-input-group').appendChild(li);
		});

	};

	/**
	 * 
	 * @param {Object} table
	 * @param {Object} groupOrder
	 * @param {Object} groups
	 * @param {Object} mode 生成列表的模式，目前有View、Add、Edit
	 */
	owner.getGroup = function(table, groupOrder, groups, mode) {
		if(typeof(table) == typeof('')) {
			table = document.querySelector(table);
		}
		var groupUl = document.querySelector('li[FGroupOrder="' + groupOrder + '"]');
		if(!groupUl) { // 未有分组
			groupUl = owner.genGroup(groupOrder, groups, mode);
			table.appendChild(groupUl);
		}
		return groupUl;
	};

	/**
	 * 
	 * @param {Object} groupOrder
	 * @param {Object} groups
	 * @param {Object} mode 生成列表的模式，目前有View、Add、Edit
	 */
	owner.genGroup = function(groupOrder, groups, mode) {
		//					<a class="mui-navigate-right" href="#">表单</a>
		//					<div class="mui-collapse-content">
		//						<div class="mui-input-group">
		// 查找与分组序号匹配的分组
		//CommonUtil.print(groups.selectItemsByKey('FOrder', groupOrder)[0]) 
		var group = groups.selectItemsByKey('FOrder', groupOrder)[0];
		var active = false;
		if(mode == GridColumnsMode.View && group.FActiveInDetail) active = true;
		else if(mode == GridColumnsMode.Add && group.FActiveInAdd) active = true;
		else if(mode == GridColumnsMode.Edit && group.FActiveInEdit) active = true;
		groupUl = document.createElement('li');
		groupUl.className = 'mui-table-view-cell mui-collapse' + (active ? ' mui-active' : '');
		groupUl.setAttribute('FGroupOrder', groupOrder);
		groupUl.setAttribute('name', group.FField);
		groupUl.style.marginBottom = '2px';
		// 插入分组标题 
		var title = document.createElement('a');
		title.className = 'mui-navigate-right wg-table-view-title';
		title.href = '#';
		title.innerText = (group && group.FTitle) ? group.FTitle : "";
		groupUl.appendChild(title);
		// 插入折叠面板div
		var divCollapse = document.createElement('div');
		divCollapse.className = 'mui-collapse-content';
		groupUl.appendChild(divCollapse);
		// 插入列表div
		var divList = document.createElement('div');
		divList.className = 'mui-input-group';
		divCollapse.appendChild(divList);

		return groupUl;
	};

	owner.getDetailUl = function(main, detailName, details, removeOld, mode) {
		if(typeof(main) == typeof('')) {
			main = document.querySelector(main);
		}
		var detailGroup = null;
		// 插入详情分组，用于占位，详情列表待加载
		mui.each(details, function(index, element) {
			if(element.FField == detailName) {
				detailGroup = element;
				return false;
			}
		});
		var detailUl = document.querySelector('li[FGroupOrder="' + detailGroup.FOrder + '"]');
		if(detailUl && removeOld) {
			main.removeChild(detailUl);
		}
		detailUl = owner.appendDetail(main, detailGroup.FOrder, details, mode);

		return detailUl;
	};

	owner.appendDetail = function(main, detailOrder, details, mode) {
		var detailUl = main.querySelector('li[FGroupOrder="' + detailOrder + '"]');
		var preNode = main.querySelector('li[FGroupOrder="' + (detailOrder - 1) + '"]');
		if(!detailUl) { // 未有分组
			detailUl = GridColumnsUtil.genGroup(detailOrder, details, mode);
			if(preNode != null && preNode.nextSibling != null) {
				preNode.parentNode.insertBefore(detailUl, preNode.nextSibling);
			} else {
				main.appendChild(detailUl);
			}
		}

		return detailUl;
	};

	owner.removeDetail = function(main, detailName) {
		if(typeof(main) == typeof('')) {
			main = document.querySelector(main);
		}
		var detailUl = document.querySelector('li[name="' + detailName + '"]');
		if(detailUl) {
			main.removeChild(detailUl);
		}
	};

	owner.genDetailLi = function(title, r1c1, r1c2, r2c1, r2c2, r3c1, r3c2) {
		var li = document.createElement('li');
		li.className = 'mui-table-view-cell';
		var sInnerHTML = '';
		sInnerHTML += '<div class="wg-menuitemlabel wg-list-content" style="float: left;">';
		// 顶部标题
		sInnerHTML += '<div class="wg-list-title">';
		sInnerHTML += title;
		sInnerHTML += '</div>';
		// 第1行
		sInnerHTML += '<div class="wg-list-desc">';
		sInnerHTML += r1c1 + (r1c2 ? ('<div style="float:right">' + r1c2 + '</div>') : '');
		sInnerHTML += '</div>';
		// 第2行
		sInnerHTML += '<div class="wg-list-desc">';
		sInnerHTML += r2c1 + (r2c2 ? ('<div style="float:right">' + r2c2 + '</div>') : '');
		sInnerHTML += '</div>';
		// 第3行 
		sInnerHTML += '<div class="wg-list-desc">';
		sInnerHTML += r3c1 + (r3c2 ? ('<div style="float:right">' + r3c2 + '</div>') : '');
		sInnerHTML += '</div>';
		sInnerHTML += '</div>';
		// 右侧按钮
		sInnerHTML += '<div style="float: right;"><a href="#" class="mui-icon mui-icon-forward" style="padding: 15px 0px 15px 5px;"></a></div>';
		li.innerHTML = sInnerHTML;
		return li;
	};

	owner.genLiByConfig = function(item) {
		var fIsShow = true;
		if(item.FHiddenInDetail || item.FIsShow == false) {
			fIsShow = false;
		}
		return owner.genLi(item.FField, item.FTitle, item.FFormatter, fIsShow);
	};

	owner.genLi = function(fField, fTitle, fFormatter, fIsShow, value) {
		var li = document.createElement('div');
		var v = value;
		if(fFormatter) {
			if(eval('(' + fFormatter + ')') && (value != undefined && value != null)) {
				v = eval('(' + fFormatter + '("' + value + '"))');
			}
		}
		if(fIsShow == false) {
			li.style.display = 'none';
		}
		li.className = 'mui-table-view-cell';
		var sInnerHTML = '';
		sInnerHTML += '<div class="wg-list-col1" style="float: left;">';
		sInnerHTML += fTitle + '</div>';
		// 右侧
		sInnerHTML += '<div class="wg-list-col2" id="' + fField + '" FFormatter="' + fFormatter + '" style="float: right;">' + (v != undefined ? v : '') + '</div>';
		li.innerHTML = sInnerHTML;
		return li;
	};

	owner.appendAddColumns = function(selector, columns, groups) {
		var table = selector;
		if(typeof(selector) == typeof('')) {
			table = document.body.querySelector(selector);
		}
		if(groups == undefined) {
			//将配置分成“分组”、“详情”、“字段”三组
			var splitData = GridColumnsUtil.SplitGroupAndColumns(columns, 'FType');
			columns = splitData.columns;
			groups = splitData.groups;
			var details = splitData.details;
			//按配置的Group
			GridColumnsUtil.SortColumnsByGroup(columns);
		}
		mui.each(columns, function(index, item) {
			var groupUl = owner.getGroup(table, item.FGroupOrder, groups, GridColumnsMode.Add);
			// 插入字段
			var li = owner.genEditableLiByConfig(item, ShowType.Add);
			// console.log(li.innerHTML);
			groupUl.querySelector('.mui-input-group').appendChild(li);
		});

	};

	owner.appendEditColumns = function(selector, columns, groups) {
		var table = selector;
		if(typeof(selector) == typeof('')) {
			table = document.body.querySelector(selector);
		}
		if(groups == undefined) {
			//将配置分成“分组”、“详情”、“字段”三组
			var splitData = GridColumnsUtil.SplitGroupAndColumns(columns, 'FType');
			columns = splitData.columns;
			groups = splitData.groups;
			var details = splitData.details;
			//按配置的Group
			GridColumnsUtil.SortColumnsByGroup(columns);
		}
		mui.each(columns, function(index, item) {
			var groupUl = owner.getGroup(table, item.FGroupOrder, groups, GridColumnsMode.Edit);
			// 插入字段
			var li = owner.genEditableLiByConfig(item, ShowType.Edit);
			// console.log(li.innerHTML);
			groupUl.querySelector('.mui-input-group').appendChild(li);
		});

	};

	owner.genEditableLiByConfig = function(item, showType) {
		var li = document.createElement('div');
		var editable, isPost;
		var editTag = item.FRequired ? '<span class="wg-editTag-force">✎</span>' : '<span class="wg-editTag">✎</span>';
		li.className = 'mui-input-row';
		li.style.height = 'auto';
		if(showType == ShowType.Add) { // 新增
			if(item.FHiddenInAdd || item.FIsShow == false) {
				li.style.display = 'none';
			}
			editable = item.FIsAddable;
			isPost = item.FIsAddPost;
		} else if(showType == ShowType.Edit) { // 编辑
			if(item.FHiddenInEdit || item.FIsShow == false) {
				li.style.display = 'none';
			}
			editable = item.FIsEditable;
			isPost = item.FIsEditPost;
		}
		var sHtml = '';
		li.innerHTML += '<div class="wg-list-col1" style="float: left; padding: 11px 0px 11px 15px;">' + (editable ? editTag : '') + item.FTitle + '</div>';
		var valueInput = '';
		switch(item.FType) {
			case "varchar":
				{
					valueInput = owner.genVarcharLiByConfig(item, editable);
					if(editable && item.FCanScan) {
						var inputPart = valueInput.querySelector('input');
						inputPart.type = 'text';
						owner.setTagAttributeByConfig(inputPart, item, editable, isPost, showType);
					} else {
						owner.setTagAttributeByConfig(valueInput, item, editable, isPost, showType);
					}
				}
				break;
			case "int":
				{
					valueInput = owner.genIntLiByConfig(item, editable);
					owner.setTagAttributeByConfig(valueInput, item, editable, isPost, showType);
				}
				break;
			case "password":
				{
					valueInput = owner.genPasswordLiByConfig(item, editable);
					owner.setTagAttributeByConfig(valueInput, item, editable, isPost, showType);
				}
				break;
			case "bit":
				{
					valueInput = owner.genBitLiByConfig(item, editable);
					owner.setTagAttributeByConfig(valueInput, item, editable, isPost, showType);
				}
				break;
			case "pick":
				{
					valueInput = owner.genPickLiByConfig(item, editable);
					owner.setTagAttributeByConfig(valueInput, item, editable, isPost, showType);
				}
				break;
			case "inputPick":
				{
					valueInput = owner.genInputPickLiByConfig(item, editable);
					var inputPart = valueInput.querySelector('input');
					inputPart.type = 'text';
					owner.setTagAttributeByConfig(inputPart, item, editable, isPost, showType);
				}
				break;
			case "intPick":
				{
					valueInput = owner.genInputPickLiByConfig(item, editable);
					var inputPart = valueInput.querySelector('input');
					inputPart.type = 'number';
					owner.setTagAttributeByConfig(inputPart, item, editable, isPost, showType);
				}
				break;
			case "date":
				{
					valueInput = owner.genDateLiByConfig(item, editable);
					owner.setTagAttributeByConfig(valueInput, item, editable, isPost, showType);
				}
				break;
			case "dateTime":
				{
					valueInput = owner.genDateTimeLiByConfig(item, editable);
					owner.setTagAttributeByConfig(valueInput, item, editable, isPost, showType);
				}
				break;
			case "search":
				{
					valueInput = owner.genSearchLiByConfig(item, editable);
					var inputPart = valueInput.querySelector('input');
					owner.setTagAttributeByConfig(inputPart, item, editable, isPost, showType);
				}
				break;
			default:
				break;
		}
		li.appendChild(valueInput);
		mui('.mui-input-clear').input();
		mui('.mui-switch').switch();

		return li;
	};

	owner.genVarcharLiByConfig = function(item, editable) {
		if(editable && item.FCanScan) { return owner.genVarcharCanScanLiByConfig(item, editable); }
		var valueInput = document.createElement('input');
		valueInput.style.float = 'right';
		valueInput.type = 'text';
		valueInput.className = 'mui-input wg-row-text ' + (editable ? 'mui-input-clear' : '');
		if(editable) {
			valueInput.placeholder = '请输入' + item.FTitle;
		}
		valueInput.style.width = '60%';
		valueInput.setAttribute('name', item.FField);

		return valueInput;
	};

	owner.genVarcharCanScanLiByConfig = function(item, editable) {
		var valueInput = document.createElement('div');
		valueInput.className = 'wg-row-text';
		valueInput.style.float = 'left';
		valueInput.style.width = '60%';
		// 扫描按钮部分
		var buttonPart = document.createElement('a');
		buttonPart.type = 'a';
		buttonPart.className = 'wg-icon wg-icon-scan mui-icon-right-nav mui-pull-right';
		buttonPart.style.maxWidth = '20%';
		buttonPart.style.float = 'left';
		buttonPart.style.marginRight = '10px';
		buttonPart.style.marginTop = '9px';
		// 文本输入部分
		var inputPart = document.createElement('input');
		inputPart.style.float = 'left';
		inputPart.type = 'text';
		inputPart.className = 'mui-input wg-row-text ' + (editable ? 'mui-input-clear' : '');
		if(editable) {
			inputPart.placeholder = '请输入' + item.FTitle;
		}
		inputPart.style.width = '80%';
		inputPart.setAttribute('name', item.FField);

		valueInput.appendChild(inputPart);
		valueInput.appendChild(buttonPart);
		buttonPart.addEventListener('tap', function(event) { owner._inputScan(inputPart); });

		return valueInput;
	};

	owner.genIntLiByConfig = function(item, editable) {
		var valueInput = document.createElement('input');
		valueInput.style.float = 'right';
		valueInput.type = 'number';
		//valueInput.pattern = '/d*';
		valueInput.className = 'mui-input wg-row-text ' + (editable ? 'mui-input-clear' : '');
		if(editable) {
			valueInput.placeholder = '请输入' + item.FTitle;
		}
		valueInput.style.width = '60%';
		valueInput.setAttribute('name', item.FField);
		//		owner.extendNumberInput(valueInput);

		return valueInput;
	};

	owner.genPasswordLiByConfig = function(item, editable) {
		var valueInput = document.createElement('input');
		valueInput.style.float = 'right';
		valueInput.type = 'password';
		valueInput.className = 'mui-input wg-row-text ' + (editable ? 'mui-input-clear' : '');
		if(editable) {
			valueInput.placeholder = '请输入' + item.FTitle;
		}
		valueInput.style.width = '60%';
		valueInput.setAttribute('name', item.FField);

		return valueInput;
	};

	owner.genBitLiByConfig = function(item, editable) {
		var valueInput;
		if(editable) { // 可编辑时显示开关
			valueInput = document.createElement('div');
			valueInput.className = 'mui-switch';
			valueInput.innerHTML = '<div class = "mui-switch-handle" ></div>';
		} else { // 不可编辑时显示文字
			valueInput = document.createElement('input');
			valueInput.type = 'text';
			valueInput.className = 'mui-input wg-row-text wg-input-bit';
			valueInput.style.width = '60%';
		}
		valueInput.style.float = 'right';
		valueInput.setAttribute('name', item.FField);

		return valueInput;
	};

	owner.genPickLiByConfig = function(item, editable) {
		var valueInput = document.createElement('button');
		valueInput.style.float = 'right';
		valueInput.setAttribute('name', item.FField);
		valueInput.type = 'button';
		valueInput.className = 'mui-btn mui-btn-block wg-pick';
		valueInput.style.width = '60%';
		valueInput.style.border = 'none';
		valueInput.classList.add('wg-btn-placeHolder');
		//valueInput.style.textAlign = 'left';
		var title = '请选择' + item.FTitle;
		valueInput.placeholder = title;
		valueInput.innerHTML = title;
		if(editable && item.FSourceBinding) {
			valueInput.addEventListener('tap', function(event) {
				var whereCondition = undefined;
				BasicData.pickHandler(event, item.FSourceBinding, 'FName', 'value', item.FValueField, whereCondition);
			});
		}

		return valueInput;
	};

	owner.genInputPickLiByConfig = function(item, editable) {
		var valueInput = document.createElement('div');
		valueInput.className = 'wg-row-text wg-input-intPick';
		valueInput.style.float = 'right';
		valueInput.style.width = '60%';
		valueInput.setAttribute('name', item.FField);
		// 文本输入部分
		var inputPart = document.createElement('input');
		inputPart.className = 'mui-input';
		inputPart.setAttribute('name', item.FValueField);
		if(editable) {
			inputPart.placeholder = '请输入' + item.FTitle;
		}
		inputPart.style.width = '75%';
		// 选择按钮部分
		var buttonPart = document.createElement('button');
		buttonPart.type = 'button';
		buttonPart.innerText = '>';
		buttonPart.style.maxWidth = '20%';
		buttonPart.style.float = 'right';
		buttonPart.style.marginRight = '10px';
		buttonPart.style.marginTop = '5px';

		valueInput.appendChild(inputPart);
		valueInput.appendChild(buttonPart);

		return valueInput;
	};

	owner.genDateTimeLiByConfig = function(item, editable) {
		var optionsJson = item.options || '{}';
		var options = JSON.parse(optionsJson);
		var valueInput = document.createElement('button');
		valueInput.setAttribute('name', item.FField);
		valueInput.type = 'button';
		valueInput.style.float = 'right';
		valueInput.className = 'btn mui-btn mui-btn-block';
		valueInput.style.width = '60%';
		valueInput.style.border = 'none';
		valueInput.innerHTML = item.FMissingMessage;
		//valueInput.style.textAlign = 'left';
		if(editable) {
			valueInput.addEventListener('tap', function(event) {
				/*
				 * 首次显示时实例化组件
				 * 示例为了简洁，将 options 放在了按钮的 dom 上
				 * 也可以直接通过代码声明 optinos 用于实例化 DtPicker
				 */
				var picker = new mui.DtPicker(options);
				picker.show(function(rs) {
					/*
					 * rs.value 拼合后的 value
					 * rs.text 拼合后的 text
					 * rs.y 年，可以通过 rs.y.vaue 和 rs.y.text 获取值和文本
					 * rs.m 月，用法同年
					 * rs.d 日，用法同年
					 * rs.h 时，用法同年
					 * rs.i 分（minutes 的第二个字母），用法同年
					 */
					valueInput.innerText = rs.text;
					/* 
					 * 返回 false 可以阻止选择框的关闭
					 * return false;
					 */
					/*
					 * 释放组件资源，释放后将将不能再操作组件
					 * 通常情况下，不需要示放组件，new DtPicker(options) 后，可以一直使用。
					 * 当前示例，因为内容较多，如不进行资原释放，在某些设备上会较慢。
					 * 所以每次用完便立即调用 dispose 进行释放，下次用时再创建新实例。
					 */
					picker.dispose();
				});
			});
		}

		return valueInput;
	};

	owner.genDateLiByConfig = function(item, editable) {
		var d2;
		var now = new Date();
		d2 = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
		var valueInput = document.createElement('button');
		valueInput.setAttribute('name', item.FField);
		valueInput.type = 'button';
		valueInput.style.float = 'right';
		valueInput.className = 'mui-btn mui-btn-block wg-date wg-beginDate';
		valueInput.style.width = '60%';
		valueInput.style.border = 'none';
		//valueInput.style.textAlign = 'left';
		if(editable) {
			valueInput.addEventListener('tap', function(event) {
				CommonUtil.openDatePicker(this);
			});
		}

		return valueInput;
	};

	owner.genSearchLiByConfig = function(item, editable) {
		var valueInput = document.createElement('div');
		valueInput.className = 'wg-row-text wg-input-search';
		valueInput.style.float = 'right';
		valueInput.style.width = '60%';
		valueInput.setAttribute('name', item.FField);
		// 文本输入部分
		var inputPart = document.createElement('input');
		inputPart.type = 'text';
		inputPart.className = 'mui-input ';
		inputPart.setAttribute('name', item.FValueField);
		if(editable) {
			inputPart.placeholder = '请输入' + item.FTitle;
		}
		inputPart.style.width = '75%';
		// 选择按钮部分
		var buttonPart = document.createElement('button');
		buttonPart.type = 'button';
		buttonPart.innerText = '>';
		buttonPart.setAttribute('fieldname', item.FValueField);
		buttonPart.style.maxWidth = '20%';
		buttonPart.style.float = 'right';
		buttonPart.style.marginRight = '10px';
		buttonPart.style.marginTop = '5px';
		if(editable) {
			buttonPart.addEventListener('tap', function(event) {
				var whereCondition = undefined;
				SearchWindow.open(event, item.FSourceBinding, 'FName', 'value', item.FValueField, whereCondition, function(selected) {
					mui.trigger(valueInput, 'selectedChanged', {
						newData: selected
					});
				});
			});
		}

		valueInput.appendChild(inputPart);
		valueInput.appendChild(buttonPart);

		return valueInput;
	};

	owner.extendNumberInput = function(valueInput) {
		valueInput.value = 0;
		valueInput.setAttribute('oldValue', 0);
		valueInput.addEventListener('input', function(event) {
			if(/\d+/.test(this.value)) {
				valueInput.setAttribute('oldValue', this.value);
				//				console.log('match: ' + this.value);
			} else if(this.value == 0) {

			} else {
				var oldValue = valueInput.getAttribute('oldValue');
				//				console.log('oldValue: ' + oldValue);
				valueInput.value = oldValue;
				//				console.log('not match: ' + this.innerText);
			}
		});
		valueInput.addEventListener('change', function(event) {
			if(!(/\d+/.test(this.value)) || valueInput.value == '') {
				valueInput.setAttribute('oldValue', 0);
				valueInput.value = 0;
			}
		});
	};

	owner.setTagAttributeByConfig = function(valueInput, item, editable, isPost, showType) {
		if(valueInput) {
			valueInput.setAttribute('data-type', item.FType);
			if(showType == ShowType.Add) { // 新增
				if(item.FHiddenInAdd || item.FIsShow == false) {
					valueInput.style.display = 'none';
				}
				editable = item.FIsAddable;
				isPost = item.FIsAddPost;
			} else if(showType == ShowType.Edit) { // 编辑
				if(item.FHiddenInEdit || item.FIsShow == false) {
					valueInput.style.display = 'none';
				}
				editable = item.FIsEditable;
				isPost = item.FIsEditPost;
			}
			if(!editable) {
				valueInput.readOnly = 'readonly';
				valueInput.disabled = 'disabled';
				valueInput.style.textAlign = 'right';
				//valueInput.classList.add('wg-list-col2');
			} else {
				valueInput.style.textAlign = 'left';
			}
			valueInput.setAttribute('isPost', isPost);
			if(item.FRequired) {
				valueInput.setAttribute('required', 'required');
				valueInput.setAttribute('missingMessage', item.FMissingMessage ? item.FMissingMessage : (item.FTitle + '不能为空'));
			}
			if(item.FValidateType) {
				valueInput.setAttribute('validType', item.FValidateType);
				valueInput.setAttribute('invalidMessage', item.FInvalidMessage);
			}
			if(item.FDefaultValue) {
				valueInput.innerText = item.FDefaultValue;
			}
			valueInput.setAttribute('FFormatter', item.FFormatter);
			valueInput.setAttribute('FGroupNumber', item.FGroupNumber);
			valueInput.setAttribute('FOrder', item.FOrder);
		}

		return valueInput;
	};

	owner.setTagAnabled = function(valueInput, editable) {
		if(!editable) {
			valueInput.readOnly = 'readonly';
			valueInput.disabled = 'disabled';
			valueInput.style.textAlign = 'right';
			//valueInput.classList.add('wg-list-col2');
		} else {
			valueInput.readOnly = false;
			valueInput.disabled = false;
			valueInput.style.textAlign = 'left';
		}
	};

	owner.setSearcherStatus = function(fieldName, editable) {
		var valueInput = document.querySelector('input[name="' + fieldName + '"]');
		var selectButton = document.querySelector('button[fieldname="' + fieldName + '"]');
		if(!editable) {
			valueInput.readOnly = 'readonly';
			valueInput.disabled = 'disabled';
			valueInput.style.textAlign = 'left';
			valueInput.style.width = '100%';
			selectButton.style.display = 'none';
		} else {
			valueInput.readOnly = false;
			valueInput.disabled = false;
			valueInput.style.textAlign = 'left';
		}
	};

	//	owner.getPickWhereCondition = function(item) {
	//		var whereCondition = item.FWhereCondition;
	//		if(whereCondition) {
	//			var whereValueFields = item.FWhereValue.split(',');
	//			whereValues = [];
	//			mui.each(whereValueFields, function(index, element) {
	//				var whereValueElement = document.querySelector('[name="' + element.trim() + '"]');
	//				if(!whereValueElement) {
	//					whereValues.push('');
	//				} else {
	//					whereValues.push(whereValueElement.value);
	//				}
	//			});
	//			whereCondition = whereCondition.format(whereValues);
	//		}
	//		return whereCondition;
	//	};

	/**
	 * 通过标签的name属性需找标签并为其赋值
	 * @param {Object} name
	 * @param {Object} value
	 */
	owner.setTagValueByName = function(name, value) {
		mui.each(document.querySelectorAll('[name = ' + name + ']'), function(index, element) {
			var oldValue;
			if(element.classList.contains('mui-input')) {
				oldValue = element.value;
				element.value = value;
			} else if(element.nodeName.toLowerCase() == 'div') {
				oldValue = element.innerHTML;
				element.innerHTML = value;
			} else if(element.nodeName.toLowerCase() == 'span') {
				oldValue = element.innerHTML;
				element.innerHTML = value;
			} else if(element.nodeName.toLowerCase() == 'button') {
				oldValue = element.innerHTML;
				element.innerHTML = value;
			}
			var newValue = value;
			if(newValue != oldValue) {
				// 触发相关控件的change事件
				mui.trigger(element, 'change');
			}
		});
	};

	owner.refreshData = function(data) {
		mui.each(data, function(index, item) {
			var ele = document.getElementById(index);
			if(ele) {
				var v = item;
				var fFormatter = ele.getAttribute('FFormatter');
				if(fFormatter) {
					if(eval('(' + fFormatter + ')') && (item || item == 0)) {
						v = eval('(' + fFormatter + '("' + item + '"))');
					}
				}
				ele.innerHTML = v;

			} else { //CommonUtil.print("该属性被抛弃：" + index)
			}
		});
	};

	owner._inputScan = function(element) {
		var scanFunction = function(result, file) {
			element.value = result;
		};
		NativeUtil.Scan(scanFunction);
	};

	//	owner.genRadioLi = function(title, r1c1, r1c2, r2c1, r2c2, r3c1, r3c2) {
	//		var liRows = 1;
	//		if(r1c1 || r1c2) {
	//			liRows++;
	//		}
	//		if(r2c1 || r2c2) {
	//			liRows++;
	//		}
	//		if(r3c1 || r3c2) {
	//			liRows++;
	//		}
	//		var li = document.createElement('li');
	//		li.className = 'mui-table-view-cell mui-radio mui-left';
	//		var sInnerHTML = '';
	//		// 左侧图标
	//		sInnerHTML += '<input name="radio" type="radio" style="padding: ' + (4 + 7.2 * (liRows - 1)) + 'px 15px 15px 0px;">';
	//		sInnerHTML += '<div class="wg-menuitemlabel wg-list-content" style="float: left; ">';
	//		// 顶部标题
	//		sInnerHTML += '<div class="wg-list-title">';
	//		sInnerHTML += title;
	//		sInnerHTML += '</div>';
	//		// 第1行
	//		sInnerHTML += '<div class="wg-list-desc">';
	//		sInnerHTML += r1c1 + (r1c2 ? ('<div style="float:right">' + r1c2 + '</div>') : '');
	//		sInnerHTML += '</div>';
	//		// 第2行
	//		sInnerHTML += '<div class="wg-list-desc">';
	//		sInnerHTML += r2c1 + (r2c2 ? ('<div style="float:right">' + r2c2 + '</div>') : '');
	//		sInnerHTML += '</div>';
	//		// 第3行 
	//		sInnerHTML += '<div class="wg-list-desc">';
	//		sInnerHTML += r3c1 + (r3c2 ? ('<div style="float:right">' + r3c2 + '</div>') : '');
	//		sInnerHTML += '</div>';
	//		sInnerHTML += '</div>';
	//		// 右侧按钮
	//		// sInnerHTML += '<div style="float: right;"><a href="#" class="mui-icon mui-icon-forward" style="padding: 15px 0px 15px 5px;"></a></div>';
	//		li.innerHTML = sInnerHTML;
	//		return li;
	//	};

}(mui, window.GridColumnsUtil = {}));


/**
 * 排序方法
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	owner.SortByGroup = function(a, b) {
		if(a.FGroupOrder == b.FGroupOrder) {
			return a.FOrder - b.FOrder;
		} else {
			return a.FGroupOrder - b.FGroupOrder;
		}
	};
}(mui, window.SortUtil = {}));