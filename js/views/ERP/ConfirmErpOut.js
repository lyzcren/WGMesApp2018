/**
 * 流程单
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	owner.Self = null;
	owner.Menu = null;

	//服务器保存的列
	owner.SaveHeadColumns = null;

	//新增页面
	var mViewPage = null; //详情页webview
	var mViewChooseBillNo = null; // 选择订单界面

	var mBarcodeSplitChar = '',
		mBarcodeString = '';
	var mModelIndex = -1,
		mBatchNoIndex = -1,
		mQtyIndex = -1;

	var dataSource = new Vue({
		el: '#dataSource',
		data: {
			FBillNo: '-',
			items: [] //列表信息流数据
		}
	});
	var mescroll;

	owner.plusready = function() {
		owner.Self = plus.webview.currentWebview(); //id:Erp_ConfirmErpOut
		owner.initControl();
		// 重写back方法
		WebviewManager.rewriteBack(owner.back);
		owner.init();
	};

	owner.initControl = function() {
		//创建MeScroll对象
		mescroll = new MeScroll("pullrefresh", {
			down: {
				use: false,
				auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
				callback: oTarget.pulldownRefresh //下拉刷新的回调
			},
			up: {
				use: false,
				auto: false, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
				isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
				callback: oTarget.pullupRefresh, //上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
				toTop: { //配置回到顶部按钮
					src: plus.io.convertLocalFileSystemURL("/images/mescroll-totop.png"), //默认滚动到1000px显示,可配置offset修改
					offset: 200
				},
				htmlNodata: '<p class="upwarp-nodata">-- 到底了  --</p>' //无数据的布局
			}
		});

		//		//绘制顶部图标
		//		var titleView = owner.Self.getNavigationbar();
		//		if(!titleView) {
		//			titleView = plus.webview.getLaunchWebview().getNavigationbar();
		//		}
		//
		//		var bitmapHelper = new BitmapHelper();
		//		bitmapHelper.topMenu().attachRightFirst(owner.showMenuEventHandler);
		//		bitmapHelper.searchMenu().attachRightSecond(owner.showFilterEventHandler);
	}

	owner.init = function() {
		//初始化事件
		owner.initEvent();
		owner.initData();
	};

	owner.initEvent = function() {
		document.addEventListener('showScan', owner.showScanEventHandler);
	};

	owner.back = function() {
		if(WebviewManager.showMenu) {
			WebviewManager.closeFilterMenu();
		} else {
			wgyun.confirmYesNo('确定退出当前界面？', function() {
				// 关闭页面
				owner.Self.close();
			});
		}
	};

	owner.initData = function() {
		owner.getBarcodeConfig();
	};

	owner.open_detail = function(item) {
		mui.toast('功能未开发');
	}

	/**
	 * 
	 */
	owner.showScan = function() {
		var scanFunction = function(result, file) {
			owner.scanCallback(result);
		};
		NativeUtil.Scan(scanFunction, true, true);
	};

	owner.chooseBillNo = function() {
		var data = {};
		mViewChooseBillNo = WebviewManager.openPageById('Erp_ChooseErpOut', data);
		return mViewChooseBillNo;
	};

	owner.showScanBillNo = function() {
		var scanFunction = function(result, file) {
			dataSource.FBillNo = result;
		};
		NativeUtil.Scan(scanFunction, false);
	};

	owner.selectedBillNo = function(result) {
		dataSource.FBillNo = result;
	};

	/**
	 * 扫描添加出库单信息
	 * @param {Object} sBarcode
	 */
	owner.scanCallback = function(sBarcode) {
		if(mBarcodeSplitChar === '' || mBarcodeString === '') {
			mui.alert('未能从服务器获取到正确的二维码配置，请退出重新打开界面！');
			return;
		}

		var list = sBarcode.split(mBarcodeSplitChar);
		var model = list[mModelIndex];
		var batchNo = list[mBatchNoIndex];
		var qty = list[mQtyIndex];
		var existItem = dataSource.items.selectFirstItemsByKey('FModel', model);
		if(!existItem) {
			dataSource.items.push({
				FModel: model,
				FBatchNo: batchNo,
				FQty: qty,
			});
		} else {
			// 同一批次可多个实物，数量累加
			existItem.FQty = existItem.FQty * 1 + qty * 1;
		}

		mui.toast('成功添加"' + model + '":' + qty);
	};

	owner.getBarcodeConfig = function() {
		wgyun.showWaiting('正在获取二维码配置信息');
		CommonUtil.ajax('/ERP/ConfirmErpOut.asmx/GetBarcodeConfig', {}, function(data) {
			wgyun.closeWaiting();
			if(data.FIsSuccess) {
				mBarcodeSplitChar = data.FObject.BarcodeSplitChar;
				mBarcodeString = data.FObject.BarcodeString;
				var list = mBarcodeString.split(mBarcodeSplitChar);
				mModelIndex = list.indexOf('FModel');
				mBatchNoIndex = list.indexOf('FBatchNo');
				mQtyIndex = list.indexOf('FQty');
			} else {
				//				mui.toast(data.FMsg);
				mui.alert('获取二维码配置信息失败(' + data.FMsg + ')');
			}
		});
	};

	owner.submit = function() {
		if(dataSource.FBillNo === '-') {
			mui.alert('请扫描出库单条码!');
			return;
		}
		if(dataSource.items.length <= 0) {
			mui.alert('请扫描产品二维码!');
			return;
		}
		wgyun.showWaiting('正在提交服务器校验!');
		var ajaxData = {
			FBillNo: dataSource.FBillNo,
			items: dataSource.items,
		};
		CommonUtil.ajax('/ERP/ConfirmErpOut.asmx/Confirm', ajaxData, function(data) {
			wgyun.closeWaiting();
			if(!data.FIsSuccess) {
				mui.alert(data.FMsg);
			} else {
				mui.alert('校验成功!');
				owner.back();
			}
		});
	};
}(mui, window.Erp_ConfirmErpOut = {}));

var oTarget = Erp_ConfirmErpOut;