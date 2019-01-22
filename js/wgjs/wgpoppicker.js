/**
 * 弹出选择列表插件
 * 此组件依赖 listpcker ，请在页面中先引入 mui.picker.css + mui.picker.js
 * varstion 1.0.1
 * by Houfeng
 * Houfeng@DCloud.io
 */

(function($, document) {

	//创建 DOM
	$.dom = function(str) {
		if (typeof(str) !== 'string') {
			if ((str instanceof Array) || (str[0] && str.length)) {
				return [].slice.call(str);
			} else {
				return [str];
			}
		}
		if (!$.__create_dom_div__) {
			$.__create_dom_div__ = document.createElement('div');
		}
		$.__create_dom_div__.innerHTML = str;
		return [].slice.call($.__create_dom_div__.childNodes);
	};

	var panelBuffer = '<div class="mui-poppicker">\
		<div class="picker-title" style="display: none; background: #eee; border-bottom: 1px solid gray; color: #000; margin-top: -20px; text-align: center;">请选择</div>\
		<div class="mui-poppicker-header" style="margin: -5px 0px -20px 0px; ">\
			<button class="mui-btn mui-icon mui-icon-closeempty mui-btn-red mui-poppicker-btn-cancel" style="font-size:12pt;font-weight: bolder;"></button>\
			<input type="text" style="display:inline-block; width:50%; height:35px; padding: 0px 2px; margin-left: 3px;font-size: 11pt;" class="mui-input-clear mui-poppicker-text mui-search" value="" placeholder="548979"></input>\
			<button class="mui-btn mui-btn-primary mui-poppicker-btn-search" style="display:inline-block;height:34px; font-size:9pt;">搜索</button>\
			<button class="mui-btn mui-icon mui-icon-checkmarkempty mui-btn-green mui-btn-blue mui-poppicker-btn-ok" style="font-size:12pt;font-weight: bolder;"></button>\
			<div class="mui-poppicker-clear"></div>\
		</div>\
		<div class="mui-poppicker-body">\
		</div>\
	</div>';

	var pickerBuffer = '<div class="mui-picker">\
		<div class="mui-picker-inner">\
			<div class="mui-pciker-rule mui-pciker-rule-ft"></div>\
			<ul class="mui-pciker-list">\
			</ul>\
			<div class="mui-pciker-rule mui-pciker-rule-bg"></div>\
		</div>\
	</div>';

	//定义弹出选择器类
	var PopPicker = $.PopPicker = $.Class.extend({
		//构造函数
		init: function(options) {
			var self = this;
			self.options = options || {};
			self.options.buttons = self.options.buttons || ['取消', '搜索', '确定'];
			self.panel = $.dom(panelBuffer)[0];
			document.body.appendChild(self.panel);
			self.pickertitle = self.panel.querySelector('.picker-title');
			self.ok = self.panel.querySelector('.mui-poppicker-btn-ok');
			self.searchtext = self.panel.querySelector('.mui-poppicker-text');
			self.searchtext.placeholder = (self.options.placeholder ? self.options.placeholder : '');
			self.search = self.panel.querySelector('.mui-poppicker-btn-search');
			self.cancel = self.panel.querySelector('.mui-poppicker-btn-cancel');
			self.body = self.panel.querySelector('.mui-poppicker-body');
			self.mask = $.createMask();
			//			self.cancel.innerText = self.options.buttons[0];
			//			self.search.innerText = self.options.buttons[1];
			//			self.ok.innerText = self.options.buttons[2];
			self.cancel.addEventListener('tap', function(event) {
				self.hide();
			}, false);
			self.search.addEventListener('tap', function(event) {
				document.activeElement.blur();
				self.searchcallback(self.searchtext.value);
			}, false);
			self.ok.addEventListener('tap', function(event) {
				if (self.callback) {
					var rs = self.callback(self.getSelectedItems());
					if (rs !== false) {
						self.hide();
					}
				}
			}, false);
			self.mask[0].addEventListener('tap', function() {
				self.hide();
			}, false);
			self._createPicker();
			$.enterfocus('.mui-poppicker-btn-search', function() {
				self.searchcallback(self.searchtext.value);
				$.trigger(self.search, 'tap');
			});
			self.searchtext.addEventListener('keydown', function(event) {
				if (event.keyCode == 13) {
					document.activeElement.blur();
					self.searchcallback(self.searchtext.value);
				}
			}, false);
			//防止滚动穿透
			self.panel.addEventListener('touchstart', function(event) {
				if (!event.target.classList.contains('mui-poppicker-text')) {
					event.preventDefault();
				}
			}, false);
			self.panel.addEventListener('touchmove', function(event) {
				event.preventDefault();
			}, false);
		},
		_createPicker: function() {
			var self = this;
			var layer = self.options.layer || 1;
			var width = (100 / layer) + '%';
			self.pickers = [];
			for (var i = 1; i <= layer; i++) {
				var pickerElement = $.dom(pickerBuffer)[0];
				pickerElement.style.width = width;
				self.body.appendChild(pickerElement);
				var picker = $(pickerElement).picker();
				self.pickers.push(picker);
				pickerElement.addEventListener('change', function(event) {
					var nextPickerElement = this.nextSibling;
					if (nextPickerElement && nextPickerElement.picker) {
						var eventData = event.detail || {};
						var preItem = eventData.item || {};
						nextPickerElement.picker.setItems(preItem.children);
					}
				}, false);
			}
		},
		//填充数据
		setData: function(data) {
			var self = this;
			data = data || [];
			self.pickers[0].setItems(data);
		},
		//设置搜索文本 
		setSearchText: function(value) {
			var self = this;
			self.searchtext.value = value;
		},
		//设置搜索文本 
		setTitle: function(title) {
			var self = this;
			if (title) {
				self.pickertitle.innerHTML = title;
				self.pickertitle.style.display = "block";
			} else {
				self.pickertitle.style.display = "none";				
			}
		},
		//获取选中的项（数组）
		getSelectedItems: function() {
			var self = this;
			var items = [];
			//			for (var i in self.pickers) {
			//				var picker = self.pickers[i];
			//				items.push(picker.getSelectedItem() || {});
			//			}
			$.each(self.pickers, function(i, picker) {
				// var picker = self.pickers[i];
				items.push(picker.getSelectedItem() || {});
			});
			return items;
		},
		//显示
		show: function(callback, searchcallback) {
			var self = this;
			self.callback = callback;
			self.searchcallback = searchcallback;
			self.mask.show();
			document.body.classList.add($.className('poppicker-active-for-page'));
			self.panel.classList.add($.className('active'));
			//处理物理返回键
			self.__back = $.back;
			$.back = function() {
				self.hide();
			};
		},
		//隐藏
		hide: function() {
			var self = this;
			if (self.disposed) return;
			self.panel.classList.remove($.className('active'));
			self.mask.close();
			document.body.classList.remove($.className('poppicker-active-for-page'));
			//处理物理返回键
			$.back = self.__back;
		},
		dispose: function() {
			var self = this;
			self.hide();
			setTimeout(function() {
				self.panel.parentNode.removeChild(self.panel);
				for (var name in self) {
					self[name] = null;
					delete self[name];
				};
				self.disposed = true;
			}, 300);
		}
	});

})(mui, document);