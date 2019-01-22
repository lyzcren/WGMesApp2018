/**
 * 管理页面菜单项
 * version 1.0.0
 * by PeterTsang
 * peter@emblic.com.cn
 */

(function($, document) {
	//定义弹出选择器类
	var ManageMenuItem = $.ManageMenuItem = $.Class.extend({
		//构造函数
		init: function(options) {
			// options.showGroupName 显示分组名称
			// options.containerid
			// options.module 管理菜单的模块: Main, Buy, Sale, Finance, Stock
			// Main: 在此模块可以配置所有的二级菜单， Buy: 管理BuyMng下的二级菜单, Sale: 管理SaleMng下的二级菜单, 
			// Finance: 管理FinanceMng下的二级菜单, Stock: 管理StockMng下的二级菜单
			// options.AppSecurityHeader 数据接口请求调用验证信息
			var self = this;
			self.options = options || {};
			self.options.title = options.title;
			self.options.showGroupName = options.showGroupName;
			self.options.containerid = options.containerid;
			self.options.module = options.module;
			self.options.type = options.type;
			self.options.max = options.max;
			self.options.extendMenus = options.extendMenus ? options.extendMenus : [];
			self.options.menus = [];
			self.options.AppSecurityHeader = AppSecurityHeader = CommonUtil.getAppSecurityHeader();
			self.panel = document.querySelector(self.options.containerid);
			self._loadMenuList();
			self.panel.addEventListener('touchmove', function(event) {
				var sele = self.panel.querySelector('.mui-transitioning.mui-selected');
				if(sele && sele != event.target) {
					$.swipeoutClose(sele);
				}
			}, false);
			document.addEventListener("refreshListAfterConfig", function(event) {
				self.refreshMenuList(self.options.menus);
			});
			document.addEventListener('openNormalList', function(event) {
				var fDevNumber = event.detail.fDevNumber;
				var extras = event.detail.extras;
				var li = document.querySelector('li[fDevNumber=' + fDevNumber + ']');
				mui.trigger(li, 'tap', {
					extras: extras
				});
			});
		},
		/** 
		 * 加载菜单数据并刷新
		 **/
		_loadMenuList: function() {
			var self = this;
			var ajaxData = {
				fDevNumber: self.options.module
			};
			var ajaxCallback = function(data) {
				if(data.FIsSuccess) {
					self.options.menus = data.FObject;
					// 添加额外菜单
					self.options.menus = self.options.menus.concat(self.options.extendMenus);
					self.refreshMenuList(self.options.menus);
				} else {
					mui.toast(data.FMsg);
				}
			};
			CommonUtil.ajax('/Account/Account.asmx/GetLv2Menu', ajaxData, ajaxCallback);
		},

		/**
		 * 刷新菜单列表
		 */
		refreshMenuList: function(menus) {
			var self = this;

			var CurrentList = Settings.getSettingsByName('MainMenuList' + self.options.module);
			if(CurrentList.length == undefined) {
				if(self.options.module == '') {
					// 默认显示：'MOPlan', 'Flow', 'Line', 'Manuf'
					CurrentList = ['MOPlan', 'Flow', 'Line', 'Manuf', 'QuickSign', 'QuickTransfer', 'QuickProd', 'QuickDistribute', 'QuickConfirmErpOut'];
					Settings.setSettingsByName('MainMenuList' + self.options.module, CurrentList);
				}
			}

			if(self.panel) {
				var tables = self.panel.querySelectorAll('mui-table-view');
				mui.each(tables, function(i, element) {
					self.panel.removeChild(element);
				});
				self.panel.innerHTML = '';

				var obj = {};
				var showItems = [];
				mui.each(menus, function(index, element) {
					var isShowItem = false;
					if(CurrentList.length == undefined) {
						showItems.push(element.FDevNumber);
						isShowItem = true;
					} else if(CurrentList.indexOf(element.FDevNumber) >= 0) {
						isShowItem = true;
					}
					if(isShowItem) {
						if(!obj[element.FGroupNumber]) {
							obj[element.FGroupNumber] = {};
							obj[element.FGroupNumber].Name = element.FGroupName;
							obj[element.FGroupNumber].List = [];
						}
						if(obj[element.FGroupNumber]) {
							obj[element.FGroupNumber].List.push(element);
						}
					}
				});
				if(CurrentList.length == undefined) {
					Settings.setSettingsByName('MainMenuList' + self.options.module, showItems);
				}
				var el = null;
				mui.each(obj, function(i, group) {
					// title
					if(self.options.showGroupName) {
						el = document.createElement('div');
						el.className = 'title';
						el.innerHTML = group.Name;
						self.panel.appendChild(el);
					}
					// list
					el = document.createElement('ul');
					if(self.options.type == 'list')
						el.className = 'mui-table-view';
					else
						el.className = 'mui-table-view mui-grid-view mui-grid-9';

					self.panel.appendChild(el);

					if(self.options.type == 'list') {
						mui.each(group.List, function(j, li) {
							// item
							var item = self.genLi(li.FName, li.FDevNumber, li.FParentDevNumber, li.FUrl, '', li.FIsShowAdd, li.FAddUrl, true, li.Operation);
							el.appendChild(item);
						});
					} else {
						mui.each(group.List, function(j, li) {
							// item
							var item = self.genGridLi(li.FName, li.FDevNumber, li.FParentDevNumber, li.FUrl, '', li.FIsShowAdd, li.FAddUrl, li.Operation);
							el.appendChild(item);
						});
					}
				});

				if(!el) {
					el = document.createElement('ul');
					if(self.options.type == 'list')
						el.className = 'mui-table-view';
					else
						el.className = 'mui-table-view mui-grid-view mui-grid-9';
					self.panel.appendChild(el);
				}
				if(el) {
					if(self.options.type == 'list') {
						el.className = 'mui-table-view';
						var item = self.genLi('添加功能', 'add', '', '', '', false, '', false);
						el.appendChild(item);
					} else {
						el.className = 'mui-table-view mui-grid-view mui-grid-9';
						var item = self.genGridLi('添加功能', 'add', '', '', '', false, '', false);
						el.appendChild(item);
					}
				}
				obj = null;
				mui('.mui-table-view').on('tap', '.mui-table-view-cell', function(event) {
					self.onMenuItemTab(self, this, event.detail.extras);
				});
				mui('.mui-table-view').on('tap', 'button', function(event) {
					self.onMenuItemAddTab(self, this);
					event.stopPropagation();
				});
				mui('.mui-table-view').on('tap', '.deleteitem', function(event) {
					self.onMenuItemDeleteTab(self, this);
				});
			}
		},
		/**
		 * 列表菜单, 新增菜单项
		 */
		genLi: function(fName, fDevNumber, fParentDevNumber, fUrl, fIconClass, fIsShowAdd, fAddUrl, bRemoveButton) {
			if(fParentDevNumber) fParentDevNumber = fParentDevNumber.replace('Mng', '');
			var li = document.createElement('li');
			li.className = 'mui-table-view-cell';
			li.setAttribute('fDevNumber', fDevNumber);
			li.setAttribute('fName', fName);
			if(fOperatoin) li.setAttribute('fOperatoin', fOperatoin);
			if(fParentDevNumber && fUrl) li.setAttribute('fUrl', '/view/' + fParentDevNumber + fUrl + '.html');
			//  wg-menuitemlabel, font-size: larger;
			li.innerHTML +=
				(bRemoveButton ? '<div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red deleteitem">删除</a></div><div class="mui-slider-handle">' : '') + '<div style="float: left;"><span class="wg-icon wg-icon-' + fDevNumber.toLowerCase() + '"></span></div>' + '<div class="wg-menuitemlabel" style="float: left;">' + fName + ' </div>' + (fIsShowAdd ? '<button type="button" class="mui-btn mui-btn-primary" style="float: right;" fDevNumber="' + fDevNumber + '" fUrl="/view/' + fParentDevNumber + fAddUrl + '.html">新增</button>' : '<div style="float: right;"><span class="mui-icon mui-icon-forward"></span></div>') + (bRemoveButton ? '</div>' : '');

			return li;
		},
		/**
		 * 九宫格菜单, 新增菜单项,不包含滑动删除
		 */
		genGridLi: function(fName, fDevNumber, fParentDevNumber, fUrl, fIconClass, fIsShowAdd, fAddUrl, fOperatoin) {
			if(fParentDevNumber) fParentDevNumber = fParentDevNumber.replace('Mng', '');
			var li = document.createElement('li');
			li.className = 'mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-4';
			li.setAttribute('fDevNumber', fDevNumber);
			li.setAttribute('fViewID', fDevNumber);
			li.setAttribute('fName', fName);
			if(fOperatoin) li.setAttribute('fOperatoin', fOperatoin);
			if(fParentDevNumber && fUrl) li.setAttribute('fUrl', '/view/' + fParentDevNumber + fUrl + '.html');
			var sHtml = '<a href="#">';
			sHtml += '<div style="vertical-align: top; text-align: center;">';
			sHtml += '<span class="wg-icon wg-icon-' + fDevNumber.toLowerCase() + ' wg-grid-icon-size"></span>';
			sHtml += '<br />';
			sHtml += '<span class="wg-grid-label-size" style="' + (fName.length > 5 ? 'font-size: 9pt' : '') + '">' + fName + '</span>';
			sHtml += '</div>';
			sHtml += '</a>';
			// console.log(sHtml); 
			li.innerHTML = sHtml;
			return li;
		},
		/**
		 * 单击菜单时打开相应查询列表
		 */
		onMenuItemDeleteTab: function(self, target) {
			var elem = target;
			var li = elem.parentNode.parentNode;
			var btnArray = ['确认', '取消'];
			mui.confirm('确认删除移除此项？', '望果MES', btnArray, function(e) {
				if(e.index == 0) {
					li.parentNode.removeChild(li);
					var CurrentList = Settings.getSettingsByName('MainMenuList' + self.options.module);
					CurrentList.remove(li.getAttribute('fDevNumber'));
					Settings.setSettingsByName('MainMenuList' + self.options.module, CurrentList);
				} else {
					setTimeout(function() {
						$.swipeoutClose(li);
					}, 0);
				}
			});
		},
		/**
		 * 单击菜单时打开相应查询列表
		 */
		onMenuItemTab: function(self, target, extras) {
			//			wgyun.showLoadPageWaiting();
			var li = target;
			var fDevNumber = li.getAttribute("fDevNumber");
			var fUrl = li.getAttribute("fUrl");
			var fViewId = fDevNumber + '_List';

			var fName = li.getAttribute("fName");
			var fIconClass = li.getAttribute("fIconClass");
			var fIsShowAdd = li.getAttribute("fIsShowAdd");
			var fAddUrl = li.getAttribute("fAddUrl");
			var bRemoveButton = li.getAttribute("bRemoveButton");
			var fSearchField = li.getAttribute("fSearchField");
			var fGroupBy = li.getAttribute("fGroupBy");
			var operation = li.getAttribute("fOperatoin");

			if(fDevNumber == 'add') {
				self.onAddFunctionTab(self);
			} else if(fDevNumber && fUrl && fViewId) {
				WebviewManager.openPageById(fViewId, extras);
			} else if(operation) {
				plus.webview.currentWebview().evalJS(operation);
			} else {
				alert("openNormalList函数调用错误，请检查！");
			}
			//			wgyun.closeWaiting();
		},
		/**
		 * 单击菜单时打开相应查询列表
		 */
		onMenuItemAddTab: function(self, target) {
			var btn = target;
			var fDevNumber = btn.getAttribute("fDevNumber");
			var fUrl = btn.getAttribute("fUrl");
			var fViewId = fDevNumber + 'Add';
			mui.openWindow({
				url: fUrl,
				id: fViewId
			});
		},
		/**
		 * 单击菜单时打开相应查询列表
		 */
		onAddFunctionTab: function(self) {
			WebviewManager.openPageById('ManageMenuItemList', {
				title: self.options.title,
				module: self.options.module,
				menus: self.options.menus,
				max: self.options.max
			});
		},

		/**
		 * 设置菜单项中的角标
		 */
		setLiBadge: function(fDevNumber, value) {
			var label = document.querySelector('li[fdevnumber="' + fDevNumber + '"] .wg-menuitemlabel');
			if(label) {
				var span = label.querySelector('span.mui-badge');
				if(!span) {
					span = document.createElement('span');
					span.className = 'mui-badge mui-badge-success';
					var desc = label.querySelector('span.desc');
					if(desc) {
						label.insertBefore(span, desc);
					} else {
						label.appendChild(span);
					}
				}
				if(span) {
					if(value == null || value == '') {
						span.style.display = "none";
						span.innerHTML = '';
					} else {
						span.style.display = "inline";
						span.innerHTML = value;
					}
				}
			}
		},

		/**
		 * 设置菜单项中的描述
		 */
		setLiDesc: function(fDevNumber, desc) {
			var label = document.querySelector('li[fdevnumber="' + fDevNumber + '"] .wg-menuitemlabel');
			if(label) {
				var span = label.querySelector('span.desc');
				if(!span) {
					span = document.createElement('span');
					span.className = 'desc';
					span.style.fontSize = 'small';
					span.style.color = '#999999';
					label.appendChild(span);
				}
				if(span) {
					span.innerHTML = '<br />' + desc;
				}
			}
		}
	});

})(mui, document);