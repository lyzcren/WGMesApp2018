/**
 * 生产记录
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	owner.Self = null;
	owner.Menu = null;
	owner.mPageIndex = 0;
	owner.mPageSize = 12;

	owner.CrtFilterField = {};
	owner.CrtGroupBy = {};
	owner.mData = new Array();
	owner.mWhere = [];
	owner.mGroupBy = '';

	//保存列配置名称
	owner.SavedHeadColumnKey = 'App_Manuf_Head';

	//本地配置列
	owner.ConfigHeadColumns = null;
	//服务器保存的列
	owner.SaveHeadColumns = null;

	//新增页面
	var mAddPage = null,
		mViewPage = null;
	var mCurrentQueryDeptID = 0,
		mCurrentQueryStatus = 0;

	var dataSource = new Vue({
		el: '#dataSource',
		data: {
			items: [] //列表信息流数据
		}
	});
	var mescroll;

	owner.plusready = function() {
		owner.Self = plus.webview.currentWebview(); //id:Manuf_List
		owner.ConfigHeadColumns = Manuf_ConfigColumns.HeadColumns;
		// 重写back方法
		WebviewManager.rewriteBack(owner.back);

		owner.init();
	};

	owner.init = function() {
		owner.initControl();
		//初始化查询字段
		owner.initFilterField();
		//获取服务器配置列
		//		SysObject.initColumns(owner.SavedHeadColumnKey, owner.ConfigHeadColumns, owner.updateHeadColumns);
		//初始化事件
		owner.initEvent();
		//初始化时一同加载（根据时间来加载）
		//		owner.loadWhenInited();
	};

	owner.initControl = function() {
		//创建MeScroll对象
		mescroll = new MeScroll("pullrefresh", {
			down: {
				auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
				callback: oTarget.pulldownRefresh //下拉刷新的回调
			},
			up: {
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

		var bitmapHelper = new BitmapHelper();
		bitmapHelper.searchMenu().attachRightFirst(owner.showFilterEventHandler);
	}

	owner.initEvent = function() {
		document.addEventListener('opening', owner.showPageEventHandler);
		document.addEventListener('showScan', owner.showScanEventHandler);
		document.addEventListener('refreshList', owner.refreshListEventHandler);
		document.addEventListener('showFilter', owner.showFilterEventHandler);
		document.addEventListener('submitFilter', owner.submitFilterEventHandler);
		document.addEventListener('closeFilter', owner.closeFilterEventHandler);
	};

	owner.back = function() {
		if(WebviewManager.showMenu) {
			WebviewManager.closeFilterMenu();
		} else {
			// 关闭页面
			owner.Self.close();
		}
	};

	owner.open_detail = function(item) {
		owner.openViewPage({
			FInterID: item.FInterID
		});
	}

	/**
	 * HeadWebview菜单中的扫描事件响应方法
	 * @param {Object} event
	 */
	owner.showScanEventHandler = function(event) {
		var filter = event.detail.search;
		var fDeptID = mCurrentQueryDeptID;
		var targetDeptIDFilter = FilterUtil.popFilterByField(filter, 'FTargetDeptID');
		if(targetDeptIDFilter && targetDeptIDFilter.FValue) {
			fDeptID = targetDeptIDFilter.FValue;
		}
		var scanFunction = function(result, file) {
			var ajaxData = {
				FBarcode: result,
				FDeptID: fDeptID
			};
			var ajaxCallback = function(data) {
				if(data.FIsSuccess) {
					var manuf = data.FObject;
					if(manuf.FDeptID == fDeptID) { // 当前工序
						if(manuf.FStatus > 0) {
							// 查看生产记录
							owner.openViewPage({
								FInterID: manuf.FInterID
							});
						} else {
							// 转序
							owner.openEditPage({
								FInterID: manuf.FInterID
							});
						}
					} else if(manuf.FNextDeptID = fDeptID && manuf.FStatus == 1) { // 待签收
						wgyun.confirmYesNo('当前单据可签收，确定签收？', function() {
							// 签收
							owner.sign(manuf.FInterID);
						});
					}
				} else {
					mui.toast(data.FMsg);
				}
			};
			CommonUtil.ajax('/Prod/Manuf.asmx/Scan', ajaxData, ajaxCallback);
		};
		NativeUtil.Scan(scanFunction, true);
	};

	/**
	 * 搜索按钮点击事件响应方法
	 * @param {Object} event
	 */
	owner.showFilterEventHandler = function(event) {
		if(!owner.Menu) {
			// 创建菜单侧滑搜索
			owner.Menu = WebviewManager.createFilterMenu({
				id: 'Prod_Manuf_FilterMenu',
				url: WebviewManager.DefaultMenuUrl
			}, {
				fSearchField: owner.CrtFilterField,
				fGroupBy: owner.CrtGroupBy,
				showScan: true
			});
		}
		//显示菜单
		WebviewManager.showFilterMenu(owner.Menu);
	};

	/**
	 * 关闭侧滑搜索菜单
	 * @param {Object} event
	 */
	owner.closeFilterEventHandler = function(event) {
		WebviewManager.closeFilterMenu(owner.Menu);
	};

	/**
	 * 页面刷新方法
	 * @param {Object} event
	 */
	owner.refreshListEventHandler = function(event) {
		owner.pulldownRefresh();
	};

	/**
	 * 侧滑搜索菜单的确定按钮点击事件响应方法
	 * @param {Object} event
	 */
	owner.submitFilterEventHandler = function(event) {
		owner.mWhere = event.detail.search;
		owner.mGroupBy = event.detail.groupBy;
		owner.mPageIndex = 1;
		owner.getList(RefreshType.Search);
	};

	owner.showPageEventHandler = function(event) {
		var extraData = event.detail.extraData;
		owner.quickQuery(extraData);
	};

	/**
	 * 签收
	 * @param {Object} fInterID
	 */
	owner.sign = function(fInterID) {
		var ajaxData = {
			FInterID: fInterID
		};
		var ajaxCallback = function(data) {
			mui.toast(data.FMsg);
			if(data.FIsSuccess) {
				owner.pulldownRefresh();
			}
		};
		CommonUtil.ajax('/Prod/Manuf.asmx/Sign', ajaxData, ajaxCallback);
	};

	owner.quickQuery = function(extraData) {
		if(extraData) {
			var fStartDate = extraData.fStartDate;
			var fEndDate = extraData.fEndDate;
		}
		if(fStartDate || fEndDate) {
			owner.onAutoQueryEvent(fStartDate, fEndDate);
		} else {
			//初始化时一同加载（根据时间来加载）
			owner.loadWhenInited();
		}
	};

	owner.updateHeadColumns = function(columns) {
		//获取服务器配置之后的列
		owner.SaveHeadColumns = columns;
	};

	/**
	 * 下拉刷新具体业务实现
	 */
	owner.pulldownRefresh = function() {
		owner.mPageIndex = 1;
		owner.getList(RefreshType.Down);
	};

	/*
	 * 上拉加载具体业务实现
	 */
	owner.pullupRefresh = function() {
		owner.mPageIndex += 1;
		owner.getList(RefreshType.Up);
	};

	//从服务器获取数据
	owner.getList = function(type) {
		//加载单据时获取查询参数，mWhere
		owner.parseQuickValue();
		var queryParas = {
			page: owner.mPageIndex,
			rows: owner.mPageSize,
			Filter: JSON.stringify(owner.mWhere),
			FStatus: mCurrentQueryStatus
		};
		CommonUtil.GetListPager(CommonUtil.HostUrl + '/Prod/Manuf.asmx/GetList4App', queryParas, mescroll, function(pager) {
			owner.loadList(type, pager);
		});
	};

	//将获取的数据展示出来
	owner.loadList = function(type, pager) {
		var rows = pager.rows;
		if(type == RefreshType.Up) {
			dataSource.items = dataSource.items.concat(rows);
		} else {
			dataSource.items = rows;
		}

		// 将本次加载的数据添加到本地列表
		owner.mData = owner.mData.concat(rows);
	};

	//初始化时一同加载（通过下拉加载，在下拉的时候调用GetList）
	owner.loadWhenInited = function() {
		setTimeout(function() {
			var d1, d2;
			var now = new Date();
			d2 = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
			now = now.addDays(-30);
			d1 = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
			owner.mWhere = [];
			owner.mWhere.push(FilterUtil.create('(', 'FDate', '>=', d1, '', 'And'));
			owner.mWhere.push(FilterUtil.create('', 'FDate', '<=', d2, ')', ''));
			owner.pulldownRefresh();
		}, 500);
	};

	//下推等操作自动查询
	owner.onAutoQueryEvent = function(fStartDate, fEndDate) {
		setTimeout(function() {
			owner.mWhere = [];
			if(fStartDate) {
				owner.mWhere.push(FilterUtil.create('', 'FDate', '>=', fStartDate, '', 'And'));
			}
			if(fEndDate) {
				owner.mWhere.push(FilterUtil.create('', 'FDate', '<=', fEndDate, '', 'And'));
			}
			owner.pulldownRefresh();
		}, 500);
	};

	//快速查询参数
	owner.parseQuickValue = function() {
		// 工序
		var targetDeptIDFilter = FilterUtil.popFilterByField(owner.mWhere, 'FTargetDeptID');
		// 状态
		var statusFilter = FilterUtil.popFilterByField(owner.mWhere, 'FStatus');
		if(statusFilter && statusFilter.FValue) {
			mCurrentQueryStatus = statusFilter.FValue
		}
		if(targetDeptIDFilter && targetDeptIDFilter.FValue) {
			mCurrentQueryDeptID = targetDeptIDFilter.FValue;
			if(mCurrentQueryDeptID >= 0) {
				if(mCurrentQueryStatus == -1) {
					owner.mWhere.push(FilterUtil.create('', 'FNextDeptID', '=', mCurrentQueryDeptID, '', 'And'));
				} else {
					owner.mWhere.push(FilterUtil.create('', 'FDeptID', '=', mCurrentQueryDeptID, '', 'And'));
				}
			}
		}
		owner.mWhere.push(FilterUtil.create('', 'FStatus', '=', mCurrentQueryStatus, '', 'And'));
		// 快速查询
		var quickFilter = FilterUtil.popFilterByField(owner.mWhere, 'FQuickValue');
		if(quickFilter && quickFilter.FValue) {
			// 快速查询：商品、供应商、单号
			owner.mWhere.push(FilterUtil.create('(', 'FBatchNo', '%*%', quickFilter.FValue, '', 'Or'));
			owner.mWhere.push(FilterUtil.create('', 'FMOBillNo', '%*%', quickFilter.FValue, '', 'Or'));
			owner.mWhere.push(FilterUtil.create('', 'FProductName', '%*%', quickFilter.FValue, '', 'Or'));
			owner.mWhere.push(FilterUtil.create('', 'FProductNumber', '%*%', quickFilter.FValue, ')', ''));
		}
	};

	//初始化查询参数
	owner.initFilterField = function() {
		// 初始化查询字段
		owner.CrtFilterField = {
			SearchField: {}
		};
		var fieldArray = [];
		fieldArray.push({
			"fField": "FQuickValue",
			"fName": "快速查询",
			"fType": "varchar",
			"fDesc": '名称、编码'
		});
		fieldArray.push({
			"fField": "FTargetDeptID",
			"fName": "工序",
			"fType": "pick",
			"fSearchType": 'TargetDept',
			"fSearchField": 'FName',
			"fValueField": 'value',
			"fDesc": '选择工序',
			"fQueryString": {
				"InsertAll": true
			}
		});
		fieldArray.push({
			"fField": "FStatus",
			"fName": "状态",
			"fType": "pick",
			"fSearchType": 'FManufStatus',
			"fSearchField": 'FName',
			"fValueField": 'value',
			"fDesc": '选择状态'
		});
		owner.CrtFilterField.SearchField = fieldArray;
	};

	// 初始化查询分组
	owner.initGroupBy = function() {
		owner.CrtGroupBy = {
			GroupBy: {}
		};
		var fieldArray = [];
		//		fieldArray.push({
		//			"fField": "GroupByShop",
		//			"fName": "门店"
		//		});
		owner.CrtGroupBy.GroupBy = fieldArray;
	};

	owner.openViewPage = function(moreData) {
		var data = {
			saveHeadColumns: owner.SaveHeadColumns,
			Mode: GridColumnsMode.View,
			showMenu: false
		};
		data = wgyun.JsonExtend(data, moreData);
		mViewPage = WebviewManager.openPageById('Manuf_View', data);
		return mViewPage;
	};

	owner.openEditPage = function(moreData) {
		var data = {
			saveHeadColumns: owner.SaveHeadColumns,
			Mode: GridColumnsMode.View
		};
		data = wgyun.JsonExtend(data, moreData);
		mAddPage = WebviewManager.openPageById('Manuf_View', data);
		return mAddPage;
	};

}(mui, window.Manuf_List = {}));

var oTarget = Manuf_List;