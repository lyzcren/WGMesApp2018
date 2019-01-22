(function($, owner) {
	/**
	 * 选择器
	 */
	var l1Pickers = [];
	var l2Pickers = [];
	var l1Picker = null; // 一级
	var l2Picker = null; // 二级
	var l1PickType = null;
	var l2PickType = null;
	var searchTexts = {};

	owner.pickHandler = function(event, fSearchType, fSearchField, fValueField, fValueSelector, fQueryString) {
		var tPicker = null,
			tl1Type = false,
			tl2Type = false;
		fSearchField = (fSearchField ? fSearchField : 'FName');
		fValueField = (fValueField ? fValueField : 'value'); // 默认取显示文本value, value为可选
		var url = '',
			sTitle = '';
		switch(fSearchType) {
			case 'Customer':
				tl2Type = true;
				url = '/Basic/Customer.asmx/GetList';
				if(!l2Pickers['Customer']) {
					l2Picker = new mui.PopPicker({
						layer: 2
					});
					l2Pickers['Customer'] = l2Picker;
				}
				sTitle = '客户选择';
				tPicker = l2Pickers['Customer'];

				break;
			case 'TargetDept':
				tl1Type = true;
				url = '/Basic/Dept.asmx/GetComboList';
				tPicker = l1Picker;
				if(!l1Pickers['TargetDept']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['TargetDept'] = l1Picker;
				}
				sTitle = '部门选择';
				tPicker = l1Pickers['TargetDept'];

				break;
			case 'FEmp':
				fSearchField = 'FFullName';
				tl1Type = true;
				url = '/Basic/Emp.asmx/GetComboList';
				tPicker = l1Picker;
				if(!l1Pickers['FEmp']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['FEmp'] = l1Picker;
				}
				sTitle = '操作员选择';
				tPicker = l1Pickers['FEmp'];

				break;
			case 'FDebugger':
				fSearchField = 'FFullName';
				tl1Type = true;
				url = '/Basic/Emp.asmx/GetDebuggerComboList';
				tPicker = l1Picker;
				if(!l1Pickers['FDebugger']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['FDebugger'] = l1Picker;
				}
				sTitle = '调机员选择';
				tPicker = l1Pickers['FDebugger'];

				break;
			case 'FLine':
				fSearchField = 'FLineNo';
				tl1Type = true;
				url = '/Basic/Line.asmx/GetComboList';
				tPicker = l1Picker;
				if(!l1Pickers['FLine']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['FLine'] = l1Picker;
				}
				sTitle = '机台选择';
				tPicker = l1Pickers['FLine'];

				break;
			case 'FMold':
				fSearchField = 'FMoldName';
				tl1Type = true;
				url = '/Basic/LineMold.asmx/GetComboList';
				tPicker = l1Picker;
				if(!l1Pickers['FMold']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['FMold'] = l1Picker;
				}
				sTitle = '模具选择';
				tPicker = l1Pickers['FMold'];

				break;
			case 'FDefectFullName':
				tl1Type = true;
				url = '/Basic/Defect.asmx/GetComboList';
				tPicker = l1Picker;
				if(!l1Pickers['FDefectFullName']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['FDefectFullName'] = l1Picker;
				}
				sTitle = '不良选择';
				tPicker = l1Pickers['FDefectFullName'];

				break;
			case 'FTechnic':
				tl1Type = true;
				url = '/Basic/ProcessParam.asmx/GetComboList';
				tPicker = l1Picker;
				if(!l1Pickers['FTechnic']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['FTechnic'] = l1Picker;
				}
				sTitle = '工艺参数选择';
				tPicker = l1Pickers['FTechnic'];

				break;
			case 'FTechnicValue':
				tl1Type = true;
				url = '/Basic/Technic.asmx/GetComboList';
				tPicker = l1Picker;
				if(!l1Pickers['FTechnicValue']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['FTechnicValue'] = l1Picker;
				}
				sTitle = '参数值选择';
				tPicker = l1Pickers['FTechnicValue'];

				break;
			case 'FManufStatus':
				tl1Type = true;
				var statusArray = [];
				statusArray.push({
					value: 0,
					text: '生产中'
				});
				statusArray.push({
					value: -1,
					text: '待签收'
				});
				statusArray.push({
					value: 1,
					text: '待下工序签收'
				});
				statusArray.push({
					value: 2,
					text: '完成'
				});
				url = statusArray;
				tPicker = l1Picker;
				if(!l1Pickers['FManufStatus']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['FManufStatus'] = l1Picker;
				}
				sTitle = '状态选择';
				tPicker = l1Pickers['FManufStatus'];

				break;
			case 'FFlowStatus':
				tl1Type = true;
				var statusArray = [];
				statusArray.push({
					value: 0,
					text: '待生产'
				});
				statusArray.push({
					value: -1,
					text: '所有'
				});
				statusArray.push({
					value: 1,
					text: '生产中'
				});
				statusArray.push({
					value: 2,
					text: '待汇报'
				});
				statusArray.push({
					value: 3,
					text: '完成'
				});
				url = statusArray;
				tPicker = l1Picker;
				if(!l1Pickers['FFlowStatus']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['FFlowStatus'] = l1Picker;
				}
				sTitle = '状态选择';
				tPicker = l1Pickers['FFlowStatus'];

				break;
			case 'FClassNoID':
				tl1Type = true;
				fSearchField = 'FName';
				url = '/Basic/ClassNo.asmx/GetComboList';
				tPicker = l1Picker;
				if(!l1Pickers['FClassNoID']) {
					l1Picker = new mui.PopPicker();
					l1Pickers['FClassNoID'] = l1Picker;
				}
				sTitle = '班次选择';
				tPicker = l1Pickers['FClassNoID'];

				break;
		}
		if(tPicker) {
			tPicker.setTitle(sTitle);
			if(tl2Type && fSearchType != l2PickType) {
				l2PickType = fSearchType;
				owner.setPickData(tPicker, url, fSearchField, (searchTexts[fSearchType] != undefined ? searchTexts[fSearchType] : ''), fQueryString);
			} else if(tl1Type && fSearchType != l2PickType) {
				l1PickType = fSearchType;
				owner.setPickData(tPicker, url, fSearchField, (searchTexts[fSearchType] != undefined ? searchTexts[fSearchType] : ''), fQueryString);
			}
			var oldValue = event.target.getAttribute('fValue');
			tPicker.show(function(items) {
					var maxIndex = items.length - 1;
					if(items.length >= maxIndex && (items[maxIndex][fValueField] != null && items[maxIndex][fValueField] != undefined)) {
						// 移除placeHolder
						event.target.classList.remove('wg-btn-placeHolder');
						event.target.innerHTML = items[maxIndex].text;
						event.target.setAttribute('fValue', items[maxIndex][fValueField]);
						var newValue = event.target.getAttribute('fValue');
						if(newValue != oldValue) {
							// 触发控件的自定义事件 selectedChanged
							mui.trigger(event.target, 'selectedChanged', {
								newData: items[maxIndex].data
							});
						}
						// 设置指定控件的值
						mui.each(fValueSelector.split(','),
							function(index, element) {
								mui('[name = ' + element + ']').each(function(index, item) {
									if(item.classList.contains('mui-input')) {
										item.value = items[maxIndex][fValueField];
									} else if(item.nodeName.toLowerCase() == 'div') {
										item.innerHTML = items[maxIndex][fValueField];
									}
									if(newValue != oldValue) {
										// 触发相关控件的change事件
										mui.trigger(item, 'change', {
											oldValue: oldValue,
											newValue: newValue
										});
									}
								});
							});
					} else {
						mui.toast('当前选择无效，请尝试选择其他项!');
					}
					//返回 false 可以阻止选择框的关闭
					//return false;
				},
				function(value) {
					searchTexts[fSearchType] = value;
					owner.setPickData(tPicker, url, fSearchField, value, fQueryString);
				});
		}
	};

	owner.setPickData = function(picker, fSearchUrl, field, value, fQueryString) {
		// 客户端定义数据源
		if(typeof(fSearchUrl) != 'string') {
			if(value) {
				var searchedData = [];
				mui.each(fSearchUrl, function(index, item) {
					if(item.text.indexOf(value) > -1) {
						searchedData.push(item);
					}
				});
				picker.setData(searchedData);
			} else {
				picker.setData(fSearchUrl);
			}
		} else { // 从服务器获取基础数据源
			wgyun.showWaiting();
			var ajaxData = {
				field: field,
				value: value
			};
			ajaxData = wgyun.JsonExtend(fQueryString, ajaxData, true);
			var ajaxCallback = function(data) {
				if(data.FIsSuccess) {
					picker.setData(data.FObject);
				} else {
					picker.setData([]);
					mui.toast(data.FMsg);
				}
				wgyun.closeWaiting();
			};
			CommonUtil.ajax(fSearchUrl, ajaxData, ajaxCallback);
		}
	};

	owner.domainPickHandler = function(event, dataSource, pickID, title, fValueSelector) {
		var tPicker = null,
			tl1Type = false,
			tl2Type = false;
		var fSearchField = 'text';
		var fValueField = 'value'; // 默认取显示文本text, value为可选
		var sTitle = '';
		if(mui.isArray(dataSource)) {
			tl1Type = true;
			if(!l1Pickers[pickID]) {
				l1Picker = new mui.PopPicker();
				l1Pickers[pickID] = l1Picker;
			}
			sTitle = title;
			tPicker = l1Pickers[pickID];
		}
		if(tPicker) {
			tPicker.setTitle(sTitle);
			if(tl2Type && dataSource != l2PickType) {
				l2PickType = dataSource;
				owner.setPickData(tPicker, dataSource, fSearchField, '');
			} else if(tl1Type && dataSource != l2PickType) {
				l1PickType = dataSource;
				owner.setPickData(tPicker, dataSource, fSearchField, '');
			}
			var oldValue = event.target.getAttribute('fValue');
			tPicker.show(function(items) {
					if(items != null && items.length > 0 && items[0][fValueField] != undefined) {
						var value = items[0][fValueField];
						event.target.setAttribute('fValue', value);
						var newValue = event.target.getAttribute('fValue');
						// 触发控件的自定义事件 selectedChanged
						mui.trigger(event.target, 'selectedChanged', {
							newData: items[0].data
						});
						// 设置指定控件的值
						mui.each(fValueSelector.split(','),
							function(index, element) {
								mui('[name = ' + element + ']').each(function(index, item) {
									if(item.classList.contains('mui-input')) {
										item.value = value;
									} else if(item.nodeName.toLowerCase() == 'div') {
										item.innerHTML = value;
									} else if(item.tagName === 'input') {
										item.value = value;
									}
									// 触发相关控件的change事件
									mui.trigger(item, 'change', {
										oldValue: oldValue,
										newValue: newValue
									});
								});
							});
					} else {
						mui.toast('当前选择无效，请尝试选择其他项!');
					}
					//返回 false 可以阻止选择框的关闭
					//return false;
				},
				function(value) {
					console.log(value);
					owner.setPickData(tPicker, dataSource, fSearchField, value);
				});
		}
	};
}(mui, window.BasicData = {}));