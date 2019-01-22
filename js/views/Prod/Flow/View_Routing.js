(function($, owner) {

	owner.HeadColumns = null;

	owner.Buttons = [{
		title: "保存",
		callback: "Flow_View_Routing.onSaveEventHandler"
	}];

	owner.Self = null;
	owner.Main = null;
	owner.Opener = null;

	var mInterID;
	var VueMain = new Vue({
		el: '#main',
		data: {
			items: [] //列表信息流数据
		}
	});
	owner.plusready = function() {
		owner.Self = plus.webview.currentWebview();
		owner.Opener = owner.Self.opener();
		mInterID = owner.Self.FInterID;

		owner.init();
	};

	owner.init = function() {
		//初始化配置列页面
		owner.initControl();
		//初始化基本事件，初始化基本事件的定义自定义事件RefreshData，加载数据
		owner.initEvent();
		owner.refreshHeadData(mInterID);
	};

	owner.initControl = function() {};

	owner.initEvent = function() {

	};

	owner.refreshHeadData = function(fInterID) {
		var ajaxData = {
			FInterID: fInterID
		};
		var ajaxCallback = function(data) {
			if(data.FIsSuccess) {
				var main = document.querySelector('#main');
				if(data.FObject.length > 0) VueMain.items = [];
				VueMain.items = data.FObject;
			} else {
				mui.toast('未找到工艺路线!');
			}
		};

		CommonUtil.ajax('/Basic/Routing.asmx/GetDetail', ajaxData, ajaxCallback);
	};

}(mui, window.Flow_View_Routing = {}));

var oTarget = Flow_View_Routing;