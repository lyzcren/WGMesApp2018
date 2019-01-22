(function(owner, $) {
	// 等待框配置
	owner.loadingConfig = {
		height: '32px',
		icon: '/images/loading.png',
		interval: 200
	};
	owner.commonTitle = '请稍后...';
	owner.loadPageTitle = '页面加载中,请稍后...';
	/**
	 * 对NativeUI的封装
	 */
	(function() {
		owner.confirm = function(message, confirmCB) {
			plus.nativeUI.confirm(message, function(e) {
				if(confirmCB) confirmCB();
			}, "望果MES", ["是"]);
		};

		owner.confirmYesNo = function(message, confirmCB, cancelCB) {
			plus.nativeUI.confirm(message, function(e) {
				if(e.index == 0) {
					confirmCB();
				} else if(e.index == 1 && cancelCB) {
					cancelCB();
				}
			}, "望果MES", ["是", "否"]);
		};

		var iWaitingCount = 0;
		var waitingObj = null;
		owner.showWaiting = function(title, options) {
			options = $.extend(options, {
				loading: owner.loadingConfig
			});
			if(iWaitingCount <= 0 || !waitingObj) {
				plus.nativeUI.closeWaiting();
				waitingObj = plus.nativeUI.showWaiting(title, options);
				waitingObj.onclose = function() {
					iWaitingCount = 0;
				};
			} else {
				waitingObj.setTitle(title);
			}
			iWaitingCount++;

			return waitingObj;
		};
		owner.closeWaiting = function() {
			if(iWaitingCount > 0) iWaitingCount--;
			//			console.log(iWaitingCount);
			if(iWaitingCount <= 0) {
				waitingObj = null;
				plus.nativeUI.closeWaiting();
			}
		};
		owner.showCommonWaiting = function() {
			owner.showWaiting(owner.commonTitle);
		};

		owner.showLoadPageWaiting = function() {
			owner.showWaiting(owner.loadPageTitle, {
				modal: true, //等待框是否模态显示
				back: 'none' // 可取值"none"表示截获处理返回键，但不做任何响应；"close"表示截获处理返回键并关闭等待框；"transmit"表示不截获返回键，向后传递给Webview窗口继续处理（与未显示等待框的情况一致）。 
			});
			var t = setTimeout(function() {
				owner.closeWaiting();
			}, 5000);
		};

		/**
		 * 获取配置属性值
		 **/
		owner.getLocalValue = function(setttingName, defaultValue) {
			var stateText = localStorage.getItem('$' + setttingName) /*|| (defaultValue ? defaultValue : "{}")*/ ;
			if(stateText == null && defaultValue != undefined) return defaultValue;
			return JSON.parse(stateText);
		};

		/**
		 * 设置配置属性值
		 **/
		owner.setLocalValueBykey = function(setttingName, key, value) {
			value = value || {};
			var setting = owner.getLocalValue(setttingName, {});
			eval('setting.' + key + '=value');
			localStorage.setItem('$' + setttingName, JSON.stringify(setting));
		};

		/**
		 * 获取配置属性值
		 **/
		owner.getLocalValueBykey = function(setttingName, key, defaultValue) {
			var stateText = localStorage.getItem('$' + setttingName);
			if(stateText == null && defaultValue != undefined) return defaultValue;
			var setting = JSON.parse(stateText);
			if(!setting || !eval('setting.' + key)) {
				return defaultValue;
			}
			return eval('setting.' + key);
		};

		/**
		 * 设置配置属性值
		 **/
		owner.setLocalValue = function(setttingName, value) {
			value = value || {};
			localStorage.setItem('$' + setttingName, JSON.stringify(value));
		};
	}());

	owner.WaitFor = function(condition, callback, timeout, unitTime, bTimeoutCallback) {
		// 设置默认等待时间（循环间隔）
		if(!unitTime || isNaN(unitTime)) {
			unitTime = 100;
		}
		// 设置超时（到达超时则返回）
		if(!timeout || isNaN(timeout)) {
			timeout = 3000;
		}
		if(condition && condition()) { // 等待条件成立，则执行回调
			callback();
		} else if(timeout - unitTime <= 0) { // 等待超时，则执行回调
			if(bTimeoutCallback) callback();
		} else { // 设置延时等待操作
			setTimeout(function() {
				owner.WaitFor(condition, callback, timeout - unitTime, unitTime);
			}, unitTime);
		}
	};

	/**
	 * 合并两个json对象，如果存在相同属性，则使用第二个对象的属性覆盖 
	 * @param {Object} jsonObj
	 * @param {Object} jsonObj2
	 */
	owner.JsonExtend = function(jsonObj1, jsonObj2, isOverriden) {
		if(!jsonObj1) jsonObj1 = {};
		if(isOverriden) { // 覆盖（若jsonObj1与jsonObj2存在同名属性，则使用jsonObj2的属性值覆盖jsonObj1）
			$.each(jsonObj2, function(index, item) {
				jsonObj1[index] = item;
			});
		} else { // 不覆盖（若jsonObj1与jsonObj2存在同名属性，则使用jsonObj1中该属性的值）
			$.each(jsonObj2, function(index, item) {
				if(jsonObj1.hasOwnProperty(index)) { // jsonObj1中存在该属性，则使用jsonObj1中该属性的值

				} else { //使用jsonObj2中的该属性添加到jsonObj1中
					jsonObj1[index] = item;
				}
			});
		}
		return jsonObj1;
	};

}(window.wgyun = window.wgyun || {}, mui));