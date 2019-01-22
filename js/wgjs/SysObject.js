(function($, owner) {

	//	owner.getGridColumns = function(fNumber, callBack, savedColumnKey) {
	//		var funCallback = function(result) {
	//			var ucc = [];
	//			for(var index = 0; index < result.FObject.length; index++) {
	//				var col = result.FObject[index];
	//				// 对象必须与网页版保存到服务的数据结构一致
	//				ucc.push({
	//					"field": col.FField,
	//					"title": col.FTitle,
	//					"hidden": col.FIsHidden,
	//					"isShow": col.FIsShow,
	//					"width": col.FWidth
	//				});
	//			}
	//			callBack(result);
	//			CommonUtil.setUserConfigColumns(savedColumnKey, ucc);
	//		};
	//		CommonUtil.ajax(CommonUtil.HostUrl + '/Sys/SysObject.asmx/GetUserConfigList', {
	//			fNumber: fNumber,
	//			savedColumnKey: savedColumnKey ? savedColumnKey : ''
	//		}, funCallback);
	//	};

	/**
	 * 初始化显示列 
	 * @param {Object} viewName 数据库视图名称，用于加载自定义字段（可选）
	 * @param {Object} savedColumnKey 保存在服务器上的列配置名称（可选）
	 * @param {Object} configColumns 本地配置列（必填）
	 * @param {Object} callBack 回调函数（可选）
	 */
	owner.initColumns = function(savedColumnKey, configColumns, callBack) {
		// 获取配置列
		SysObject.getGroupColumns(savedColumnKey, configColumns, callBack);
	};

	owner.getGroupColumns = function(savedColumnKey, configColumns, callBack) {
		if(savedColumnKey) {
			CommonUtil.ajax(CommonUtil.HostUrl + '/Sys/SysObject.asmx/GetAppUserConfigList', {
				savedColumnKey: savedColumnKey ? savedColumnKey : ''
			}, function(result) {
				owner.RecalcGroupColumnsWithConfig(savedColumnKey, configColumns, result.FObject, callBack);
			});
		} else {
			owner.RecalcGroupColumnsWithConfig(savedColumnKey, configColumns, null, callBack);
		}
	};

	owner.RecalcGroupColumnsWithConfig = function(savedColumnKey, dataConfig, dataSave, callback) {
		var ucc = owner.RecalcGroupColumns(dataConfig, dataSave);
		if(savedColumnKey) {
			CommonUtil.setUserConfigColumns(savedColumnKey, ucc);
		}
		if(callback) {
			callback(ucc);
		}

		return ucc;
	};

	owner.RecalcGroupColumns = function(dataConfig, dataSave) {
		var dataResult = [];
		if(!dataSave) { // 1、服务器无配置
			// 使用当前配置
			dataResult = dataConfig;
		} else { // 2、服务器有配置
			var columnsConfigSplit = GridColumnsUtil.SplitGroupAndColumns(dataConfig, 'FType');
			var fieldsConfig = columnsConfigSplit.columns;
			var groupsConfig = columnsConfigSplit.groups;
			var detailsConfig = columnsConfigSplit.details;
			var columnSaveSplits = GridColumnsUtil.SplitGroupAndColumns(dataSave, 'type');
			var fieldsSave = columnSaveSplits.columns;
			var groupsSave = columnSaveSplits.groups;
			var detailsSave = columnSaveSplits.details;
			var fieldsResult = [];
			var groupsResult = [];
			var detailsResult = [];
			// 分组信息全部保留在服务器中，使用服务器分组替换本地分组
			for(var i = 0; i < groupsSave.length; i++) {
				var col = groupsSave[i];
				groupsResult.push({
					FField: col.field,
					FTitle: col.title,
					FOrder: col.order,
					FType: col.type,
					FIsAccordion: col.isAccordion,
					FIsManage: col.FIsManage
				});
			}
			// TODO:须考虑修改配置时（如本地增加字段及分组），应读取本地分组信息
			//			for (var i = 0; i < groupsConfig.length; i++) {
			//				var col = groupsConfig[i];
			//				if (groupsResult.selectItemsByKey('FField', col.FField).length <= 0) {
			//					groupsResult.push({
			//						FField: col.FField,
			//						FTitle: col.FTitle,
			//						FOrder: col.FOrder,
			//						FType: col.FType,
			//						FIsAccordion: col.FIsAccordion
			//					});
			//				}
			//			}
			//CommonUtil.print(groupsResult);
			// 字段信息修改FGroupOrder及FOrder、FIsShow
			for(var i = 0; i < fieldsConfig.length; i++) {
				var col = fieldsConfig[i];
				var field = fieldsSave.selectItemsByKey('field', col.FField)[0];
				var item = {
					FField: col.FField,
					FTitle: col.FTitle,
					FFormatter: col.FFormatter,
					FGroupOrder: (field && field.groupOrder) ? field.groupOrder : col.FGroupOrder,
					FOrder: (field && field.order) ? field.order : col.FOrder,
					FType: col.FType,
					FHiddenInDetail: col.FHiddenInDetail,
					FHiddenInAdd: col.FHiddenInAdd,
					FHiddenInEdit: col.FHiddenInEdit,
					FIsAddable: col.FIsAddable,
					FIsEditable: col.FIsEditable,
					FIsAddPost: col.FIsAddPost,
					FIsEditPost: col.FIsEditPost,
					FSourceBinding: col.FSourceBinding,
					FValueField: col.FValueField,
					FWhereCondition: col.FWhereCondition,
					FWhereValue: col.FWhereValue,
					FRequired: col.FRequired,
					FMissingMessage: col.FMissingMessage,
					FValidateType: col.FValidateType,
					FIsShow: ((field != undefined && field.isShow != undefined) ? field.isShow : true)
				};
				fieldsResult.push(item);
			}
			// 详情信息、合计信息与分组类似，但详情分组不可删除新增
			for(var i = 0; i < detailsConfig.length; i++) {
				var col = detailsConfig[i];
				var field = detailsSave.selectItemsByKey('field', col.FField)[0];
				detailsResult.push({
					FField: col.FField,
					FTitle: (field && field.title) ? field.title : col.FTitle, //详情可修改名称
					FOrder: (field && field.order) ? field.order : col.FOrder,
					FType: col.FType,
					FIsAccordion: col.FIsAccordion,
					FIsManage: col.FIsManage
				});
			}
			//CommonUtil.print(detailsResult);
			// 将groups、details、fields合并
			dataResult = groupsResult.concat(detailsResult).concat(fieldsResult);
		}

		return dataResult;
	};

	owner.GetCurrentBillNo = function(fNumber, callback, failure) {
		var ajaxCallback = function(result) {
			if(result.FIsSuccess) {
				if(callback)
					callback(result.FCurrentNo);
			} else {
				if(failure)
					failure(result.FMsg);
			}
		};
		CommonUtil.ajax(CommonUtil.HostUrl + '/Sys/BillNoRule.asmx/GetCurrentBillNo', {
			fNumber: fNumber
		}, ajaxCallback);
	};
}(mui, window.SysObject = {}));