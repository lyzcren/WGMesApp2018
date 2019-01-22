/**
 * Webview缓存队列管理器，使用id,viewId,url的方式记录
 * @param {Object} owner
 * @param {Object} $
 */
(function(owner, $) {
	owner.LocalKey = 'webviewCache';
	owner.LocalMenuKey = 'menuWebviewCache';
	owner.WebviewDataLocalKey = 'WebviewManager_WebviewDataKey';
	owner.DefaultSingleViewQueueLen = 0;
	owner.DefaultQueueLen = 6;
	owner.DefaultMenuQueueLen = 1;
	owner.MaxQueueLen = 20;
	owner.currentWbvId = null;
	owner.DefaultMenuUrl = '/view/CommonViews/FilterMenu.html';
	var _self, _opener;
	var plusready = function() {
		_self = plus.webview.currentWebview();
		_opener = _self.opener();
	}
	if(window.plus && window.mui) {
		plusready();
	} else {
		document.addEventListener('plusready', function(event) {
			plusready();
		}, false);
	}

	owner.getViewConfig = function(id) {
		var config = null;
		$.each(window.ViewConfig, function(index, element) {
			if(element.id == id) {
				config = element;
				return false;
			}
		});

		return config;
	};

	owner.showMenu = false;
	var CurrentMenu;
	var mode = 'menu-move';
	//	var mask;
	/**
	 * 创建菜单webview 
	 * @param {Object} viewConfig 
	 * @param {Object} extras 创建时传递给webview的参数
	 */
	owner.createFilterMenu = function(viewConfig, extras) {
		var wbv = plus.webview.create(viewConfig.url, viewConfig.id, {
			zindex: 9998,
			width: '80%',
			left: '100%'
		}, extras);
		//		mask = mui.createMask(owner._closeMenu)
		//在android4.4中的swipe事件，需要preventDefault一下，否则触发不正常
		//故，在dragleft，dragright中preventDefault
		_self.addEventListener('dragright', function(e) {
			e.detail.gesture.preventDefault();
		});
		_self.addEventListener('dragleft', function(e) {
			e.detail.gesture.preventDefault();
		});
		//主界面向左滑动，若菜单未显示，则显示菜单；否则不做任何操作；
		_self.addEventListener("swipeleft", owner.showFilterMenu);
		//主界面向右滑动，若菜单已显示，则关闭菜单；否则，不做任何操作；
		_self.addEventListener("swiperight", owner.closeFilterMenu);
		//menu页面向右滑动，关闭菜单；
		_self.addEventListener("menu:swiperight", owner.closeFilterMenu);
		// 点击遮罩层，关闭菜单
		_self.addEventListener("maskClick", owner.closeFilterMenu);

		return wbv;
	};

	owner.showFilterMenu = function(menu) {
		CurrentMenu = menu;
		if(!owner.showMenu) {
			//解决android 4.4以下版本webview移动时，导致fixed定位元素错乱的bug;
			if(mui.os.android && parseFloat(mui.os.version) < 4.4) {
				document.querySelector("header.mui-bar").style.position = "static";
				//同时需要修改以下.mui-contnt的padding-top，否则会多出空白；
				document.querySelector(".mui-bar-nav~.mui-content").style.paddingTop = "0px";
			}
			//侧滑菜单处于隐藏状态，则立即显示出来；
			//显示完毕后，根据不同动画效果移动窗体；
			CurrentMenu.show('none', 0, function() {
				switch(mode) {
					case 'main-move':
						//主窗体开始侧滑；
						_self.setStyle({
							left: '-80%',
							transition: {
								duration: 150
							}
						});
						break;
					case 'menu-move':
						CurrentMenu.setStyle({
							left: '20%',
							transition: {
								duration: 150
							}
						});
						break;
					case 'all-move':
						_self.setStyle({
							left: '-80%',
							transition: {
								duration: 150
							}
						});
						CurrentMenu.setStyle({
							left: '20%',
							transition: {
								duration: 150
							}
						});
						break;
				}
			});
			//显示主窗体遮罩
			//			mask.show();
			_self.setStyle({
				mask: "rgba(0,0,0,0.5)"
			});
			owner.showMenu = true;
		}
	};

	owner.closeFilterMenu = function() {
		//窗体移动
		owner._closeMenu();
		//关闭遮罩
		//		mask.close();
		_self.setStyle({
			mask: "none"
		});
	};
	/**
	 * 关闭侧滑菜单(业务部分)
	 */
	owner._closeMenu = function() {
		if(owner.showMenu) {
			//解决android 4.4以下版本webview移动时，导致fixed定位元素错乱的bug;
			if(mui.os.android && parseFloat(mui.os.version) < 4.4) {
				mui.evalJS(CurrentMenu, 'document.querySelector("header.mui-bar").style.position = "fixed";');
				//同时需要修改以下.mui-contnt的padding-top，否则会多出空白；
				mui.evalJS(CurrentMenu, 'document.querySelector(".mui-bar-nav~.mui-content").style.paddingTop = "44px";');
			}
			switch(mode) {
				case 'main-move':
					//主窗体开始侧滑；
					_self.setStyle({
						left: '0',
						transition: {
							duration: 150
						}
					});
					break;
				case 'menu-move':
					//主窗体开始侧滑；
					CurrentMenu.setStyle({
						left: '100%',
						transition: {
							duration: 150
						}
					});
					break;
				case 'all-move':
					//主窗体开始侧滑；
					_self.setStyle({
						left: '0',
						transition: {
							duration: 150
						}
					});
					//menu页面同时移动
					CurrentMenu.setStyle({
						left: '100%',
						transition: {
							duration: 150
						}
					});
					break;
			}
			//等窗体动画结束后，隐藏菜单webview，节省资源；
			setTimeout(function() {
				CurrentMenu.hide();
			}, 200);
			owner.showMenu = false;
		}
	};

	owner.preloadPageById = function(id, extras) {
		var viewConfig = WebviewManager.getViewConfig(id);
		mViewPage = mui.preload({
			url: viewConfig.url,
			id: viewConfig.id,
			styles: {
				"render": "always",
				"popGesture": "hide",
				"bounce": "vertical",
				"bounceBackground": "#efeff4",
				"titleNView": {
					titleText: viewConfig.title
				}
			}
		});

		return mViewPage;
	};

	/**
	 * 通过ViewConfig中配置的id打开相应的webview 
	 * @param {Object} id  	ViewConfig中配置的id,本地缓存中用于记录webview的id使用，此id区别于Webview.id 
	 * @param {Object} extras 打开时传递给webview的参数
	 */
	owner.openPageById = function(id, extras) {
		var viewConfig = WebviewManager.getViewConfig(id);

		//打开窗口的相关参数
		var options = {
			styles: {
				popGesture: "close",
				titleNView: {
					autoBackButton: true,
					backgroundColor: '#f7f7f7',
					titleText: viewConfig.title,
					splitLine: {
						color: '#cccccc'
					}
				}
			},
			extras: wgyun.JsonExtend({}, extras)
		};
		//如下场景不适用下拉回弹：
		//1、单webview下拉刷新；2、底部有fixed定位的div的页面
		if(!~viewConfig.pullrefresh && !~viewConfig.tabbar && !~viewConfig.listview) {
			options.styles.bounce = "vertical";
		}
		//图标页面需要启动硬件加速
		if(~viewConfig.icons || ~viewConfig.echarts) {
			options.styles.hardwareAccelerated = true;
		}
		if(~viewConfig.imChat) {
			options.extras.acceleration = "none";
		}
		options.show = {
			event: 'loaded'
		}
		//有原生标题的情况下，就不需要waiting框了
		options.waiting = {
			autoShow: false
		}
		//透明渐变导航,增加类型设置
		if(viewConfig.titleType == "transparent_native") {
			options.styles.titleNView.type = "transparent";
		}
		//打开新窗口
		view = mui.openWindow(viewConfig.url, viewConfig.id, options);

		return view;
	};

	(function($, owner) {
		owner.Detail = 0x1;
		owner.Add = 0x2;
		owner.Edit = 0x3;
		owner.AddFromOther = 0x4;
	}(mui, window.ShowType = {}));

	owner.rewriteBack = function(callback) {
		var oldBack = mui.back;
		mui.back = function() {
			if(callback) {
				callback();
			} else {
				oldBack();
			}
		};

		return mui.back;
	};
}(window.WebviewManager = window.WebviewManager || {}, mui));