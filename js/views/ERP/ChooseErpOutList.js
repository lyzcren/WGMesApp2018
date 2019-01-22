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

	var mBarcodeSplitChar = '',
		mBarcodeString = '';
	var mModelIndex = -1,
		mBatchNoIndex = -1,
		mQtyIndex = -1;

	var dataSource = new Vue({
		el: '#dataSource',
		data: {
			FBillNo: '',
			items: [] //列表信息流数据
		}
	});
	var mescroll;
	var ws, wo;

	owner.plusready = function() {
		// 获取窗口对象
		ws = plus.webview.currentWebview();
		wo = ws.opener();

		owner.Self = plus.webview.currentWebview(); //id:Erp_ChooseErpOut
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
			// 关闭页面
			owner.Self.close();
		}
	};

	owner.initData = function() {

	};

	owner.query = function() {
		var queryParas = {
			page: 1,
			rows: 20,
			billNo: dataSource.FBillNo
		};
		CommonUtil.GetListPager(CommonUtil.HostUrl + '/ERP/ConfirmErpOut.asmx/GetBillInfo', queryParas, mescroll, function(pager) {
			//			owner.loadList(type, pager);
			if(pager.FIsSuccess) {
				dataSource.items = [];
				for(var i = 0; i < pager.rows.length; i++) {
					dataSource.items.push({
						FBillNo: pager.rows[i].FBillNo,
					});
				}
			}
		});
	};

	owner.selected = function(item) {
		wo.evalJS('Erp_ConfirmErpOut.selectedBillNo(`' + item.FBillNo + '`)');
		mui.back();
	}

	owner.open_detail = function(item) {
		mui.toast('功能未开发');
	}

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

}(mui, window.Erp_ChooseErpOut = {}));

var oTarget = Erp_ChooseErpOut;