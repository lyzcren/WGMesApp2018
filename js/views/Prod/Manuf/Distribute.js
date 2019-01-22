(function($, owner) {
	owner.Self = null;
	owner.Main = null;

	var mFInterID, mCurrentData = {},
		mCurrentEmp;

	var VueMain = new Vue({
		el: '#main',
		data: {
			FDeptID: 0,
			FEmpID: 0,
			FClassNoID: 0,
			FLineID: 0
		}
	});

	owner.plusready = function() {
		owner.Self = plus.webview.currentWebview();
		owner.Main = owner.Self.parent();
		owner.init();
	};

	owner.init = function() {
		owner.initControl();
		//初始化基本事件
		owner.initEvent();
		owner.initElementEvent();
	};

	owner.initControl = function() {

	};

	owner.initEvent = function() {};

	owner.initElementEvent = function() {
		document.getElementById('FDeptName').addEventListener('tap', function(event) {
			var fQueryString = {};
			BasicData.pickHandler(event, 'TargetDept', 'FFullName', undefined, 'FDeptID', fQueryString);
		});
		document.getElementById('FEmpName').addEventListener('tap', function(event) {
			var fQueryString = {
				FDeptID: VueMain.FDeptID
			};
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
		document.getElementById('btnScan').addEventListener('tap', owner.ScanEvent);
	};

	owner.ScanEvent = function(event) {
		if(VueMain.FDeptID <= 0) {
			mui.toast('请先选择部门');
			return;
		} else if(VueMain.FEmpID <= 0) {
			mui.toast('请先选择操作员');
			return;
		} else if(VueMain.FClassNoID <= 0) {
			mui.toast('请先选择班次');
			return;
		} else if(VueMain.FLineID <= 0) {
			mui.toast('请先选择机台');
			return;
		} else {
			NativeUtil.Scan(owner.Distribute, true);
		}
	};

	owner.Distribute = function(barcode, file) {
		var ajaxData = {
			FBarcode: barcode,
			FDeptID: VueMain.FDeptID,
			FEmpID: VueMain.FEmpID
		};
		CommonUtil.ajax('/Prod/Manuf.asmx/ValidateDistributed', ajaxData, function(data) {
			if(data.FIsSuccess) {
				var manuf = data.FObject;
				// 分配
				var ajaxData_distribute = {
					FInterID: manuf.FInterID,
					FDeptID: VueMain.FDeptID,
					FEmpID: VueMain.FEmpID,
					FLineID: VueMain.FLineID,
					FClassNoID: VueMain.FClassNoID
				};
				wgyun.confirmYesNo(data.FMsg, function() {
					CommonUtil.ajax('/Prod/Manuf.asmx/Distribute', ajaxData_distribute, function(dataDist) {
						mui.toast(dataDist.FMsg);
					});
				});
			} else {
				wgyun.confirm(data.FMsg);
			}
		});
	};

}(mui, window.Manuf_View = {}));

var oTarget = Manuf_View;