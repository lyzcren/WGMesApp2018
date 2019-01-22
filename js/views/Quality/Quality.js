/**
 * 质量管理
 **/
(function($, owner) {
	var main = null;
	owner.MenuItem = {};

	/** 
	 * 初始化
	 **/
	owner.init = function() {
		main = plus.webview.currentWebview();
		var content = document.querySelector('.mui-content');
		//new mui.ManageMenuItem是添加功能对应的列表
		var mmi = new mui.ManageMenuItem({
			title: '质量管理-菜单',
			showGroupName: true,
			containerid: '.mui-content',
			module: 'QualityMng',
			type: 'grid'
		});
	};
}(mui, window.Quality = {}));

var oTarget = Quality;