/**
 * 登录
 **/
(function($, owner) {
	owner.UserNumberBox = null;
	owner.UserPasswordBox = null;
	owner.ServerDBNameBox = null;
	owner.RememberSwitch = null;
	owner.HistoryList = null;
	owner.Settings = null;
	owner.IsAutoLogin = false;
	/**
	 * 初始化
	 **/
	owner.init = function() {
		owner.Settings = app.getSettings();
		owner.UserNumberBox = document.getElementById('account');
		owner.UserPasswordBox = document.getElementById('password');
		owner.ServerDBNameBox = document.getElementById('serverDB');
		owner.HistoryList = document.getElementById('historyUserNumber');

		if(owner.Settings.FNumber)
			owner.UserNumberBox.value = owner.Settings.FNumber;
		if(owner.Settings.ServerDBName)
			owner.ServerDBNameBox.innerText = owner.Settings.ServerDBName;
		if(owner.Settings.FPassword) {
			owner.UserPasswordBox.value = owner.Settings.FPassword;
			if(!CommonUtil.isSwitchOn("autoLogin")) {
				mui("#autoLogin").switch().toggle();
				owner.IsAutoLogin = true;
			}
		}

		if(CommonUtil.isSwitchOn("autoLogin")) {
			setTimeout(function() {
				Login.doLogin('自动登录中...');
			}, 500);
		}

		owner.UserNumberBox.addEventListener('tap', function(event) {
			if(owner.HistoryList.childNodes.length > 1)
				owner.HistoryList.style.display = 'block';
			else
				owner.HistoryList.style.display = 'none';
		}, false);

		owner.refreshNameList();

		// 如果不是点击用户名框时，隐藏历史用户名列表
		document.addEventListener('tap', function(event) {
			if(!event.target.id) {
				owner.HistoryList.style.display = 'none';
			}
		});
	};

	/**
	 * 添加历史用户名到列表
	 **/
	owner.addNameToList = function(name, insertAt) {
		var li = document.createElement('li');
		li.className = 'mui-table-view-cell his_item';
		li.innerHTML = name;
		li.style.listStyle = 'none';
		li.addEventListener('tap', function(event) {
			owner.onHistoryNameItemClick(event.target.innerHTML);
		});
		var iLen = owner.HistoryList.childNodes.length;
		try {
			if(iLen > 0 && insertAt != null) {
				owner.HistoryList.insertBefore(li, owner.HistoryList.childNodes[insertAt < iLen ? insertAt : 0]);
			} else {
				owner.HistoryList.insertBefore(li);
			}
		} catch(e) {
			//TODO handle the exception
		}
	};

	/**
	 * 刷新历史用户名列表
	 **/
	owner.refreshNameList = function() {
		var his = CommonUtil.getLocalValue('HistoryName', []);
		if(his && his.length > 0) {
			owner.HistoryList.innerHTML = '';
			$.each(his, function(index, element) {
				Login.addNameToList(element);
			});
		}
	};

	/**
	 * 保存历史登录用户名
	 **/
	owner.addLoginName = function(name) {
		var iMaxHistoryLoginName = 5;
		var his = CommonUtil.getLocalValue('HistoryName', []);
		if(his.indexOf(name) < 0) his.insertAt(0, name);
		if(his.length > iMaxHistoryLoginName) {
			var len = his.length;
			for(var index = len - 1; index >= iMaxHistoryLoginName; index--) {
				his.removeAt(index);
			}
		}
		CommonUtil.setLocalValue('HistoryName', his);
	};

	/**
	 * 清除历史登录用户名
	 **/
	owner.clearLoginName = function() {
		CommonUtil.setLocalValue('HistoryName', []);
	};

	/**
	 * 清除历史登录用户名
	 **/
	owner.clearLoginName = function() {
		CommonUtil.setLocalValue('HistoryName', []);
	};

	/**
	 * 添加历史用户名到列表
	 **/
	owner.onHistoryNameItemClick = function(text) {
		owner.UserNumberBox.value = text;
	};

	/**
	 * 登录成功跳转
	 **/
	owner.success = function() {
		owner.Settings.FNumber = owner.UserNumberBox.value;
		var isActive = CommonUtil.isSwitchOn("autoLogin");
		if(isActive) {
			owner.Settings.FPassword = owner.UserPasswordBox.value;
			owner.Settings.ServerDBName = owner.ServerDBNameBox.innerText;
		} else {
			owner.Settings.FPassword = '';
		}
		app.setSettings(owner.Settings);
		owner.UserPasswordBox.value = '';
		mui.toast('登录成功!');
		wgyun.openPage({
			url: '/view/home/index.html',
			id: 'home_index',
			show: {
				aniShow: 'pop-in'
			},
			styles: {
				popGesture: 'hide' // iOS平台原生支持从屏幕边缘右滑关闭
			}
		});
	};

	/**
	 * 登录
	 **/
	owner.doLogin = function(loadingText) {
		wgyun.showWaiting();
		mui.ajax(CommonUtil.HostUrl + '/Account/Account.asmx/Login', {
			data: JSON.stringify({
				accessKey: 'wgyun.com.cn', // 登录调用接口的默认验证码是wgyun.com.cn
				appID: CommonUtil.AppID, // 当前设备的ID
				fNumber: owner.UserNumberBox.value,
				fPassword: owner.UserPasswordBox.value,
				ServerDB: owner.ServerDBNameBox.innerText
			}),
			contentType: 'application/json; charset=utf-8', // 提交的参数是JSON格式时,要设置contentType
			dataType: 'json', //服务器返回json格式数据
			type: 'POST', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data, b, c) {
				wgyun.closeWaiting();
				data = CommonUtil.toObject(data.d);
				if(data.FIsSuccess) {
					owner.Settings.FNumber = owner.UserNumberBox.value;
					var isActive = CommonUtil.isSwitchOn("autoLogin");
					if(isActive || owner.IsAutoLogin) {
						owner.Settings.FPassword = owner.UserPasswordBox.value;
						owner.Settings.ServerDBName = owner.ServerDBNameBox.innerText;
					} else {
						owner.Settings.FPassword = '';
					}
					owner.IsAutoLogin = false;
					app.setSettings(owner.Settings);
					owner.UserPasswordBox.value = '';
					CommonUtil.setUserInfo(data.FObject);
					// mui.toast('登录成功!');

					//打开窗口的相关参数
					var options = {
						styles: {
							popGesture: "close"
						},
						extras: {
							User: data.FObject,
							ServerDBName: owner.ServerDBNameBox.innerText
						}
					};
					mui.openWindow('/view/home/index.html', 'home_index', options);
				} else {
					mui.toast(data.FMsg);
				}
			},
			error: function(xhr, type, errorThrown) {
				mui.alert('Error: ' + xhr.responseText, '望果MES');
				wgyun.closeWaiting();
			}
		});
	};

	owner.demoLogin = function() {
		wgyun.showWaiting();
		mui.ajax(CommonUtil.HostUrl + '/Account/Account.asmx/DemoLogin', {
			data: JSON.stringify({
				accessKey: 'wgyun.com.cn', // 登录调用接口的默认验证码是wgyun.com.cn
			}),
			contentType: 'application/json; charset=utf-8', // 提交的参数是JSON格式时,要设置contentType
			dataType: 'json', //服务器返回json格式数据
			type: 'POST', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data, b, c) {
				data = CommonUtil.toObject(data.d);
				if(data.FIsSuccess) {
					CommonUtil.setUserInfo(data.FObject);
					// mui.toast('登录成功!');
					wgyun.openPage({
						url: '/view/home/index.html',
						id: 'home_index',
						extras: {
							User: data.FObject,
							ServerDBName: owner.ServerDBNameBox.innerText
						}
					});
					wgyun.closeWaiting();
				} else {
					mui.toast(data.FMsg);
				}
			},
			error: function(xhr, type, errorThrown) {
				mui.alert('Error: ' + xhr.responseText, '望果MES');
				wgyun.closeWaiting();
			}
		});
	};

	var tPicker = null;

	owner.pickHandler = function(event) {
		//普通示例
		var DBPicker = new $.PopPicker();
		owner.setPickData(DBPicker);

		DBPicker.show(function(items) {
			var maxIndex = items.length - 1;
			event.target.innerHTML = items[maxIndex].text;
			owner.ServerDBNameBox.innerText = items[maxIndex].text;
		}, false);
	}

	owner.setPickData = function(picker) {
		mui.ajax(CommonUtil.HostUrl + '/Account/Account.asmx/GetMesDBList', {
			data: JSON.stringify({
				accessKey: 'wgyun.com.cn' // 登录调用接口的默认验证码是wgyun.com.cn
			}),
			contentType: 'application/json; charset=utf-8', // 提交的参数是JSON格式时,要设置contentType
			dataType: 'json', //服务器返回json格式数据
			type: 'POST', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data, b, c) {
				wgyun.closeWaiting();
				data = CommonUtil.toObject(data.d);
				if(data.FIsSuccess) {
					picker.setData(data.FObject);
				} else {
					mui.toast(data.FMsg);
				}
			},
			error: function(xhr, type, errorThrown) {
				mui.alert('Error: ' + xhr.responseText, '望果MES');
				wgyun.closeWaiting();
			}
		});
	};

}(mui, window.Login = {}));