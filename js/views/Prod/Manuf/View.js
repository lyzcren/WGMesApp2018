(function($, owner) {

	owner.HeadColumns = null;

	owner.Buttons = [{
		title: "转序",
		callback: "Manuf_View.onTransferEventHandler"
	}, {
		title: "保存",
		callback: "Manuf_View.onSaveEventHandler"
	}, {
		title: "汇报",
		callback: "Manuf_View.onReportEventHandler"
	}, {
		title: "签收",
		callback: "Manuf_View.onSignEventHandler"
	}];

	owner.Self = null;
	owner.Main = null;
	// 保存列配置名称
	owner.SavedColumnKey = 'App_Manuf_Head';

	var mFInterID, mCurrentData, mCurrentDept, mCurrentDefect, mCurrentTechnic, mCurrentEmp;
	var mMode = GridColumnsMode.View,
		mFTransferType;

	var mColumns, mGroups, mDetails;
	var mCurrentButton;

	owner.plusready = function() {
		owner.Self = plus.webview.currentWebview();
		owner.Main = owner.Self.parent();
		owner.HeadColumns = owner.Self.saveHeadColumns;
		mMode = owner.Self.Mode;
		mFInterID = owner.Self.FInterID;
		if(!owner.HeadColumns) { // 参数列表中无HeadColumns时，直接从配置文件中读取，并重新计算
			SysObject.getGroupColumns(owner.SavedColumnKey, Manuf_ConfigColumns.HeadColumns, function(columns) {
				owner.HeadColumns = columns;
				owner.init();
			});
		} else {
			owner.init();
		}
	};

	owner.init = function() {
		//初始化配置列页面
		owner.initControl(owner.HeadColumns);
		//初始化基本事件，初始化基本事件的定义自定义事件RefreshData，加载数据
		owner.initEvent();
		if(mMode == GridColumnsMode.Edit) {
			owner.initElementEvent();
		}
		if(mFInterID) owner.refreshDataByFInterID(mFInterID);
	};

	owner.initControl = function() {
		//首先初始化mainBody的字段
		owner.initDetail(owner.HeadColumns);

		if(mMode == GridColumnsMode.Edit) {
			var bitmapHelper = new BitmapHelper();
			bitmapHelper.topMenu().attachRightFirst(owner.onShowMenuEventHandler);
		}
	};

	owner.initEvent = function() {
		//		document.addEventListener('showMenu', owner.onShowMenuEventHandler);
		if(mMode == GridColumnsMode.Edit) {
			document.addEventListener('changeDefect', owner.onChangeDefectEventHandler);
			document.addEventListener('deleteDefect', owner.onDeleteDefectEventHandler);
			document.addEventListener('changeTechnic', owner.onChangeTechnicEventHandler);
			document.addEventListener('deleteTechnic', owner.onDeleteTechnicEventHandler);
			document.addEventListener('changeEmp', owner.onChangeEmpEventHandler);
			document.addEventListener('deleteEmp', owner.onDeleteEmpEventHandler);
		}
	};

	owner.initElementEvent = function() {
		// 机台
		document.querySelector('[name="FLineNo"]').addEventListener('tap', function(event) {
			var fQueryString = {
				FDeptID: mCurrentData.FDeptID
			};
			BasicData.pickHandler(event, 'FLine', 'FLineNo', undefined, 'FLineID', fQueryString);
		});
		// 模具		
		document.querySelector('[name="FMoldName"]').addEventListener('tap', function(event) {
			var fQueryString = {
				FDeptID: mCurrentData.FDeptID,
				FLineID: mCurrentData.FLineID
			};
			BasicData.pickHandler(event, 'FMold', 'FMoldName', undefined, 'FMoldID', fQueryString);
		});

		document.querySelector('[name="FEmpName"]').addEventListener('selectedChanged', function(event) {
			var newData = event.detail.newData;
			mCurrentData.FEmpID = newData.FItemID;
			mCurrentData.FEmpNumber = newData.FNumber;
			mCurrentData.FName = newData.FFullName;
			if(newData.FNumber == 'MultiEmp') {
				owner.loadEmpList();
			} else {
				mCurrentEmp = [];
				GridColumnsUtil.removeDetail('#main', 'FDetail3');
			}
		});

		document.querySelector('[name="FCheckQty"]').addEventListener('change', function(event) {});
	};

	/*
	 * parame[Object] data 服务器保存的列配置
	 * 将配置列按Group及Order排序
	 */
	owner.initDetail = function(data) {
		var main = document.getElementById('main');
		main.innerHTML = '';
		// 将配置分成“分组”、“详情”与“字段”三组
		var splitData = GridColumnsUtil.SplitGroupAndColumns(data, 'FType');
		mColumns = splitData.columns; //要显示的字段
		mGroups = splitData.groups; //字段按组显示
		mDetails = splitData.details; //商品详情

		// 按配置的Group及Order排序
		GridColumnsUtil.SortColumnsByGroup(mColumns);
		//把字段mColumns按mGroups的分组追加到mainbody 
		if(mMode == GridColumnsMode.Edit) {
			GridColumnsUtil.appendEditColumns('#main', mColumns, mGroups);
		} else if(mMode == GridColumnsMode.View) {
			GridColumnsUtil.appendViewColumns('#main', mColumns, mGroups);
		}
	};

	// 打开列配置管理页面
	owner.onGridColumnEventHandler = function(event) {
		GridColumnsUtil.OpenGroupColumnWindow(owner.HeadColumns, owner.SavedColumnKey, ShowType.Detail, owner.reload);
	};

	owner.refreshDataByFInterID = function(fInterID) {
		var ajaxData = {
			FInterID: fInterID
		};
		var ajaxCallback = function(data) {
			if(data.FIsSuccess) {
				owner.refreshHeadData(data.FObject.Data);
				owner.refreshDept(data.FObject.Dept);
				owner.loadDefectList(data.FObject.DefectData);
				owner.loadTechnicList(data.FObject.TechnicData);
				//多操作员才显示操作员列表
				if(data.FObject.Data.FEmpNumber == "MultiEmp") {
					owner.loadEmpList(data.FObject.EmpData);
				}
			} else {
				mui.toast(data.FMsg);
			}
		};
		CommonUtil.ajax('/Prod/Manuf.asmx/GetHead', ajaxData, ajaxCallback);
	};

	owner.refreshHeadData = function(data) {
		mCurrentData = data;
		// APP中建议combobox(pick类型)的控件name与key分开，此处做特殊处理
		if(!!mCurrentData.FClassNoID) {
			mCurrentData.FClassNo = mCurrentData.FClassNoID;
		}
		owner.maskButtons(mCurrentData);
		mFInterID = mCurrentData.FInterID;
		FormUtil.SetData('#main', mCurrentData);
	};

	owner.refreshDept = function(data) {
		mCurrentDept = data;
	};

	owner.loadDefectList = function(details) {
		mCurrentDefect = details;
		// 总的不良数量
		var defectQty = 0;
		var detailUl = GridColumnsUtil.getDetailUl('#main', 'FDetail1', mDetails, true, mMode);
		if(mMode == GridColumnsMode.Edit) {
			owner.appendGroupTitleMenu(detailUl, function(e) {
				owner.showDefect();
			});
		}
		mui.each(details, function(index, element) {
			var li = GridColumnsUtil.genDetailLi(element.FDefectName, element.FDefectFullName, element.FQty, '', '', '', '');
			defectQty += element.FQty * 1;
			detailUl.querySelector('.mui-input-group').appendChild(li);
			li.addEventListener('tap', function() {
				owner.showDefect(element);
			});
		});
		// 更新表头不良数量及合格数量
		mCurrentData.FDefectQty = defectQty;
		mCurrentData.FPassQty = mCurrentData.FInputQty - defectQty;
		GridColumnsUtil.setTagValueByName('FDefectQty', defectQty);
		GridColumnsUtil.setTagValueByName('FPassQty', mCurrentData.FInputQty - defectQty);
	};

	owner.loadTechnicList = function(details) {
		mCurrentTechnic = details;
		var detailUl = GridColumnsUtil.getDetailUl('#main', 'FDetail2', mDetails, true, mMode);
		if(mMode == GridColumnsMode.Edit) {
			owner.appendGroupTitleMenu(detailUl, function(e) {
				owner.showTechnic();
				e.stopPropagation();
			});
		}
		mui.each(details, function(index, element) {
			var li = GridColumnsUtil.genDetailLi(element.FTechnicName, element.FTechnicNumber, element.FValue, '', '', '', '');
			detailUl.querySelector('.mui-input-group').appendChild(li);
			li.addEventListener('tap', function() {
				owner.showTechnic(element);
			});
		});
	};

	owner.loadEmpList = function(details) {
		mCurrentEmp = details ? details : [];
		// APP中建议combobox(pick类型)的控件name与key分开，此处做特殊处理
		if(!!mCurrentEmp.FClassNoID) {
			mCurrentEmp.FClassNo = mCurrentEmp.FClassNoID;
		}
		var detailUl = GridColumnsUtil.getDetailUl('#main', 'FDetail3', mDetails, true, mMode);
		if(mMode == GridColumnsMode.Edit) {
			owner.appendGroupTitleMenu(detailUl, function(e) {
				owner.showEmp();
				e.stopPropagation();
			});
		}
		mui.each(details, function(index, element) {
			var li = GridColumnsUtil.genDetailLi(element.FEmpName, '投入:' + element.FInputQty, '', '不良:' + element.FDefectQty, '合格:' + element.FPassQty, '', '');
			detailUl.querySelector('.mui-input-group').appendChild(li);
			li.addEventListener('tap', function() {
				owner.showEmp(element);
			});
		});
	};

	owner.appendGroupTitleMenu = function(detailUl, callback) {
		var btnAdd = 'btnSelect_' + detailUl.getAttribute('name');
		if(!document.getElementById(btnAdd)) {
			detailUl.querySelector('.wg-table-view-title').innerHTML +=
				'<div style="float: right;">' +
				'<a id="' + btnAdd + '" class="mui-icon mui-icon-plusempty" style="margin-right:20px; padding-right: 10px; padding-left: 10px;"></a>' +
				'</div>';
			// 新增按钮事件
			document.getElementById(btnAdd).addEventListener('tap', callback);
		}
	};

	owner.showDefect = function(item) {
		WebviewManager.openPageById('Manuf_View_Defect', {
			data: item,
			Mode: mMode,
			showMenu: mMode != GridColumnsMode.View
		});
	};

	owner.showTechnic = function(item) {
		WebviewManager.openPageById('Manuf_View_Technic', {
			data: item,
			FDeptID: mCurrentData.FDeptID,
			Mode: mMode,
			showMenu: mMode != GridColumnsMode.View
		});
	};

	owner.showEmp = function(item) {
		WebviewManager.openPageById('Manuf_View_Emp', {
			data: item,
			FDeptID: mCurrentData.FDeptID,
			Mode: mMode,
			showMenu: mMode != GridColumnsMode.View
		});
	};

	owner.onChangeDefectEventHandler = function(event) {
		var data = event.detail.data;
		var fDefectFullName = ArrayUtil.GetFieldValue(data, 'FDefectFullName');
		var fDefectName = ArrayUtil.GetFieldValue(data, 'FDefectName');
		var fDefectID = ArrayUtil.GetFieldValue(data, 'FDefectID');
		var fQty = ArrayUtil.GetFieldValue(data, 'FQty');
		var item = mCurrentDefect.selectFirstItemsByKey('FDefectID', fDefectID);
		if(item) {
			item.FQty = fQty;
		} else if(fDefectID) {
			mCurrentDefect.push({
				FDefectID: fDefectID,
				FDefectName: fDefectName,
				FDefectFullName: fDefectFullName,
				FQty: fQty
			});
		}
		owner.loadDefectList(mCurrentDefect);
	};

	owner.onDeleteDefectEventHandler = function(event) {
		var fDefectID = event.detail.FDefectID;
		mCurrentDefect.removeByKey('FDefectID', fDefectID);
		owner.loadDefectList(mCurrentDefect);
	};

	owner.onChangeTechnicEventHandler = function(event) {
		var data = event.detail.data;
		var fTechnicName = ArrayUtil.GetFieldValue(data, 'FTechnicName');
		var fTechnicID = ArrayUtil.GetFieldValue(data, 'FTechnicID');
		var fValue = ArrayUtil.GetFieldValue(data, 'FValue');
		var item = mCurrentTechnic.selectFirstItemsByKey('FTechnicID', fTechnicID);
		if(item) {
			item.FValue = fValue;
		} else if(fTechnicID) {
			mCurrentTechnic.push({
				FTechnicID: fTechnicID,
				FTechnicName: fTechnicName,
				FTechnicNumber: '',
				FValue: fValue
			});
		}
		owner.loadTechnicList(mCurrentTechnic);
	};

	owner.onDeleteTechnicEventHandler = function(event) {
		var fTechnicID = event.detail.FTechnicID;
		mCurrentTechnic.removeByKey('FTechnicID', fTechnicID);
		owner.loadTechnicList(mCurrentTechnic);
	};

	owner.onChangeEmpEventHandler = function(event) {
		var data = event.detail.data;
		var fEntryID = ArrayUtil.GetFieldValue(data, 'FEntryID');
		var fEmpName = ArrayUtil.GetFieldValue(data, 'FEmpName');
		var fEmpNumber = ArrayUtil.GetFieldValue(data, 'FEmpNumber');
		var fEmpID = ArrayUtil.GetFieldValue(data, 'FEmpID');
		var fClassNo = ArrayUtil.GetFieldValue(data, 'FClassNoID');
		var fLineNo = ArrayUtil.GetFieldValue(data, 'FLineNo');
		var fLineID = ArrayUtil.GetFieldValue(data, 'FLineID');
		var fMoldName = ArrayUtil.GetFieldValue(data, 'FMoldName');
		var fMoldID = ArrayUtil.GetFieldValue(data, 'FMoldID');
		var fInputQty = ArrayUtil.GetFieldValue(data, 'FInputQty');
		var fDefectQty = ArrayUtil.GetFieldValue(data, 'FDefectQty');
		var fPassQty = ArrayUtil.GetFieldValue(data, 'FPassQty');
		var item = mCurrentEmp.selectFirstItemsByKey('FEmpID', fEmpID);
		if(item) {
			item.FEmpID = fEmpID;
			item.FEmpName = fEmpName;
			item.FEmpNumber = fEmpNumber;
			item.FClassNo = fClassNo;
			item.FClassNoID = fClassNo;
			item.FLineNo = fLineNo;
			item.FLineID = fLineID;
			item.FMoldName = fMoldName;
			item.FMoldID = fMoldID;
			item.FInputQty = fInputQty;
			item.FDefectQty = fDefectQty;
			item.FPassQty = fPassQty;
		} else if(fEmpID) {
			mCurrentEmp.push({
				FEntryID: fEntryID,
				FEmpID: fEmpID,
				FEmpName: fEmpName,
				FEmpNumber: fEmpNumber,
				FClassNo: fClassNo,
				FClassNoID: fClassNo,
				FLineNo: fLineNo,
				FLineID: fLineID,
				FMoldName: fMoldName,
				FMoldID: fMoldID,
				FInputQty: fInputQty,
				FDefectQty: fDefectQty,
				FPassQty: fPassQty
			});
		}
		owner.loadEmpList(mCurrentEmp);
	};

	owner.onDeleteEmpEventHandler = function(event) {
		var fEmpID = event.detail.FEmpID;
		mCurrentEmp.removeByKey('FEmpID', fEmpID);
		owner.loadEmpList(mCurrentEmp);
	};

	owner.onShowMenuEventHandler = function() {
		plus.nativeUI.actionSheet({
			title: "选择操作",
			cancel: "取消",
			buttons: mCurrentButton
		}, function(e) {
			var index = e.index;
			if(index <= 0) { // 取消按钮
				//alert('取消');
			} else {
				// 取消按钮将插入在actionSheet的第一个，所以其他按钮应对应数组的位置+1
				eval(mCurrentButton[index - 1].callback + '()');
			}
		});
	};

	owner.onSignEventHandler = function(event) {
		wgyun.confirmYesNo("确定删除采购入库单？", function() {
			var ajaxData = {
				FInterID: mFInterID
			};
			var ajaxCallback = function(data) {
				mui.toast(data.FMsg);
				if(data.FIsSuccess) {
					owner.pulldownRefresh();
				}
			};
			CommonUtil.ajax('/Prod/Manuf.asmx/Sign', ajaxData, ajaxCallback);
		});

	};

	owner.onSaveEventHandler = function(event) {
		mFTransferType = 0;
		owner.transfer();
	};

	owner.onTransferEventHandler = function(event) {
		mFTransferType = 1;
		owner.transfer();
	};

	owner.onReportEventHandler = function(event) {
		mFTransferType = 2;
		owner.transfer();
	};

	owner.maskButtons = function(manuf) {
		//concat连接两个字符串
		//不能直接把owner.Buttons复制给mCurrentButton,是因为owner.Buttons是值类型
		//注意concat()返回的并不是调用函数的Array，而是一个新的Array，所以可以利用这一点进行复制
		mCurrentButton = owner.Buttons.concat();
		if(manuf.FStatus == 0 && mMode == GridColumnsMode.Edit) {
			if(manuf.FNextDeptID <= 0) {
				mCurrentButton.removeByKey('title', '转序');
				mCurrentButton.removeByKey('title', '签收');
			} else {
				mCurrentButton.removeByKey('title', '汇报');
				mCurrentButton.removeByKey('title', '保存');
				mCurrentButton.removeByKey('title', '签收');
			}
		} else {
			mCurrentButton.removeByKey('title', '汇报');
			mCurrentButton.removeByKey('title', '保存');
			mCurrentButton.removeByKey('title', '转序');
			mCurrentButton.removeByKey('title', '签收');
		}
	};

	owner.reload = function() {
		SysObject.getGroupColumns(owner.SavedColumnKey, owner.HeadColumns, function(columns) {
			owner.initDetail(columns); //初始化基本字段
			GridColumnsUtil.refreshData(mCurrentData); //给初始化的字段赋值
		});
	};

	owner.transfer = function() {
		//结束编辑
		FormUtil.endEdit();
		if(!FormUtil.ValidateForm('#main')) return;
		if(mCurrentData.FInputQty * 1 +
			mCurrentData.FChangeQty * 1 +
			mCurrentData.FAllocatedQty * 1 !=
			mCurrentData.FPassQty * 1 +
			mCurrentData.FDefectQty * 1 +
			mCurrentData.FTakeQty * 1 +
			mCurrentData.FRefundQty * 1) {
			mui.alert('必须满足以下公式：[合格数量]+[不良数量]+[取走数量]+[退货数量] = [投产数量]+[盈亏数量]+[批次调整数量]');
			return;
		}

		var strHead = FormUtil.GetObjectJSON('#main');
		var strEmp = owner.getEmp();
		var strDefect = owner.getDefect();
		var strTechnic = owner.getTechnic();
		strHead = FormUtil.AppendField2JSONString(strHead, 'FTransferType', mFTransferType);
		if(!strEmp || !strDefect || !strTechnic) {
			return;
		}
		if(mCurrentDept.FNeedClass && !ArrayUtil.GetFieldValue(strHead, 'FClassNoID')) {
			mui.toast('请输入班次!');
			return;
		}
		if(mCurrentDept.FNeedLine && !ArrayUtil.GetFieldValue(strHead, 'FLineID')) {
			mui.toast('请选择机台!');
			return;
		}
		if(mCurrentDept.FNeedQCNo && !ArrayUtil.GetFieldValue(strHead, 'FQCNo')) {
			mui.toast('请输入QC工号!');
			return;
		}
		if(mCurrentDept.FNeedQTNo && !ArrayUtil.GetFieldValue(strHead, 'FQTNo')) {
			mui.toast('请输入质检工号!');
			return;
		}
		if(mCurrentDept.FNeedEmp && !ArrayUtil.GetFieldValue(strHead, 'FEmpID')) {
			mui.toast('请选择操作员!');
			return;
		}
		if(mCurrentDept.FNeedDebugger && !ArrayUtil.GetFieldValue(strHead, 'FDebuggerID')) {
			mui.toast('请选择调机员!');
			return;
		}
		if(strEmp == '[]' && mCurrentData.FEmpName == "MultiEmp_多操作员") {
			mui.toast('选择多操作员时，操作员列表不能为空!');
			return;
		}
		var ajaxData = {
			Head: strHead,
			Emp: strEmp,
			Defect: strDefect,
			Technic: strTechnic
		};
		var ajaxCallback = function(data) {
			mui.toast(data.FMsg);
			if(data.FIsSuccess) {
				if(mFTransferType == 0) {
					owner.refreshDataByFInterID(data.FInterID);
				} else {
					owner.view(data.FInterID);
				}
			}
		};
		CommonUtil.ajax('/Prod/Manuf.asmx/Transfer', ajaxData, ajaxCallback);
	};

	owner.getEmp = function() {
		var rows = mCurrentEmp;
		var lstDetail = [];
		var bIsValidate = true,
			iRowCount = 0,
			iEntryID = 1;
		var bValidate = true;
		var mTotalInputQty = 0;
		var mTotalPassQty = 0;
		var TotalDefectQty = 0;
		mui.each(rows, function(index, row) {
			if(row.FEmpID > 0 && row.FInputQty <= 0) {
				mui.toast('第' + (index + 1) + '行: 选择了多操作员但未录入投入数量');
				bValidate = false;
				return false;
			} else if(row.FEmpID > 0 && row.FPassQty <= 0) {
				// 存在选择了不良类型但未输入数量时，返回空
				mui.toast('第' + (index + 1) + '行: 选择了多操作员但未录入合格数量');
				bValidate = false;
				return false;
			} else if(row.FEmpID > 0 && row.FPassQty > row.FInputQty) {
				// 存在选择了不良类型但未输入数量时，返回空
				mui.toast('第' + (index + 1) + '行: 同一操作员生产的合格数量大于投入数量');
				bValidate = false;
				return false;
			} else if(row.FEmpID < 0 && row.FInputQty > 0) {
				// 存在选择了不良类型但未输入数量时，返回空
				mui.toast('第' + (index + 1) + '行: 录入了投入数量但未选择操作员');
				bValidate = false;
				return false;
			} else if(row.FEmpID < 0 && row.FPassQty > 0) {
				// 存在选择了不良类型但未输入数量时，返回空
				mui.toast('第' + (index + 1) + '行: 录入了合格数量但未选择操作员');
				bValidate = false;
				return false;
			} else if(index > 0 && rows[index - 1].FEmpID == row.FEmpID) {
				mui.toast('不能选择相同的操作员');
				bValidate = false;
				return false;
			}
			if(row.FEmpID > 0) {
				var strDetails = '';
				strDetails = FormUtil.AppendField2JSONString(strDetails, 'FInterID', mCurrentData.FInterID);
				strDetails = FormUtil.AppendField2JSONString(strDetails, 'FEntryID', iEntryID);
				strDetails = FormUtil.AppendField2JSONString(strDetails, 'FEmpID', row.FEmpID);
				strDetails = FormUtil.AppendField2JSONString(strDetails, 'FLineID', row.FLineID);
				strDetails = FormUtil.AppendField2JSONString(strDetails, 'FMoldID', row.FMoldID);
				strDetails = FormUtil.AppendField2JSONString(strDetails, 'FClassNoID', row.FClassNoID);
				strDetails = FormUtil.AppendField2JSONString(strDetails, 'FInputQty', row.FInputQty);
				strDetails = FormUtil.AppendField2JSONString(strDetails, 'FPassQty', row.FPassQty);
				strDetails = FormUtil.AppendField2JSONString(strDetails, 'FDefectQty', row.FDefectQty);
				lstDetail.push(strDetails);

				mTotalInputQty += row.FInputQty * 1;
				mTotalPassQty += row.FPassQty * 1;
				TotalDefectQty += row.FDefectQty * 1;
			}
			iEntryID += 1;
			iRowCount++;
		});
		if(mTotalInputQty > 0 && mTotalPassQty > 0) {
			if(mCurrentData.FInputQty != mTotalInputQty) {
				// 存在选择了不良类型但未输入数量时，返回空
				mui.toast('多操作员的[投入数量]之和(' + FormatUtil.QtyCell(+mTotalInputQty) + ')不等于[投产数量](' + FormatUtil.QtyCell(+mCurrentData.FInputQty) + ')!');
				bValidate = false;
				return false;
			}
			if(mCurrentData.FDefectQty != TotalDefectQty) {
				// 存在选择了不良类型但未输入数量时，返回空
				mui.toast('多操作员的[不良数量之和](' + FormatUtil.QtyCell(+TotalDefectQty) + ')不等于[总不良数量](' + FormatUtil.QtyCell(+mCurrentData.FDefectQty) + ')!');
				bValidate = false;
				return false;
			}
			if(mCurrentData.FPassQty != mTotalPassQty) {
				// 存在选择了不良类型但未输入数量时，返回空
				mui.toast('多操作员的[合格数量之和](' + FormatUtil.QtyCell(+mTotalPassQty) + ')不等于[总合格数量](' + FormatUtil.QtyCell(+mCurrentData.FPassQty) + ')!');
				bValidate = false;
				return false;
			}
		}

		if(!bValidate) {
			return '';
		} else {
			strDetails = '[' + lstDetail.join(',') + ']';
			return strDetails;
		}
	};

	owner.getDefect = function() {
		var rows = mCurrentDefect;
		var lstDetail = [];
		var bValidate = true;
		mui.each(rows, function(index, row) {
			if(row.FDefectID > 0) {
				if(row.FQty > 0) {
					var strDetails = '';
					strDetails = FormUtil.AppendField2JSONString(strDetails, 'FInterID', mCurrentData.FInterID);
					strDetails = FormUtil.AppendField2JSONString(strDetails, 'FDefectID', row.FDefectID);
					strDetails = FormUtil.AppendField2JSONString(strDetails, 'FQty', row.FQty);
					lstDetail.push(strDetails);
				} else {
					// 存在选择了不良类型但未输入数量时，返回空
					mui.toast('第' + (index + 1) + '行: 选择了不良类型但未录入数量');
					bValidate = false;
					return true;
				}
			} else if(row.FQty > 0) {
				// 存在选择了不良类型但未输入数量时，返回空
				mui.toast('第' + (index + 1) + '行: 录入数量但未选择不良类型');
				bValidate = false;
				return true;
			}
		});
		if(!bValidate) {
			return '';
		} else {
			strDetails = '[' + lstDetail.join(',') + ']';
			return strDetails;
		}
	};

	owner.getTechnic = function() {
		var rows = mCurrentTechnic;
		var lstDetail = [];
		var bValidate = true;
		mui.each(rows, function(index, row) {
			if(row.FTechnicID > 0) {
				if(row.FValue) {
					var strDetails = '';
					strDetails += strDetails ? ',' : '';
					strDetails = FormUtil.AppendField2JSONString(strDetails, 'FInterID', mCurrentData.FInterID);
					strDetails = FormUtil.AppendField2JSONString(strDetails, 'FTechnicID', row.FTechnicID);
					strDetails = FormUtil.AppendField2JSONString(strDetails, 'FIsNeed', row.FIsNeed);
					strDetails = FormUtil.AppendField2JSONString(strDetails, 'FValue', row.FValue);
					lstDetail.push(strDetails);
				} else if(row.FIsNeed) {
					// 存在选择了不良类型但未输入数量时，返回空
					mui.toast('第' + (index + 1) + '行: 参数值必录!');
					bValidate = false;
					return true;
				}
			}
		});
		if(!bValidate) {
			return '';
		} else {
			strDetails = '[' + lstDetail.join(',') + ']';
			return strDetails;
		}
	};

	owner.view = function(fInterID) {
		mMode = GridColumnsMode.View;
		mFInterID = fInterID;

		owner.init();
	};

}(mui, window.Manuf_View = {}));

var oTarget = Manuf_View;