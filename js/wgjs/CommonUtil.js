/**
 * 共用JS工具
 **/
(function($, owner) {

	owner.LoginTimeout = 10000; // 10秒
	owner.ReportTimeout = 25000; // 25秒
	owner.AppID = '';
	owner.AccessKey = 'wgyun.com.cn';
	owner.ResVersion = '1';
	owner.AppVersion = 'X.X.X';
	// 特殊要求，是否允许列表查询
	owner.DisableGetList = false;
	// -- 本地服务器
	//	owner.HostUrl = 'http://202rh65759.iok.la:52259/Services';
	//	owner.WebUrl = 'http://202rh65759.iok.la:52259';
	// 正式服务器
	owner.HostUrl = 'http://192.168.1.221:8003/Services';
	owner.WebUrl = 'http://192.168.1.221:8000';

	owner.ErrorImgUrl = 'http://download.easyicon.net/png/1200675/617/';

	// 是否测试环境，用于判断是否导入测试包TestUtil
	owner.IsDebugMode = true;

	mui.plusReady(function() {
		owner.AppID = plus.device.uuid;
	});

	/**
	 * 以下方法用于打印对象到控制台
	 **/
	owner.print = function(obj) {
		console.log(JSON.stringify(obj));
	};

	/**
	 * json string to object
	 **/
	owner.toObject = function(sOjectJSON) {
		var target = eval('(' + (typeof(sOjectJSON) == 'function' && sOjectJSON.d ? sOjectJSON.d : sOjectJSON) + ')');
		return target;
	};

	/**
	 * @ver1, @ver2 maybe the value like '1.10.2' or '1.0' or '1.0.2.21'
	 * if @ver1 == @ver2 then return 0, if @ver1 > @ver2 then return 1, if @ver1 < @ver2 then return -1, 
	 **/
	owner.compareVersion = function(ver1, ver2) {
		var ver1s = ver1.split('.');
		var ver2s = ver2.split('.');
		for(var i = 0; i < ver1s.length; i++) {
			if(i < ver2s.length) {
				var v1 = ver1s[i] * 1;
				var v2 = ver2s[i] * 1;
				if(v1 == v2) {
					if(i == ver1s.length - 1) {
						if(ver1s.length == ver2s.length) {
							return 0;
						} else if(ver1s.length < ver2s.length) {
							return -1;
						}
					} else {
						continue;
					}
				} else if(v1 > v2) {
					return 1;
				} else {
					return -1;
				}
			} else {
				return 1;
			}
		}
		var target = eval('(' + (typeof(sOjectJSON) == 'function' && sOjectJSON.d ? sOjectJSON.d : sOjectJSON) + ')');
		return target;
	};

	/**
	 * 判断是否时间格式 (yyyy-MM-dd)
	 * @param {Object} sDate
	 */
	owner.isDate = function(sDate) {
		var a = /((((1[6-9]|[2-9]\d)\d{2})-(1[02]|0?[13578])-([12]\d|3[01]|0?[1-9]))|(((1[6-9]|[2-9]\d)\d{2})-(1[012]|0?[13456789])-([12]\d|30|0?[1-9]))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(1\d|2[0-8]|0?[1-9]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))/;
		if(a.test(sDate)) {
			return true;
		}

		return false;
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	};

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	};

	/**
	 * 获取已登录用户信息
	 **/
	owner.setUserInfo = function(user) {
		user = user || {};
		localStorage.setItem('$user', JSON.stringify(user));
	};

	/**
	 * 设置已登录用户信息
	 **/
	owner.getUserInfo = function() {
		var userText = localStorage.getItem('$user') || "{}";
		return JSON.parse(userText);
	};

	/**
	 * 获取已登录用户标识
	 **/
	owner.setAppSecurityHeader = function(appHeader) {
		appHeader = appHeader || {};
		localStorage.setItem('$AppSecurityHeader', JSON.stringify(appHeader));
	};

	/**
	 * 设置已登录用户标识
	 **/
	owner.getAppSecurityHeader = function() {
		var appText = localStorage.getItem('$AppSecurityHeader') || "{}";
		return JSON.parse(appText);
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

	/**
	 * 获取当前日期 
	 */
	owner.getToday = function() {
		return owner.getFormatDate(new Date());
	};

	owner.getNextDate = function(day) {
		var d = new Date();
		d = d.addDays(day ? day : 0);

		return owner.getFormatDate(d);
	};

	owner.getNowFormatDate = function() {
		var date = new Date();
		var seperator1 = "-";
		var seperator2 = ":";
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		var hour = date.getHours();
		var minute = date.getMinutes();
		if(month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if(strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		if(hour <= 9) {
			hour = "0" + hour;
		}
		if(minute <= 9) {
			minute = "0" + minute;
		}
		//		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		//			" " + date.getHours() + seperator2 + date.getMinutes() +
		//			seperator2 + date.getSeconds();
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
			" " + hour + seperator2 + minute;
		return currentdate;
	}

	/**
	 * 获取格式化日期 
	 * @param {Object} d 日期
	 */
	owner.getFormatDate = function(d) {
		var fdate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
		return fdate;
	};

	owner.getUserConfigColumns = function(fNumber) {
		return CommonUtil.getLocalValue('UCC_' + fNumber);
	};

	owner.setUserConfigColumns = function(fNumber, mColumns) {
		return CommonUtil.setLocalValue('UCC_' + fNumber, mColumns);
	};

	/**
	 * 开关是否打开
	 **/
	owner.isSwitchOn = function(id) {
		var isActive = document.getElementById(id).classList.contains("mui-active");
		return isActive;
	};

	owner.openDatePicker = function(that) {
		that.addEventListener('tap', function() {
			var dDate = new Date();
			var defDate = FormatUtil.ToShortDate(that.innerText)
			if(defDate) {
				try {
					dDate = new Date(that.innerText);
				} catch(e) {}
			}
			//				dDate.setFullYear(2014, 7, 16);
			var minDate = new Date();
			minDate.setFullYear(2010, 0, 1);
			var maxDate = new Date();
			maxDate.setFullYear(2016, 11, 31);
			plus.nativeUI.pickDate(function(e) {
				var d = e.date;
				that.innerText = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
			}, function(e) {
				// alert("您没有选择日期");
			}, {
				title: "请选择日期",
				date: dDate,
				minDate: minDate,
				maxDate: maxDate
			});
		});
	};

	owner.openTimePicker = function(that) {
		that.addEventListener('tap', function() {
			var dDate = new Date();
			var defDate = FormatUtil.ToShortDate(that.innerText)
			if(defDate) {
				try {
					dDate = new Date(that.innerText);
				} catch(e) {}
			}
			plus.nativeUI.pickTime(function(e) {
				var d = e.date;
				that.innerText = d.getHours() + ":" + d.getMinutes();
			}, function(e) {
				// alert("您没有选择日期");
			}, {
				title: "请选择时间",
				time: dDate
			});
		});
	};

	// 从url中解析参数
	// url:需要查找的url
	// name:查找的参数名称
	// return:返回参数值，无则返回""
	owner.getQueryStr = function(url, name) {
		var rs = new RegExp("(^|)" + name + "=([^&]*)(&|$)", "gi").exec(url),
			tmp;
		if(tmp = rs) {
			return tmp[2];
		}
		// parameter cannot be found
		return "";
	};

	/**
	 * ele不能是type='Number'或者限制数字的输入框
	 * @param {Object} ele
	 * @param {Object} prop
	 * @param {Object} val
	 */
	owner.setFormatDecimalVal = function(ele, prop, val) {
		val = FormatUtil.DeformatDecimal(val);
		var formatVal = FormatUtil.FormatDecimal(val, 2);
		eval('ele.' + prop + ' = "' + formatVal + '"');
	};

	owner.getFormatDecimalVal = function(ele, prop) {
		var val;
		if(prop) {
			val = eval('ele.' + prop);
		} else {
			val = ele.value;
		}
		val = FormatUtil.DeformatDecimal(val);
		return val;
	};

	/**
	 * 封装WGMes相关参数的ajax方法
	 * @param {Object} url
	 * @param {Object} queryParas 传递给ajax方法的参数对象，此ajax方法统一只有QueryString参数
	 * @param {Object} callback
	 * @param {Object} showWaiting
	 * @param {Object} type		owner.ajaxType.post | owner.ajaxType.get
	 */
	owner.ajax = function(url, queryParas, callback, showWaiting, type) {
		if(showWaiting) {
			wgyun.showWaiting('请稍后...');
		}
		var ajaxData = {
			Params: queryParas,
			SecurityHeader: CommonUtil.getAppSecurityHeader()
		};
		if(type == owner.ajaxType.post || !type) {
			type = 'POST';
		} else if(type == owner.ajaxType.get) {
			type = 'GET';
		}
		if(url.startsWith('/')) {
			url = CommonUtil.HostUrl + url;
		}
		$.ajax(url, {
			data: JSON.stringify({
				QueryString: JSON.stringify(ajaxData)
			}),
			contentType: 'application/json; charset=utf-8', // 提交的参数是JSON格式时,要设置contentType
			dataType: 'json', //服务器返回json格式数据
			type: type, //HTTP请求类型
			timeout: CommonUtil.ReportTimeout, //超时时间设置为25秒；
			success: function(data, b, c) {
				if(showWaiting) {
					wgyun.closeWaiting();
				}
				data = CommonUtil.toObject(data.d);
				if(data.FIsNeedRelogin) {
					mui.toast(data.FMsg);
				} else {
					callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				//解决页面关闭后ajax返回导致的错误
				if(type == 'abort') {} else {
					$.alert((xhr.responseText ? ('服务异常: ' + xhr.responseText) : '服务异常'), '望果MES');
				}
				wgyun.closeWaiting();
			}
		});
	};

	owner.GetListPager = function(url, queryParas, mescroll, successCallback, errorCallback) {
		if(window.plus && plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE) {
			mui.toast('似乎已断开与互联网的连接', {
				verticalAlign: 'top'
			});
			return;
		}
		// 禁用查询列
		if(CommonUtil.DisableGetList) {
			owner.resetPullrefresh(type, true);
			mui.toast('当前禁止查询!');
			return;
		}

		var ajaxData = {
			Params: queryParas,
			SecurityHeader: CommonUtil.getAppSecurityHeader()
		};
		mui.ajax(url, {
			data: JSON.stringify({
				QueryString: JSON.stringify(ajaxData)
			}),
			contentType: 'application/json; charset=utf-8', // 提交的参数是JSON格式时,要设置contentType
			dataType: 'json', //服务器返回json格式数据
			type: 'POST', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data, b, c) {
				data = CommonUtil.toObject(data.d);
				if(data.FIsSuccess) {
					var pager = data.FObject;
					var noMoreData = (Math.ceil(pager.total / pager.PageSize) <= pager.PageIndex);
					successCallback(pager);
					//联网成功的回调,隐藏下拉刷新的状态
					mescroll.endSuccess(pager.rows.length, true);
				} else {
					mui.toast(data.FMsg);
					mescroll.endErr();
				}
			},
			error: function(xhr, type, errorThrown) {
				if(errorCallback) errorCallback(xhr);
				//联网失败的回调,隐藏下拉刷新的状态
				mescroll.endErr();
				$.alert((xhr.responseText ? ('服务异常: ' + xhr.responseText) : '服务异常'), '望果MES');
			}
		});
	};

	owner.ajaxType = {
		post: 0x1,
		get: 0x2
	};

}(mui, window.CommonUtil = {}));

/**
 * 用户请求信息头，包含：企业ID, 用户ID, 当前设备ID, 调用接口的默认验证码AccessKey
 **/
(function($, owner) {
	owner.FDeptID = 0;
	owner.FUserID = 0;
	owner.AppID = '';
	owner.FServerDB = '';
	owner.AccessKey = '';

	/**
	 * 初始化
	 **/
	owner.init = function(user, fServerDB) {
		if(user) {
			owner.FDeptID = user.FDeptID;
			owner.FUserID = user.FItemID;
			owner.FServerDB = fServerDB;
			owner.AppID = CommonUtil.AppID;
			owner.AccessKey = CommonUtil.AccessKey;

			CommonUtil.setAppSecurityHeader(owner);
		}
	};

}(mui, window.AppSecurityHeader = {}));

function BitmapHelper() {
	var wdt_rightFirst = window.innerWidth - 34;
	var wdt_rightSecond = window.innerWidth - 68;
	var _callbackRightFirst, _callbackRightSecond;

	var ws = plus.webview.currentWebview();
	//绘制顶部图标
	var titleView = ws.getNavigationbar();
	if(!titleView) {
		titleView = plus.webview.getLaunchWebview().getNavigationbar();
	}

	titleView.interceptTouchEvent(true);
	titleView.addEventListener("click", function(e) {
		var x = e.clientX;
		if(x > wdt_rightFirst) { //触发右侧第一个按钮事件
			if(_callbackRightFirst) {
				_callbackRightFirst();
			}
		} else if(x > wdt_rightSecond) { //触发右侧第二个按钮事件
			if(_callbackRightSecond) {
				_callbackRightSecond();
			}
		}
	}, false);

	function _genBitmap(bitmap) {
		return {
			bitmap: bitmap,
			attachRightFirst: function(callback) {
				titleView.drawBitmap(bitmap, {}, {
					top: "10px",
					left: wdt_rightFirst + "px",
					width: "24px",
					height: "24px"
				});
				_callbackRightFirst = callback;
			},
			attachRightSecond: function(callback) {
				titleView.drawBitmap(bitmap, {}, {
					top: "10px",
					left: wdt_rightSecond + "px",
					width: "24px",
					height: "24px"
				});
				_callbackRightSecond = callback;
			}
		};
	};

	this.topMenu = function() {
		var bitmap = new plus.nativeObj.Bitmap("menu");
		// 颜色 #1296db
		bitmap.loadBase64Data("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAKlBMVEUAAAAAev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8AAABINtoqAAAADHRSTlMA/fPQ0M/e3tzs7OjgY5g4AAAAAWJLR0QAiAUdSAAAAAd0SU1FB+EBFwEbOGGUPSIAAAA2SURBVDjLY2AY9oDxDBZwCJ8EswsW4DrQ/hicgPTQZSvHAioG2h+DE5AeupyrsIDVA+0PqgEAu36BkQX5nBQAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMDEtMjNUMDE6Mjc6NTYrMDg6MDC8FK1uAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTAxLTIzVDAxOjI3OjU2KzA4OjAwzUkV0gAAAABJRU5ErkJggg==");
		return _genBitmap(bitmap);
	};

	this.searchMenu = function() {
		var bmpSearch = new plus.nativeObj.Bitmap("search");
		bmpSearch.loadBase64Data("data:image/png;base64,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");
		return _genBitmap(bmpSearch);
	}

	this.moreMenu = function() {
		var bitmap = new plus.nativeObj.Bitmap("more");
		// 颜色 #1296db
		bitmap.loadBase64Data("data:image/png;base64,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");
		return _genBitmap(bitmap);
	};
}

/**
 * 查询条件工具
 **/
(function($, owner) {

	owner.LeftQuoteArray = [{
		value: '',
		text: '<空>'
	}, {
		value: '(',
		text: '('
	}, {
		value: '((',
		text: '(('
	}, {
		value: '(((',
		text: '((('
	}, {
		value: '((((',
		text: '(((('
	}];
	owner.RightQuoteArray = [{
		value: '',
		text: '<空>'
	}, {
		value: ')',
		text: ')'
	}, {
		value: '))',
		text: '))'
	}, {
		value: ')))',
		text: ')))'
	}, {
		value: '))))',
		text: '))))'
	}];
	owner.LogicArray = [{
		value: 'And',
		text: '且'
	}, {
		value: 'Or',
		text: '或'
	}];

	owner.CompareArray = [{
		value: '%*%',
		text: '包含'
	}, {
		value: '=',
		text: '等于'
	}, {
		value: '>',
		text: '大于'
	}, {
		value: '<',
		text: '小于'
	}, {
		value: '<=',
		text: '不大于'
	}, {
		value: '>=',
		text: '不小于'
	}, {
		value: '<>',
		text: '不等于'
	}, {
		value: '^',
		text: '不包含'
	}, {
		value: '*%',
		text: '左包含'
	}, {
		value: '%*',
		text: '右包含'
	}, {
		value: 'TRUE',
		text: '真值'
	}, {
		value: 'FALSE',
		text: '非真值'
	}];

	// 创建过滤条件
	owner.create = function(fLeftQuote, fName, fCompare, fValue, fRightQuote, fLogic) {
		return {
			FLeftQuote: fLeftQuote,
			FName: fName,
			FCompare: fCompare,
			FValue: fValue,
			FRightQuote: fRightQuote,
			FLogic: fLogic
		};
	};
	// 追加过滤条件
	owner.appendFilter = function(arr, filter) {
		arr.push(owner.create(filter.FLeftQuote, filter.FName, filter.FCompare, filter.FValue, filter.FRightQuote, filter.FLogic));
		return arr;
	};
	// 追加过滤条件
	owner.appendTo = function(arr, fLeftQuote, fName, fCompare, fValue, fRightQuote, fLogic) {
		arr.push(owner.create(fLeftQuote, fName, fCompare, fValue, fRightQuote, fLogic));
		return arr;
	};
	// 根据字段名取查询条件
	owner.popFilterByField = function(arr, field) {
		var f;
		mui.each(arr, function(index, element) {
			if(element.FName == field) {
				f = element;
				arr.removeAt(index);
				return false;
			}
		});
		return f;
	};
	// 过滤条件的两边加括号
	owner.surroundQuote = function(arrFilter) {
		if(arrFilter && arrFilter.length > 0) {
			arrFilter[0].FLeftQuote += '(';
			arrFilter[arrFilter.length - 1].FRightQuote += ')';
		}
		return arrFilter;
	};
	// 最后一个逻辑条件追加'And'
	owner.appendAnd2Last = function(arrFilter) {
		if(arrFilter.length > 0) arrFilter[arrFilter.length - 1].FLogic = 'And';
		return arrFilter;
	};
	// 去掉最后一个逻辑运算符
	owner.trimLastLogic = function(arrFilter) {
		if(arrFilter.length > 0) arrFilter[arrFilter.length - 1].FLogic = '';
		return arrFilter;
	};
	// 合并两个过滤条件数组
	owner.merge = function(arrFilter1, arrFilter2) {
		if(!arrFilter2 || arrFilter2.length <= 0) {
			if(arrFilter1.length > 0) arrFilter1[arrFilter1.length - 1].FLogic = '';
		} else {
			$.extend(arrFilter1, arrFilter2);
		}
		return arrFilter1;
	};

	owner.genQueryModel = function(arrFilter) {
		var pm = {
			page: 1,
			rows: 12,
			Filter: arrFilter,
			GetCount: true,
			TopCount: 0
		};
		return pm;
	};

}(mui, window.FilterUtil = {}));

/**
 * 用户请求信息头，包含：企业ID, 用户ID, 当前设备ID, 调用接口的默认验证码AccessKey
 **/
(function($, owner) {
	owner.FormatDecimal = function(s, n) {
		if(!isNaN(s)) {
			if(s) {
				return owner.FormatMoney(s, n);
			} else {
				return owner.FormatMoney(0, n);
			}
		} else {
			return '';
		}
	};

	owner.DeformatDecimal = function(s) {
		if(isNaN(s)) {
			if(s) {
				var val = s.replace(',', '');
				if(!isNaN(val)) {
					s = val;
				}
			}
		}
		return s;
	};

	owner.FormatMoney = function(num, decimal, group) {
		group = group == undefined ? ',' : group;
		decimal = decimal > 0 && decimal <= 20 ? decimal : 2;
		num = parseFloat((num + "").replace(/[^\d\.-]/g, "")).toFixed(decimal) + "";
		if(num.split('.').length < 2) {
			return num;
		}
		var mIsNg = num < 0;
		var l = (mIsNg ? num * -1 + '' : num).split(".")[0].split("").reverse(),
			r = num.split(".")[1];
		t = "";
		for(i = 0; i < l.length; i++) {
			t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
		}
		if(mIsNg) t = t + '-';
		return t.split("").reverse().join("") + "." + r;
	};

	owner.ToShortDate = function(value, row, index) {
		var r = /\d{1,4}-\d{1,2}-\d{1,2}/;
		var v = r.exec(value);
		if(v && v != '1900-01-01') return v;
		else return '';
	};

	owner.ToShortDateTime = function(value, row, index) {
		var r1 = /\d{1,4}-\d{1,2}-\d{1,2}/;
		var sDate = r1.exec(value);
		var r2 = /\d{1,2}:\d{1,2}:\d{1,2}/;
		var sTime = r2.exec(value);
		var sDatetime = (sDate ? sDate + ' ' : '') + (sTime ? sTime : '');
		if(sDatetime) return sDatetime;
		else return '';
	};

	owner.AmountCell = function(value) {
		return '￥' + owner.FormatDecimal(value, 2);
	};
	owner.PriceCell = function(value) {
		return '￥' + owner.FormatDecimal(value, 2);
	};
	owner.RateCell = function(value) {
		return owner.FormatDecimal(value, 2);
	};
	owner.QtyCell = function(value) {
		return owner.FormatDecimal(value, 2);
	};

	owner.PercentCell = function(s) {
		if(!isNaN(s)) {
			var n = 0;
			s = Math.round(s * 100, 0);
			//        if (s) {
			//            return NumberUtil.FormatMoney(s, n) + '%';
			//        }
			//        else {
			//            return NumberUtil.FormatMoney(0, n) + '%';
			//        }
			return s + '%';
		} else {
			return '0%';
		}
	}

	owner.PercentCell2 = function(s) {
		if(!isNaN(s)) {
			var n = 2;
			s = s * 100;
			if(s) {
				return NumberUtil.FormatMoney(s, n) + '%';
			} else {
				return NumberUtil.FormatMoney(0, n) + '%';
			}
		} else {
			return '0%';
		}
	}

	owner.PercentCellWithDecimal = function(s, dec) {
		if(isNaN(dec)) {
			dec = 2;
		}
		if(!isNaN(s)) {
			s = s * 100;
			if(s) {
				return NumberUtil.FormatMoney(s, dec) + '%';
			} else {
				return NumberUtil.FormatMoney(0, dec) + '%';
			}
		} else {
			return NumberUtil.FormatMoney(0, dec) + '%';
		}
	}

	owner.FormatDecimal2 = function(s) {
		if(!isNaN(s)) {
			var n = 2; // 默认精度为2
			if(s) {
				return NumberUtil.FormatMoney(s, n);
			} else {
				return NumberUtil.FormatMoney(0, n);
			}
		} else {
			return '';
		}
	}
	owner.FormatDecimal4 = function(value) {
		return owner.FormatDecimal(value, 4);
	};
	owner.FormatFeeType = function(value) {
		if(value == 0)
			return '收入';
		else
			return '支出';
	};
	owner.YMD2CN = function(value, row, index) {
		if(row.FIsFooterData) return "";
		var val = '';
		if(value) {
			if(value.indexOf('Y') > -1) {
				val += '年';
			}
			if(value.indexOf('M') > -1) {
				val += '月';
			}
			if(value.indexOf('D') > -1) {
				val += '日';
			}
		}
		return val;
	};
	owner.Bool2Check = function(value, row, index) {
		if(row && row.FIsFooterData) return "";
		var val = '';
		if(value == true || value == 'true') {
			val = '是';
		} else {
			val = '否';
		}
		return val;
	};

}(mui, window.FormatUtil = {}));
window.DataGridUtil = window.FormatUtil;
(function($, owner) {
	owner.Up = 1;
	owner.Down = 2;
	owner.Search = 3;
}(mui, window.RefreshType = {}));

/**
 * 保存在本地的相关设置
 **/
(function($, owner) {

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettingsByName = function(name, settings) {
		settings = settings || {};
		localStorage.setItem('$' + name, JSON.stringify(settings));
	};

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettingsByName = function(name) {
		var settingsText = localStorage.getItem('$' + name) || "{}";
		return JSON.parse(settingsText);
	};

}(mui, window.Settings = {}));

(function($, owner) {
	var RegRules = {
		CHS: { //验证汉字  
			validator: function(value) {
				return /^[\u0391-\uFFE5]+$/.test(value);
			},
			message: 'The input Chinese characters only.'
		},
		QQ: {
			validator: function(value) {
				return /^\d{5,13}$/.test(value);
			},
			message: '请输入正确QQ号码格式(5-13位数字组成).'
		},
		QQs: {
			validator: function(value) {
				return /^(\d{5,13}){0,}(\s{0,}\d{5,13}\s{1,}){0,}\d{5,13}$/.test(value);
			},
			message: '请输入正确QQ号码格式(5-13位数字组成,多个号码用空格间隔开).'
		},
		Email: {
			validator: function(value) {
				return /^.+@.+\.[a-zA-Z]{2,4}$/.test(value);
			},
			message: '请输入正确邮箱格式.'
		},
		Emails: {
			validator: function(value) {
				return /^(.+@.+\.[a-zA-Z]{2,4}$){0,}(\s{0,}.+@.+\.[a-zA-Z]{2,4}\s{1,}){0,}.+@.+\.[a-zA-Z]{2,4}$/.test(value);
			},
			message: '请输入正确邮箱格式(多个邮箱用空格间隔开).'
		},
		Mobile: { //移动手机号码验证
			validator: function(value) {
				var reg = /^1[3|4|5|6|7|8|9]\d{9}$/;
				return reg.test(value);
			},
			message: '请输入正确的手机号码.'
		},
		Mobiles: { //移动手机号码验证
			validator: function(value) {
				var reg = /^(1[3|4|5|6|7|8|9]\d{9}){0,}(\s{0,}1[3|4|5|6|7|8|9]\d{9}\s{1,}){0,}1[3|4|5|6|7|8|9]\d{9}$/;
				return reg.test(value);
			},
			message: '请输入正确的手机号码(多个号码用空格间隔开).'
		},
		EmailMobile: {
			validator: function(value) {
				return /^(1[3|4|5|6|7|8|9]\d{9}|.+@.+\.[a-zA-Z]{2,4})$/.test(value);
			},
			message: '请输入正确的邮箱/电话号码.'
		},
		Telephone: { //座机号码验证 
			validator: function(value) {
				var reg = /^(\d{3,4}){0,}[-]{0,1}\d{7,8}$/;
				return reg.test(value);
			},
			message: '请输入正确的固定电话号码.'
		},
		Telephones: { //座机号码验证
			validator: function(value) {
				var reg = /^((\d{3,4}){0,}[-]{0,1}\d{7,8}){0,}(\s{0,}(\d{3,4}){0,}[-]{0,1}\d{7,8}\s{1,}){0,}(\d{3,4}){0,}[-]{0,1}\d{7,8}$/;
				return reg.test(value);
			},
			message: '请输入正确的固定电话号码(多个号码用空格间隔开).'
		},
		Fax: {
			validator: function(value) {
				var reg = /^(\d{3,4}){0,}[-]{0,1}\d{7,8}$/;
				return reg.test(value);
			},
			message: '请输入正确的传真号码.'
		},
		Faxes: {
			validator: function(value) {
				var reg = /^((\d{3,4}){0,}[-]{0,1}\d{7,8}){0,}(\s{0,}(\d{3,4}){0,}[-]{0,1}\d{7,8}\s{1,}){0,}(\d{3,4}){0,}[-]{0,1}\d{7,8}$/;
				return reg.test(value);
			},
			message: '请输入正确的传真号码(多个号码用空格间隔开).'
		},
		ZipCode: { //国内邮编验证
			validator: function(value) {
				var reg = /^[0-9]\d{5}$/;
				return reg.test(value);
			},
			message: '请输入6位邮政编码.'
		},
		Number: { //数字
			validator: function(value) {
				var reg = /^[0-9]*$/;
				return reg.test(value);
			},
			message: '请输入数字.'
		},
		PositiveDecimal: { //正浮点数字 
			validator: function(value, param) {
				var reg = /^(\d+|0.{0,1}|\d+\.{0,1}\d+)$/;
				return reg.test(value);
			},
			message: '请输入正数.'
		},
		NegativeDecimal: { //负浮点数字
			validator: function(value) {
				var reg = /^-(\d+|0.{0,1}|\d+\.{0,1}\d+)$/;
				return reg.test(value);
			},
			message: '请输入负数.'
		},
		Decimal: { //浮点数字 
			validator: function(value) {
				var reg = /^-{0,1}(\d+|0.{0,1}|\d+\.{0,1}\d+)$/;
				return reg.test(value);
			},
			message: '请输入有效数值.'
		},
		BankCard: {
			validator: function(value) {
				var reg = /^((\d{16}|\d{19})|(\d{4}(?:\s\d{4}){3}(\s\d{3}){0,1}))$/;
				return reg.test(value);
			},
			message: '请输入16位或19位的卡号.'
		},
		MaxLength: { //最大长度  
			validator: function(value, param) {
				return param[0] >= value.length;
			},
			message: '最大允许{0}个位字符.'
		},
		Max: { //最大值  
			validator: function(value, param) {
				return param[0] >= value;
			},
			message: '最大值不能大于{0}.'
		},
		Min: { //最大值  
			validator: function(value, param) {
				return param[0] <= value;
			},
			message: '最小值不能小于{0}.'
		},
		BillNo: {
			validator: function(value) {
				var reg = /^[_\-A-Za-z0-9]{1,25}$/;
				return reg.test(value);
			},
			message: '必须为数字、字母、横杠或下划线，且不超过25个字符.'
		},
		Password: {
			validator: function(value) {
				var reg = /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~_]{6,24}$/;
				return reg.test(value);
			},
			message: '可以为数字、字母或特殊字符(~!@#$%^&*._), 且长度在6-24个字符之间.'
		}
	};

	owner.Validate = function(value, type, invalidMessage) {
		if(!value) { // 值为空时不验证
			return true;
		}
		// 针对多个验证，对数组进行处理
		if(type[0] == '[' && type[type.length - 1] == ']') {
			type = type.substring(1, type.length - 1);
		}
		var validatorArray = type.split(',');
		for(var i = 0, len = validatorArray.length; i < len; i++) {
			var currenttype = validatorArray[i].trim();
			var validName = currenttype;
			var validPara = null;
			if(currenttype.indexOf('[') >= 0) {
				validName = currenttype.split('[')[0];
				validPara = currenttype.split('[')[1].replace(']', '').split(',');
			}
			if(!RegRules[validName]) {
				return true;
			}
			var validator = RegRules[validName].validator;
			if(!validator(value, validPara)) {
				if(invalidMessage) {
					mui.toast(invalidMessage);
				} else {
					mui.toast(RegRules[validName].message.format(validPara))
				}
				return false;
			}
		}

		return true;
	};

	owner.ValidateElement = function(element) {
		if(!element.value) {
			if(element.getAttribute("missingMessage")) {
				mui.toast(element.getAttribute("missingMessage"))
			}
			NativeUtil.focusAndOpenKeyboard(element);

			return false
		}
		if(!owner.Validate(element.value, element.getAttribute("validType"), element.getAttribute("invalidMessage"))) {
			NativeUtil.focusAndOpenKeyboard(element);
			return false;
		}
		return true;
	}

	owner.ValidateForm = function(selector, postProperty) {
		// 必填验证(requied='true')
		var isRulePass = true;
		if(!postProperty) postProperty = 'isPost';
		$(selector + " input[required=required], " + selector + " input[required]").each(function(index, item) {
			var dataType = item.getAttribute('data-type');
			if(isRulePass && ((dataType != 'int' && !item.value && item.value.toString() != '0') || (dataType == 'int' && item.value == 0))) {
				if(item.getAttribute("missingMessage")) {
					mui.toast(item.getAttribute("missingMessage"));
				}
				NativeUtil.focusAndOpenKeyboard(item);
				isRulePass = false;
				return false;
			}
		});
		// 正则验证(validType)
		$(selector + " input[validType]").each(function(index, item) {
			if(isRulePass) {
				if(!owner.Validate(item.value, item.getAttribute("validType"), item.getAttribute("invalidMessage"))) {
					NativeUtil.focusAndOpenKeyboard(item);
					isRulePass = false;
					return false;
				}
			}
		});

		return isRulePass;
	};

	owner.GetObjectJSON = function(formID, postProperty) {
		var jsonRst = '';
		var infoArray = new Array();
		if(!postProperty) postProperty = 'isPost';
		$(formID + ' input[' + postProperty + '="true"], ' + formID + ' div[' + postProperty + '="true"], ' + formID + ' button[' + postProperty + '="true"], ' + formID + ' textarea[' + postProperty + '="true"], ' + formID + ' select[' + postProperty + '="true"]')
			.each(function(index, element) {
				var fieldName = element.getAttribute('data-field');
				if(!fieldName) {
					fieldName = element.getAttribute('name'); // 未指定字段时，使用name中的值
					if(!fieldName) {
						fieldName = element.getAttribute('id'); // 未指定字段时，使用id中的值
					}
				}
				var t = element.getAttribute('type');
				var datatype = element.getAttribute('data-type');
				var value = '';
				if(t == 'number' && (element.value == '' || element.value == undefined)) {
					value = 0;
				} else if(element.classList.contains("mui-input")) {
					value = element.value;
				} else if(datatype == 'bit') {
					if(element.classList.contains('mui-active')) {
						value = 1;
					} else {
						value = 0;
					}
				} else if(datatype == 'radio') {
					value = $(formID + ' input:radio[name="' + fieldName + '"]:checked')[0].value;
				} else if(t == 'checkbox') {
					value = element.checked ? '1' : '0';
				} else if(t == 'button') {
					if(element.innerText != element.placeholder) {
						value = element.innerText;
					} else {
						value = '';
					}
				} else {
					value = element.value;
				}
				// 反格式化数据
				switch(datatype) {
					case 'decimal':
						{
							value = FormatUtil.DeformatDecimal(value);
						}
						break;
				}
				infoArray.push('{"FName":' + JSON.stringify(fieldName) + ', "FValue":' + JSON.stringify(value) + '}');
			});
		jsonRst = '[' + infoArray.join(', ') + ']';

		return jsonRst;
	};

	// append data field
	owner.AppendField2JSONString = function(strField, fieldName, fieldValue) {
		var left = strField ? strField.substr(0, strField.length - 1) : '[';
		var middle = '{"FName":' + JSON.stringify(fieldName) + ', "FValue":' + JSON.stringify(fieldValue != undefined ? fieldValue : '') + '}';
		var right = ']';
		return left + (left.length > 1 ? ', ' : '') + middle + right;
		//		return strField.substr(0, strField.length - 1) + ', {"FName":' + JSON.stringify(fieldName) + ', "FValue":' + JSON.stringify(fieldValue != undefined ? fieldValue : '') + '}]';
	}

	owner.SetData = function(formID, dataObj) {
		if(!dataObj) {
			return;
		}
		mui(formID + ' input, ' + formID + ' textarea, ' + formID + ' button, ' + formID + ' div').each(function(index, element) {
			var fieldName = element.getAttribute('data-field');
			if(!fieldName) {
				fieldName = element.getAttribute('name'); // 未指定字段时，使用name中的值
				if(!fieldName) {
					fieldName = element.getAttribute('id'); // 未指定字段时，使用id中的值
				}
			}
			//var id = element.getAttribute('id');
			if(fieldName /* && id*/ ) {
				var v = dataObj[fieldName];
				owner.SetField(element, v);
			}
		});
	};

	owner.SetPartData = function(formID, dataObj) {
		if(!dataObj) {
			return;
		}
		mui.each(dataObj, function(index, element) {
			var targetElements = document.querySelectorAll('[name="' + index + '"]');
			mui.each(targetElements, function(index, targetElement) {
				if(targetElement) {
					FormUtil.SetField(targetElement, element);
				}
			});
		});
	};

	owner.SetField = function(element, ov) {
		var formatter = element.getAttribute('FFormatter');
		var t = element.getAttribute('type');
		var dataType = element.getAttribute('data-type');
		var v;
		if(ov == undefined) {
			if(t == 'number')
				ov = '0';
			else if(element.classList.contains('mui-switch'))
				ov = 'false';
			else
				ov = '';
		}
		// 格式化
		if(formatter && formatter != 'undefined') {
			v = eval('(' + formatter + '("' + ov + '"))');
		} else {
			v = ov;
		}

		if(element.classList.contains('wg-input-search')) {
			element.querySelector('.mui-input').value = v;
		} else if(element.classList.contains('wg-input-bit')) {
			if(ov == 'true' || ov == true) {
				element.value = '是';
			} else {
				element.value = '否';
			}
		} else if(element.classList.contains('mui-switch')) {
			if(ov == 'true' || ov == true) {
				element.classList.add('mui-active');
			} else {
				element.classList.remove('mui-active');
			}
		} else if(element.classList.contains('mui-numbox') || t == 'number') {
			// 防止金额'￥'、','赋无效值
			if(isNaN(v)) {
				v = v.replace(new RegExp(',|￥', 'gm'), '');
				if(isNaN(v)) {
					v = 0;
				}
			}
			element.value = v;
			mui('.mui-numbox').numbox();
		} else if(element.classList.contains('mui-input')) {
			element.value = v;
		} else if(dataType == 'date') {
			if(v != null && v != '') {
				if(!formatter) {
					v = DataGridUtil.ToShortDate(v);
				}
				element.innerText = (v ? v : null);
			}
		} else if(dataType == 'dateTime') {
			if(v != null && v != '') {
				if(!formatter) {
					v = DataGridUtil.ToShortDateTime(v);
				}
				element.innerText = (v ? v : null);
			}
		} else if(dataType = 'pick') {
			if(!v) { // pick选择后返回空值
				v = element.placeholder ? element.placeholder : '';
			}
			if(element.classList.contains('mui-input')) {
				element.value = v;
			} else if(element.nodeName.toLowerCase() == 'div') {
				element.innerHTML = v;
			} else if(element.nodeName.toLowerCase() == 'span') {
				element.innerHTML = v;
			} else if(element.nodeName.toLowerCase() == 'button') {
				element.innerHTML = v;
			}
		} else if(dataType == 'bit') {
			element.vlaue = v;
		} else {
			element.value = v;
		}
	};

	//	/**
	//	 * 使用一个FieldValue键值对 “[{"FName":"FProductID", "FValue":""}, {"FName":"FStockID", "FValue":"9"}]”的各个值修改对象
	//	 * @param {Object} obj
	//	 * @param {Object} fieldModels
	//	 */
	//	owner.ModifyObjectByFieldValue = function(obj, fieldModels) {
	//		var models = CommonUtil.toObject(fieldModels);
	//		if (mui.isArray(models)) {
	//			mui.each(models, function(index, element) {
	//				var fName = element.FName;
	//				obj[fName] = element.FValue;
	//			});
	//		}
	//
	//		return obj;
	//	};

	/**
	 * 通过元素的name属性，获取元素值并存储在json对象中，其中names可以多选，须用 “,” 隔开 
	 * @param {Object} formSelector
	 * @param {Object} names
	 */
	owner.GetObjectByKeys = function(formSelector, names) {
		var nameList = [];
		var resultObj = {};
		var form = document.querySelector(formSelector);
		if(!form) {
			return null;
		}
		mui.each(names.split(','), function(index, item) {
			var name = item.trim();
			var value = '';
			var element = form.querySelector('[name="' + name + '"]');
			if(element) {
				value = owner.GetTagValue(element);
			}
			resultObj[name] = value;
		});

		return resultObj;
	};

	owner.GetTagValue = function(element) {
		if(!element) {
			return null;
		}
		if(element.classList.contains('mui-input')) {
			return element.value;
		} else if(element.nodeName.toLowerCase() == 'div') {
			return element.innerHTML;
		} else if(element.nodeName.toLowerCase() == 'span') {
			return element.innerHTML;
		} else if(element.nodeName.toLowerCase() == 'button') {
			return element.innerHTML;
		}
	};

	// 监听input控件的input事件（当用户输入时，退格删除同样触发该事件）
	mui('body').on('input', 'input', (function() {
		// 当前处于编辑状态的input控件
		var editingInput = null;
		// 动态为FormUtil添加endEdit事件
		// 放在闭包里的原因是为了同input事件共享editingInput变量，而该变量不可在闭包外部修改
		owner.endEdit = function() {
			if(editingInput) {
				mui.trigger(editingInput, 'change');
			}
		};
		// 返回函数，用于input事件的绑定
		return function(event) {
			editingInput = event.target;
		};
	}()));

}(mui, window.FormUtil = {}));

/**
 * 操作[{"FName":"FProductID", "FValue":""}, {"FName":"FStockID", "FValue":"9"}]类型的数组相关方法
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	owner.GetFieldValue = function(fieldModels, fieldName) {
		var matchValue = null;
		var models = CommonUtil.toObject(fieldModels);
		if(mui.isArray(models)) {
			mui.each(models, function(index, element) {
				if(element.FName == fieldName) {
					matchValue = element.FValue;
				}
			});
		}

		return matchValue;
	};

	owner.SetFieldValue = function(fieldModels, fieldName, newValue) {
		var models = CommonUtil.toObject(fieldModels);
		if(mui.isArray(models)) {
			mui.each(models, function(index, element) {
				if(element.FName == fieldName) {
					element.FValue = newValue;
				}
			});
		}

		return JSON.stringify(models);
	};
}(mui, window.ArrayUtil = {}));

/**
 * Native.js调用
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	//***** 强制打开软键盘  Begin******
	var _softKeyboardwebView, _imm, _InputMethodManager, _isKeyboardInited = false;
	/**
	 * 初始化软键盘
	 */
	owner.initSoftKeyboard = function() {
		if(mui.os.ios) {
			_softKeyboardwebView = plus.webview.currentWebview().nativeInstanceObject();
		} else {
			_softKeyboardwebView = plus.android.currentWebview();
			plus.android.importClass(_softKeyboardwebView);
			_softKeyboardwebView.requestFocus();
			var Context = plus.android.importClass("android.content.Context");
			_InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			var main = plus.android.runtimeMainActivity();
			_imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
		}
		_isKeyboardInited = true;
	};

	/**
	 * 打开软键盘
	 */
	owner.openSoftKeyboard = function() {
		if(!_isKeyboardInited) {
			owner.initSoftKeyboard();
		}
		if(mui.os.ios) {
			_softKeyboardwebView.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
		} else {
			_imm.toggleSoftInput(0, _InputMethodManager.SHOW_FORCED);
		}
	};

	/**
	 * 控件获得焦点并弹出软键盘
	 */
	owner.focusAndOpenKeyboard = function(input) {
		setTimeout(function() {
			if((input.classList.contains('mui-input') || input.tagName.toLowerCase() == 'input') && input.style.display != 'none') {
				input.focus();
				owner.openSoftKeyboard();
			}
		}, 200);
	};

	//***** 强制打开软键盘  End******

	//***** 扫描二维码  Begin******

	/**
	 * 开始扫描
	 * @param {Object} notClose 是否连续扫描
	 * @param {Object} notClose 是否连续扫描
	 * @param {Object} filePath 扫描后文件保存路径
	 */
	owner.Scan = function(callback, notClose, isQRCode, filePath) {
		var timestamp = Date.parse(new Date());
		// 回调时间名称，添加随机时间戳，避免事件重复。
		var endScanEventName = 'endScan' + timestamp;
		if(callback) {
			var scanFunction = function(event) {
				var result = event.detail.result;
				var file = event.detail.file;
				callback(result, file);
				if(!notClose) {
					document.removeEventListener(endScanEventName, scanFunction);
				}
			};
			document.addEventListener(endScanEventName, scanFunction);
		}
		var viewConfig = WebviewManager.getViewConfig('ScanView');

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
			extras: {
				notClose: notClose,
				filePath: filePath,
				filterType: isQRCode ? 'QR' : '',
				endScanEventName: endScanEventName
			}
		};
		options.show = {
			event: 'loaded'
		}
		//有原生标题的情况下，就不需要waiting框了
		options.waiting = {
			autoShow: false
		}
		//打开新窗口
		return mui.openWindow(viewConfig.url, viewConfig.id, options);
	};

	owner.continueScan = function(scanPage) {
		mui.fire(scanPage, 'continue');
	}

	//***** 扫描二维码  End******
}(mui, window.NativeUtil = {}));

(function($, owner) {
	owner.formatAsStr = function(value, format) {
		value = owner.parseDateFromJson(value, true);
		if(value == '')
			return '';
		else if(value.split(' ').length < 2)
			value = value + ' 00:00:00';

		var sp = '-';
		if(format.indexOf('/') > 0)
			sp = '/';
		if(format == 'y' + sp + 'm' + sp + 'd')
			return(value.split(' ')[0]).replace(/-/g, sp);
		else if(format == 'y' + sp + 'm')
			return value.split(' ')[0].split('-')[0] + sp + value.split(' ')[0].split('-')[1];
		else if(format == 'm' + sp + 'd')
			return value.split(' ')[0].split('-')[1] + sp + value.split(' ')[0].split('-')[2];
		else if(format == 'h:m:s')
			return value.split(' ')[1];
		else if(format == 'h:m')
			return value.split(' ')[1].split(':')[0] + ":" + value.split(' ')[1].split(':')[1];
		else if(format == 'm:s')
			return value.split(' ')[1].split(':')[1] + ":" + value.split(' ')[1].split(':')[2];
		else if(format == 'y/m/d h:m:s')
			return value.replace(/-/g, sp);
		else
			return value;
	};

	owner.formatAsObject = function(value) {
		if(typeof(value) == 'object') {
			return value;
		} else {
			return new Date(Date.parse(owner.formatAsStr(value, 'y/m/d h:m:s')));
		}
	};

	owner.parseDateFromJson = function(date, bTime) {
		if(date == "")
			return "";
		else if(!date)
			return "";
		var re = /\d+/gi;
		var re1 = /Date\(\d+\)/gi;
		if(re1.test(date)) {
			var d = new Date(parseInt(re.exec(date)));
			var s = "";
			if(bTime) {
				s = d.format('yyyy-MM-dd HH:mm:ss');
			} else {
				s = d.format('yyyy-MM-dd');
			}
			return s;
		} else {
			if(typeof(date) == 'object') {
				var s = "";
				s = date.format('yyyy-MM-dd HH:mm:ss');
				return s;
			} else {
				return date;
			}
		}
	};

	owner.DateMinus = function(d1, d2) {
		d1 = owner.formatAsObject(d1);
		d2 = owner.formatAsObject(d2);
		return d1 - d2;
	};
}(mui, window.DateUtil = {}));

(function($, owner) {
	owner.Format = function(num, decimal, group) {
		//group = group == undefined ? ',' : group;
		decimal = decimal > 0 && decimal <= 20 ? decimal : 0;
		num = parseFloat((num + "").replace(/[^\d\.-]/g, "")).toFixed(decimal) + "";
		if(num.split('.').length > 0) {
			return num;
		}
		var mIsNg = num < 0;
		var l = (mIsNg ? num * -1 + '' : num).split(".")[0].split("").reverse(),
			r = num.split(".")[1];
		t = "";
		for(i = 0; i < l.length; i++) {
			t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
		}
		if(mIsNg) t = t + '-';
		return t.split("").reverse().join("") + "." + r;
	};

	owner.FormatMoney = function(num, decimal, group) {
		group = group == undefined ? ',' : group;
		decimal = decimal > 0 && decimal <= 20 ? decimal : 2;
		num = parseFloat((num + "").replace(/[^\d\.-]/g, "")).toFixed(decimal) + "";
		if(num.split('.').length < 2) {
			return num;
		}
		var mIsNg = num < 0;
		var l = (mIsNg ? num * -1 + '' : num).split(".")[0].split("").reverse(),
			r = num.split(".")[1];
		t = "";
		for(i = 0; i < l.length; i++) {
			t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
		}
		if(mIsNg) t = t + '-';
		return t.split("").reverse().join("") + "." + r;
	};

	owner.Round = function(num, decimal) {
		var v = '1';
		for(var i = 0; i < decimal; i++) {
			v += '0';
		}
		v = v * 1;
		return Math.round(num * v) / v;
	};

	owner.ToPrice = function(num) {
		//		var decimal = Business.PricePrecision >= 0 ? Business.PricePrecision : 4;
		var decimal = 4;
		return NumberUtil.Round(num, decimal);
	};
	owner.ToQty = function(num) {
		//		var decimal = Business.QtyPrecision >= 0 ? Business.QtyPrecision : 4;
		var decimal = 4;
		return NumberUtil.Round(num, decimal);
	};
	owner.ToAmount = function(num) {
		//		var decimal = Business.AmountPrecision >= 0 ? Business.AmountPrecision : 2;
		var decimal = 2;
		return NumberUtil.Round(num, decimal);
	};

	owner.GetNumberValue = function(s) {
		return parseFloat(s.replace(/[^\d\.-]/g, ""));
	};
	owner.IsDecimal = function(num) {
		var r = /^[+-]?[1-9]?[0-9]*\.{0,1}0*$/;
		return !r.test(num);
	};
	owner.IsInteger = function(num) {
		var r = /^[+-]?[1-9]?[0-9]*\.{0,1}0*$/;
		return r.test(num);
	};

}(mui, window.NumberUtil = {}));

/**
 * 快速菜单操作 
 * @param {Object} $
 * @param {Object} owner
 */
(function($, owner) {
	/**
	 * 快速签收 
	 */
	owner.quickSign = function() {
		var scanPage;
		var scanFunction = function(result, file) {
			var ajaxData = {
				FBarcode: result,
				FType: 1 //1:签收
			};
			var ajaxCallback = function(data) {
				if(data.FIsSuccess) {
					var manuf = data.FObject;
					wgyun.confirmYesNo('  规格：【' + manuf.FModel + '】\r\n  型号：【' + manuf.FParentModel + '】\r\n  数量：【' + manuf.FPassQty + '】\r\n  将由工序<' + manuf.FDeptFullName + '>签收\r\n确定签收？', function() {
						// 签收
						var ajaxData_sign = {
							FInterID: manuf.FInterID
						};
						var ajaxCallback_sign = function(data) {
							mui.toast(data.FMsg);
							//							NativeUtil.continueScan(scanPage);
						};
						CommonUtil.ajax('/Prod/Manuf.asmx/Sign', ajaxData_sign, ajaxCallback_sign);
					});
				} else {
					mui.toast(data.FMsg);
					//					NativeUtil.continueScan(scanPage);
				}
			};
			CommonUtil.ajax('/Prod/Manuf.asmx/Scan', ajaxData, ajaxCallback);
		};
		scanPage = NativeUtil.Scan(scanFunction, true);
	};

	/**
	 * 快速转序
	 */
	owner.quickTransfer = function() {
		var scanFunction = function(result, file) {
			var ajaxData = {
				FBarcode: result,
				FType: 2 //2:转序
			};
			var ajaxCallback = function(data) {
				if(data.FIsSuccess) {
					var manuf = data.FObject;
					// 转序
					owner._openTransferPage({
						FInterID: manuf.FInterID
					});
				} else {
					mui.toast(data.FMsg);
				}
			};
			CommonUtil.ajax('/Prod/Manuf.asmx/Scan', ajaxData, ajaxCallback);
		};
		NativeUtil.Scan(scanFunction);
	};

	owner._openTransferPage = function(moreData) {
		var data = {
			//			Mode: GridColumnsMode.Edit
		};
		data = wgyun.JsonExtend(data, moreData);
		//		mAddPage = WebviewManager.openPageById('Manuf_View', data);
		mAddPage = WebviewManager.openPageById('Manuf_QuickTransfer', data);
	};

	/**
	 * 快速生产 
	 */
	owner.quickProd = function() {
		var scanFunction = function(result, file) {
			var ajaxData = {
				FBarcode: result
			};
			var ajaxCallback = function(data) {
				if(data.FIsSuccess) {
					mui.toast('操作成功,流程单开始生产!');
				} else {
					mui.toast(data.FMsg);
				}
			};
			CommonUtil.ajax('/Prod/Flow.asmx/ScanProduce', ajaxData, ajaxCallback);
		};
		NativeUtil.Scan(scanFunction, true);
	};

	/*
	 * 分配
	 */
	owner.quickDistribute = function() {
		var data = {};
		var distributePage = WebviewManager.openPageById('Manuf_Distribute', data);
	};

	/*
	 * 出库单校验
	 */
	owner.quickConfirmErpOut = function() {
		var data = {};
		var page = WebviewManager.openPageById('Erp_ConfirmErpOut', data);
	};
}(mui, window.QuickOperation = {}));

(function($, owner) {
	owner.View = 0x0;
	owner.Add = 0x1;
	owner.Edit = 0x2;
}(mui, window.GridColumnsMode = {}));

if(CommonUtil.IsDebugMode) {
	(function($, owner) {
		owner._TimeLoger = new TimeLoger();

		/**
		 * 性能调试工具，计算输出时间
		 */
		function TimeLoger() {
			var _this = this;
			var beginTime, endTime;

			this.BeginLog = function() {
				// 记录执行的起始时间
				beginTime = (new Date()).getTime();
			}

			this.LogTime = function(name) {
				// 记录执行的结束时间
				endTime = (new Date()).getTime();
				// 输出耗时
				console.log((name ? name : '耗时') + '：' + (endTime - beginTime) + '毫秒');
			};

			this.AlertTime = function(name) {
				// 记录执行的结束时间
				endTime = (new Date()).getTime();
				// 输出耗时
				alert((name ? name : '耗时') + '：' + (endTime - beginTime) + '毫秒');
			};

			this.ToastTime = function(name) {
				// 记录执行的结束时间
				endTime = (new Date()).getTime();
				// 输出耗时
				mui.toast((name ? name : '耗时') + '：' + (endTime - beginTime) + '毫秒')
			}
		};

	}(mui, window.TestUtil = {}));
};