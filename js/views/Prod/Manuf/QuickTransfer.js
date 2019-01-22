(function($, owner) {
	owner.Self = null;
	owner.Main = null;

	var mFInterID, mCurrentData = {},
		mCurrentEmp, mCurrentDept;
	var loacalPara = 'QuickTransferDefaultPara';

	var VueMain = new Vue({
		el: '#main',
		data: {
			FBatchNo: '',
			FProductName: '',
			FModel: '',
			FInputQty: '',
			FPassQty: '',
			FDeptID: 0,
			FDeptFullName: '',
			FEmpID: 0,
			FEmpName: '',
			FClassNoID: 0,
			FClassNo: '',
			FLineID: 0,
			FLineNo: '',
			FMoldID: 0,
			FMoldName: ''
		},
		computed: {
			FShowInputQty: function() {
				return FormatUtil.QtyCell(this.FInputQty, 2);
			},
			FShowPassQty: function() {
				return FormatUtil.QtyCell(this.FPassQty, 2);
			}
		}
	});

	owner.plusready = function() {
		owner.Self = plus.webview.currentWebview();
		owner.Main = owner.Self.parent();
		mFInterID = owner.Self.FInterID;
		owner.init();
	};

	owner.init = function() {
		owner.initControl();
		owner.initData();
		//初始化基本事件
		owner.initEvent();
		owner.initElementEvent();
	};

	owner.initControl = function() {
		var bitmapHelper = new BitmapHelper();
		bitmapHelper.moreMenu().attachRightFirst(owner.onShowMoreEventHandler);

	};

	owner.initEvent = function() {};

	owner.initElementEvent = function() {
		document.getElementById('FEmpName').addEventListener('tap', function(event) {
			var fQueryString = {};
			BasicData.pickHandler(event, 'FEmp', 'FEmpName', undefined, 'FEmpID', fQueryString);
		});
		document.getElementById('FClassNo').addEventListener('tap', function(event) {
			var fQueryString = {};
			BasicData.pickHandler(event, 'FClassNoID', 'FClassNo', undefined, 'FClassNoID', fQueryString);
		});
		// 机台
		document.getElementById('FLineNo').addEventListener('tap', function(event) {
			var fQueryString = {
				FDeptID: VueMain.FDeptID
			};
			BasicData.pickHandler(event, 'FLine', 'FLineNo', undefined, 'FLineID', fQueryString);
		});
		// 模具
		document.getElementById('FMoldName').addEventListener('tap', function(event) {
			var fQueryString = {
				FDeptID: VueMain.FDeptID,
				FLineID: VueMain.FLineID
			};
			BasicData.pickHandler(event, 'FMold', 'FMoldName', undefined, 'FMoldID', fQueryString);
		});
		document.getElementById('btnTransfer').addEventListener('tap', owner.Transfer);
	};

	owner.initData = function() {
		if(mFInterID) owner.refreshDataByFInterID(mFInterID);
		var localSaveData = wgyun.getLocalValue(loacalPara, {});
		if(localSaveData.FEmpID) {
			CommonUtil.ajax('/Basic/Emp.asmx/Get', {
				id: localSaveData.FEmpID
			}, function(data) {
				if(data.FIsSuccess && data.FObject) {
					VueMain.FEmpID = data.FObject.FItemID;
					VueMain.FEmpName = data.FObject.FName;
				}
			});
		}
		if(localSaveData.FClassNoID) {
			CommonUtil.ajax('/Basic/ClassNo.asmx/Get', {
				id: localSaveData.FClassNoID
			}, function(data) {
				if(data.FIsSuccess && data.FObject) {
					VueMain.FClassNoID = data.FObject.FItemID;
					VueMain.FClassNo = data.FObject.FName;
				}
			});
		}
		if(localSaveData.FLineID) {
			CommonUtil.ajax('/Basic/Line.asmx/Get', {
				id: localSaveData.FLineID
			}, function(data) {
				if(data.FIsSuccess && data.FObject) {
					VueMain.FLineID = data.FObject.FItemID;
					VueMain.FLineNo = data.FObject.FLineNo;
				}
			});
		}
		if(localSaveData.FMoldID) {
			CommonUtil.ajax('/Basic/LineMold.asmx/Get', {
				id: localSaveData.FMoldID
			}, function(data) {
				if(data.FIsSuccess && data.FObject) {
					VueMain.FMoldID = data.FObject.FItemID;
					VueMain.FMoldName = data.FObject.FName;
				}
			});
		}

	};

	owner.onShowMoreEventHandler = function() {
		var data = {
			Mode: GridColumnsMode.Edit,
			FInterID: mFInterID
		};
		mAddPage = WebviewManager.openPageById('Manuf_View', data);
	};

	owner.view = function(fInterID) {
		var data = {
			Mode: GridColumnsMode.View,
			FInterID: mFInterID
		};
		mViewPage = WebviewManager.openPageById('Manuf_View', data);
	};

	owner.refreshDataByFInterID = function(fInterID) {
		var ajaxData = {
			FInterID: fInterID
		};
		var ajaxCallback = function(data) {
			if(data.FIsSuccess) {
				mCurrentDept = data.FObject.Dept;
				VueMain.FBatchNo = data.FObject.Data.FBatchNo;
				VueMain.FProductName = data.FObject.Data.FProductName;
				VueMain.FModel = data.FObject.Data.FModel;
				VueMain.FInputQty = data.FObject.Data.FInputQty;
				VueMain.FPassQty = data.FObject.Data.FPassQty;
				VueMain.FDeptID = data.FObject.Data.FDeptID;
				VueMain.FDeptFullName = data.FObject.Data.FDeptFullName;
			} else {
				mui.toast(data.FMsg);
			}
		};
		CommonUtil.ajax('/Prod/Manuf.asmx/GetHead', ajaxData, ajaxCallback);

	};

	owner.Transfer = function() {
		if(mCurrentDept.FNeedClass && !VueMain.FClassNoID) {
			mui.toast('请输入班次!');
			return;
		}
		if(mCurrentDept.FNeedLine && !VueMain.FLineID) {
			mui.toast('请选择机台!');
			return;
		}
		if(mCurrentDept.FNeedQCNo && !VueMain.FQCNo) {
			mui.toast('请输入QC工号!');
			return;
		}
		if(mCurrentDept.FNeedQTNo && !VueMain.FQTNo) {
			mui.toast('请输入质检工号!');
			return;
		}
		if(mCurrentDept.FNeedEmp && !VueMain.FEmpID) {
			mui.toast('请选择操作员!');
			return;
		}
		if(mCurrentDept.FNeedDebugger && !VueMain.FDebuggerID) {
			mui.toast('请选择调机员!');
			return;
		}
		// 本地缓存
		wgyun.setLocalValue(loacalPara, {
			FEmpID: VueMain.FEmpID,
			FClassNoID: VueMain.FClassNoID,
			FLineID: VueMain.FLineID,
			FMoldID: VueMain.FMoldID
		});
		// 由于后端框架历史遗留原因，此处对提交数据进行处理
		var headData = '';
		headData = FormUtil.AppendField2JSONString(headData, 'FInterID', mFInterID);
		headData = FormUtil.AppendField2JSONString(headData, 'FEmpID', VueMain.FEmpID);
		headData = FormUtil.AppendField2JSONString(headData, 'FClassNoID', VueMain.FClassNoID);
		headData = FormUtil.AppendField2JSONString(headData, 'FLineID', VueMain.FLineID);
		headData = FormUtil.AppendField2JSONString(headData, 'FMoldID', VueMain.FMoldID);
		//		var ajaxData = {
		//			Head: {
		//				FInterID: mFInterID,
		//				FEmpID: VueMain.FEmpID,
		//				FClassNoID: VueMain.FClassNoID,
		//				FLineID: VueMain.FLineID,
		//				FMoldID: VueMain.FMoldID
		//			}
		//		};
		var ajaxData = {
			Head: headData
		};
		var ajaxCallback = function(data) {
			mui.toast(data.FMsg);
			if(data.FIsSuccess) {
				owner.view(data.FInterID);
			}
		};
		CommonUtil.ajax('/Prod/Manuf.asmx/Transfer', ajaxData, ajaxCallback);
	};

}(mui, window.Manuf_View = {}));

var oTarget = Manuf_View;