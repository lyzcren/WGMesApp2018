/*
 * JS对象方法扩展
 */
Array.prototype.insertAt = function(index, obj) {
	this.splice(index, 0, obj);
};
Array.prototype.removeAt = function(index) {
	this.splice(index, 1);
};
Array.prototype.remove = function(obj) {
	var index = this.indexOf(obj);
	if(index >= 0) {
		this.removeAt(index);
	}
};
Array.prototype.removeByKey = function(key, value) {
	var items = this.selectItemsByKey(key, value);
	var hasRemoved = false;
	for(var i = 0; i < items.length; i++) {
		this.remove(items[i]);
		hasRemoved = true;
	}

	return hasRemoved;
};
Array.prototype.swapByField = function(field, fromField, toField) {
	var cc = this;
	var fromtemp;
	var totemp;
	var fromindex = 0;
	var toindex = 0;
	for(var i = 0; i < cc.length; i++) {
		if(cc[i][field] == fromField) {
			fromindex = i;
			fromtemp = cc[i];
		}
		if(cc[i][field] == toField) {
			toindex = i;
			totemp = cc[i];
		}
	}
	cc.splice(fromindex, 1, totemp);
	cc.splice(toindex, 1, fromtemp);
};

Array.prototype.selectItemsByKey = function(key, value) {
	var cc = this;
	var selectedItems = [];
	for(var i = 0; i < cc.length; i++) {
		if(cc[i][key] == value) {
			selectedItems.push(cc[i]);
		}
	}
	return selectedItems;
};

Array.prototype.selectFirstItemsByKey = function(key, value) {
	var cc = this;
	var selectedItem = null;
	for(var i = 0; i < cc.length; i++) {
		if(cc[i][key] == value) {
			selectedItem = cc[i];
			break;
		}
	}
	return selectedItem;
};

Array.prototype.modifyItemByKey = function(key, value, modifyData) {
	var cc = this;
	for(var i = 0; i < cc.length; i++) {
		if(cc[i][key] == value) {
			cc[i] = modifyData;
		}
	}

	return cc;
};

String.prototype.format = function() {
	var args = arguments;
	var replaceArray = [];
	mui.each(args, function(index, element) {
		// 兼容数组
		if(mui.isArray(element)) {
			for(var i = 0; i < element.length; i++) {
				replaceArray.push(element[i]);
			}
		} else {
			replaceArray.push(element);
		}
	});
	return this.replace(/\{(\d+)\}/g,
		function(m, i) {
			return replaceArray[i];
		});
};

Date.prototype.addDays = function(days) {
	return new Date(this.getTime() + (1000 * 60 * 60 * 24) * days);
};
//日期时间格式化
Date.prototype.format = function(format) {
	/*
	 * eg:format="yyyy-MM-dd hh:mm:ss";
	 */
	if(this == 'Invalid Date') {
		return null;
	}
	if(!format) {
		format = "yyyy-MM-dd hh:mm:ss";
	}
	var o = {
		"y+": this.getYear(), // month
		"M+": this.getMonth() + 1, // month
		"d+": this.getDate(), // day
		"h+": this.getHours(), // hour
		"m+": this.getMinutes(), // minute
		"s+": this.getSeconds(), // second
		"q+": Math.floor((this.getMonth() + 3) / 3), // quarter
		"S": this.getMilliseconds() // millisecond
	};
	if(/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for(var k in o) {
		if(new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};

Function.prototype.getName = function() {
	return this.name || this.toString().match(/function\s*([^(]*)\(/)[1]
};

/**
 * 浏览器兼容，部分浏览器不支持startsWith方法 
 */
if(typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(prefix) {
		return this.slice(0, prefix.length) === prefix;
	};
}
/**
 * 浏览器兼容，部分浏览器不支持endsWith方法 
 */
if(typeof String.prototype.endsWith != 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}