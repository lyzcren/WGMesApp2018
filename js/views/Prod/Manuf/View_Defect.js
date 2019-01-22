(function($, owner) {

	owner.HeadColumns = null;

	owner.Buttons = [{
		title: "保存",
		callback: "Manuf_View_Defect.onSaveEventHandler"
	}];

	owner.Self = null;
	owner.Opener = null;
	// 保存列配置名称
	owner.SavedColumnKey = 'App_Manuf_Defect';
	var mCurrentButton = owner.Buttons;

	var mCurrentData;
	var mMode;

	var mColumns, mGroups, mDetails;

	owner.plusready = function() {
		owner.Self = plus.webview.currentWebview();
		owner.Opener = owner.Self.opener();
		owner.HeadColumns = Manuf_ConfigColumns.DefectColumns;
		mMode = owner.Self.Mode;
		mCurrentData = owner.Self.data;

		owner.init();
	};

	owner.init = function() {
		//初始化配置列页面
		owner.initControl(owner.HeadColumns);
		//初始化基本事件，初始化基本事件的定义自定义事件RefreshData，加载数据
		owner.initEvent();
		if(mMode == GridColumnsMode.Edit) {
			owner.initElementEvent();
		}
		owner.refreshHeadData(mCurrentData);
	};

	owner.initControl = function() {
		//首先初始化mainBody的字段
		owner.initDetail(owner.HeadColumns);

		if(mMode == GridColumnsMode.Edit) {
			var bitmapHelper = new BitmapHelper();
			bitmapHelper.topMenu().attachRightFirst(owner.onShowMenuEventHandler);
		}
	};

	owner.initBottomInfo = function() {
		if(mMode != GridColumnsMode.Edit || !mCurrentData) return;
		var bottomInfo = document.getElementById('bottomInfo');
		var sInnerHTML = '';
		sInnerHTML += '<button id="btnDelete" class="mui-btn mui-btn-danger mui-btn-block wg-deleteBtn-bottom">删除</button>';
		bottomInfo.innerHTML = sInnerHTML;
		//删除按钮
		document.querySelector('#btnDelete').addEventListener('tap', owner.onDeleteEventHandler);
	};

	owner.initEvent = function() {
	};

	owner.initElementEvent = function() {};

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
			owner.initBottomInfo();
		} else if(mMode == GridColumnsMode.View) {
			GridColumnsUtil.appendViewColumns('#main', mColumns, mGroups);
		}
	};

	// 打开列配置管理页面
	owner.onGridColumnEventHandler = function(event) {
		GridColumnsUtil.OpenGroupColumnWindow(owner.HeadColumns, owner.SavedColumnKey, ShowType.Detail, owner.reload);
	};

	owner.refreshHeadData = function(data) {
		mCurrentData = data;
		owner.maskButtons();
		FormUtil.SetData('#main', mCurrentData);
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

	owner.onSaveEventHandler = function(event) {
		//结束编辑
		FormUtil.endEdit();
		if(!FormUtil.ValidateForm('#main')) return;
		var data = FormUtil.GetObjectJSON('#main');
		owner.save(data);
	};

	owner.onDeleteEventHandler = function(event) {
		var fDefectID = document.querySelector('[name="FDefectID"]').value;
		mui.fire(owner.Opener, 'deleteDefect', {
			FDefectID: fDefectID
		});
		mui.back();
	};

	owner.save = function(data) {
		mui.fire(owner.Opener, 'changeDefect', {
			data: data
		});
		mui.back();
	};

	owner.maskButtons = function() {
		//concat连接两个字符串
		//不能直接把owner.Buttons复制给mCurrentButton,是因为owner.Buttons是值类型
		//注意concat()返回的并不是调用函数的Array，而是一个新的Array，所以可以利用这一点进行复制
		mCurrentButton = owner.Buttons.concat();
		if(mMode == GridColumnsMode.View) {
			// 查看生产记录
			mCurrentButton.removeByKey('title', '保存');
		}
	};

	owner.reload = function() {
		SysObject.getGroupColumns(owner.SavedColumnKey, owner.HeadColumns, function(columns) {
			owner.initDetail(columns); //初始化基本字段
			GridColumnsUtil.refreshData(mCurrentData); //给初始化的字段赋值
		});
	};

}(mui, window.Manuf_View_Defect = {}));

var oTarget = Manuf_View_Defect;