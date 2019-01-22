(function($, owner) {
	var mPrintLastName = 'PrintLast';

	owner.OpenPrintWindow = function(module, bill, fInterID, printUrl, defaultTemplate) {
		var printPage = wgyun.openPage({
			url: '/view/CommonHelper/Print4Andoid.html',
			id: 'print_Detail',
			extras: {
				module: module,
				bill: bill,
				defaultTemplate: defaultTemplate,
				fInterID: fInterID,
				printUrl: printUrl
			},
			show: {
				autoShow: true
			},
			createNew: true //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
		wgyun.showPage(printPage);
		//		mui.openWindow({
		//			url: '/view/CommonHelper/Print4Andoid.html',
		//			id: 'print_Detail',
		//			extras: {
		//				module: module,
		//				bill: bill,
		//				defaultTemplate: defaultTemplate,
		//				fInterID: fInterID,
		//				printUrl: printUrl
		//			},
		//			createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		//			show: {
		//				autoShow: true, //页面loaded事件发生后自动显示，默认为true
		//				aniShow: 'slide-in-right', //页面显示动画，默认为”slide-in-right“；
		//				duration: 150 //页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒；
		//			},
		//			waiting: {
		//				autoShow: true,
		//				title: '正在加载...'
		//			}
		//		});
	};

	owner.OpenPrintLastWindow = function(module, bill, fInterID, printUrl) {
		var defaultTemplate = owner.getLastTemplate(module, bill);
		mui.openWindow({
			url: '/view/CommonHelper/Print4Andoid.html',
			id: 'print_Detail',
			extras: {
				module: module,
				bill: bill,
				defaultTemplate: defaultTemplate,
				fInterID: fInterID,
				printUrl: printUrl
			},
			createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			show: {
				autoShow: true, //页面loaded事件发生后自动显示，默认为true
				aniShow: 'slide-in-right', //页面显示动画，默认为”slide-in-right“；
				duration: 150 //页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒；
			},
			waiting: {
				autoShow: true,
				title: '正在加载...'
			}
		});
	};

	owner.getLastTemplate = function(module, bill) {
		var defaultTemplateName = module + '_' + bill + '_Print';
		var printLast = CommonUtil.getLocalValueBykey(mPrintLastName, defaultTemplateName, '');
		return printLast;
	};

	owner.setLastTemplate = function(module, bill, name) {
		var defaultTemplateName = module + '_' + bill + '_Print';
		CommonUtil.setLocalValueBykey(mPrintLastName, defaultTemplateName, name);
	};

	owner.GetPrintTemplate = function(module, bill, callback) {
		mui.ajax(CommonUtil.HostUrl + '/PrintTemplate/PrintTemplate.asmx/GetList', {
			data: JSON.stringify({
				securityHeader: JSON.stringify(CommonUtil.getAppSecurityHeader()),
				module: module,
				bill: bill
			}),
			contentType: 'application/json; charset=utf-8', // 提交的参数是JSON格式时,要设置contentType
			dataType: 'json', //服务器返回json格式数据
			type: 'POST', //HTTP请求类型
			timeout: CommonUtil.ReportTimeout, //超时时间设置为25秒；
			success: function(data, b, c) {
				data = CommonUtil.toObject(data.d);
				if(data.FIsSuccess) {
					var templateList = CommonUtil.toObject(data.FObject);
					callback(templateList);
				} else {
					mui.toast(data.FMsg);
				}
			},
			error: function(xhr, type, errorThrown) {
				mui.alert((xhr.responseText ? ('服务异常: ' + xhr.responseText) : '服务异常'), '望果MES');
				wgyun.closeWaiting();
			}
		});
	}
}(mui, window.PrintTemplateUtil = {}))