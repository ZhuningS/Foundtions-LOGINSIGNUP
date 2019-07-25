define(function(require) {
	var $ = require("jquery");
	var Util = require("./util");

	//增加url中如果包含'http://'和'https://'不再增加baseUrl
	var getUrl = function(baseUrl, url, action){
		if(0===url.indexOf('http://')||0===url.indexOf('https://')) baseUrl = ''; 
		return baseUrl + url +"/"+action;
	};
	
	var baas = {
		BASE_URL : "/baas",

/**
 		options = {
 			"async" : 是否异步请求，默认false
 			"url" : 服务端请求地址，不包含BASE_URL
 			"action" : 动作标识
 			"params" : 动作对应的参数
 			"success" : 请求成功后的回调，参数(resultData, xhr)
 			"error" : 请求失败后的回调，参数(msg, xhr)
 		}
 */
		sendRequest : function(options) {
			var self = this;
			return $.ajax({
				"type" : "post",
				"async" : options.async ? options.async : false,
				"dataType" : "json",
				"contentType" : "application/json",
				"url" : getUrl(options.baseUrl||this.BASE_URL,options.url,options.action),
				"data" : JSON.stringify(options.params),
				"complete" : function(xhr) {
					if (xhr.readyState == 4 && xhr.status == 200) {
						if (options.success) {
							options.success.call(this, xhr.responseJSON, xhr);
						}
					} else {
						var msg = self.getErrorMsg(xhr);
						if (options.error) {
							options.error.call(this, msg, xhr);
						} else {
							self.showError(msg);
						}
					}
				}
			});
		},
		
		getErrorMsg : function(xhr) {
			return $(xhr.responseText).filter("h1:first").text() || xhr.statusText;
		},
		
		showError : function(msg) {
			Util.hint(msg, {
				"type" : "danger",
				delay : 10000
			});
		},
		
		getDataColumns : function(data) {
			var columns = {};
			$.each(data.defCols, function(key){
				columns[key] = {
					"name" : data.defCols[key]["name"],
					"type" : data.defCols[key]["type"]
				};
			});
			return columns;
		}
		
	};

	return baas;
});