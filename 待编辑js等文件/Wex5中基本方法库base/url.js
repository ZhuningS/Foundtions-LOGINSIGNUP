/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
define(function(require) {
	var String = require("./string");
	var Util = require("./util");
	var BSESSIONID = "bsessionid";
	var SKIN = "$skin";
	var LANGUAGE = "language";
	var VERSION = "$version";
	var DEVICE = "device";
	var VLS_PREFIX = "_";
	var VERSION_PREFIX = "v" + VLS_PREFIX;
	var LANGUAGE_PREFIX = "l"  + VLS_PREFIX;
	var SKIN_PREFIX = "s"  + VLS_PREFIX;
	var DEVICE_PREFIX = "d"  + VLS_PREFIX;
	var ACTIVITY2WURL = require.toUrl("$UI/system/service/common/activity2WURL.j");
	var Message = require("./message");
	var _Error = require("./error");
	require("$UI/system/resources/system.res");
	
	

	//contextname是指$v之前的内容, 与标准的contextname有区别
	var URL = function(url, mode) {
		this.source = url;
		this.protocol = "";
		this.hostname = "";
		this.port = "";
		this.contextname = ""; //$@前部分
		this.version = "";
		this.language = null;
		this.skin = null;
		this.device = null;
		this.pathname = ""; //$@后部分
		this.hash = "";
		this.params = {};
		this.noVLS = false;

		this.mode = mode || "vls";
		var newUrl = url;
		try{
			newUrl = decodeURI(url); 
		}catch(e){
			newUrl = url;
		}
		this._parse(newUrl);
	};

	URL.VLS_MODE = "vls";
	URL.CLASSIC_MODE = "classic";

	URL.prototype.getLanguage = function() {
		return this.language || this.params[LANGUAGE] || "";
	};
	
	URL.prototype.getSearch = function(encode){
		var result = "";
		for ( var p in this.params) {
			if (this.params.hasOwnProperty(p)){
				if (!result) result += "?";
				else result += "&";
				if (encode === false){
					result += p + "=" + this.params[p];	
				}else{
					result += p + "=" + encodeURIComponent(this.params[p]);
				}
			}
		}
		return result;
	};

	URL.prototype.getSkin = function() {
		return this.skin || this.params[SKIN] || "";
	};
	
	URL.prototype.getDevice = function(){
		return this.device || this.params[DEVICE] || "";
	};

	URL.prototype.getVersion = function() {
		return this.version || this.params[VERSION] || "";
	};

	URL.prototype.setLanguage = function(val) {
		this.language = val;
	};
	
	URL.prototype.setDevice = function(val){
		this.device = val;
	};

	URL.prototype.setSkin = function(val) {
		this.skin = val;
	};

	URL.prototype.setVersion = function(val) {
		this.version = val;
	};

	URL.prototype.getBSessionID = function() {
		return this.params[BSESSIONID] || Util.getCookie(BSESSIONID) || "";
	};

	URL.prototype.toString = function(encode) {
		var result = this.protocol;
		if (this.hostname)
			result += "//" + this.hostname;
		if (this.port)
			result += ":" + this.port;
		var path = this.getPathname();
		if (path) {
			result += path;

			var items = [];
			if (URL.VLS_MODE !== this.mode) {
				if (this.language)
					items.push(LANGUAGE + "=" + this.language);
				if (this.skin)
					items.push(SKIN + "=" + this.skin);
				if (this.device)
					items.push(DEVICE + "=" +this.device);
			}
			
			for ( var p in this.params) {
				if (this.params.hasOwnProperty(p)){
					//为了兼容5.2, 语言需要带到url的?后 //(p === LANGUAGE) ||
					if ((URL.VLS_MODE === this.mode) && ( (p === SKIN) || p === DEVICE)) {
						continue;
					}
					if (this.params[p] && this.params[p].indexOf &&  ((this.params[p].indexOf("?")>-1) || (this.params[p].indexOf("#")>-1)))
						encode = true;
					if (encode === false){
						items.push(p + "=" + this.params[p]);	
					}else{
						items.push(p + "=" + encodeURIComponent(this.params[p]));
					}
				}
			}

			if (items.length > 0) {
				result += "?" + items.join("&");
			}

			if (this.hash) {
				result += this.hash;
			}
		}
		
		
		return result;
	};

	URL.prototype.getPathname = function() {
		var result = "";
		if (this.contextname)
			result += this.contextname;
		var vls = this.getVLS();
		if (vls)
			result += "/" + vls;
		if (this.pathname)
			result += this.pathname;
		return result;
	};

	URL.prototype.getVLS = function() {
		var result = "";
		//如果当前浏览器中没有版本号时, 不使用vls
		if (!this.enabledVls()){
			return result;
		}
		
		result += VERSION_PREFIX + (this.version || "");
		//解决vls有一项没有值导致整个vls没有传递的问题
		//&& (this.language!=null) && (this.skin!=null) && (this.device!=null)  
		if ((URL.VLS_MODE === this.mode)) {
			result += LANGUAGE_PREFIX + (this.language || "");
			result += SKIN_PREFIX + (this.skin || "");
			result += DEVICE_PREFIX + (this.device || "");
		}
		return result;
	};

	URL.prototype._parse = function(url) {
		var _ls = String.trim(url);
		if (!_ls)
			return;
		var path = null;
		if ((_ls.charAt(0) === '/') || (_ls.charAt(0) === '$')) {
			this.protocol = "";
			this.hostname = "";
			this.port = "";
			path = _ls;
		} else {
			if (_ls.substring(0, 2) === '//') {
				_ls = 'http:' + _ls;
			} else if (_ls.split('://').length === 1) {
				_ls = 'http://' + _ls;
			}

			var items = _ls.split('/');
			this.protocol = items[0];
			if (items[2].indexOf("[") == 0){
				//ipv6: http://[ipv6]:8080/xxx
				var host = items[2].split(']:');
				this.hostname = host[0] + (host[1] ? "]" : "");
				this.port = (host[1] || ((this.protocol.split(':')[0].toLowerCase() === 'https') ? '443' : '80'));
			}else{
				var host = items[2].split(':');
				this.hostname = host[0];
				this.port = (host[1] || ((this.protocol.split(':')[0].toLowerCase() === 'https') ? '443' : '80'));
			}
			path = ((items.length > 3 ? '/' : '') + items.slice(3, items.length).join('/'));
		}
		if (path) {
			var index = path.indexOf("#");
			if (index != -1){
				this.hash = path.substr(index);
			}
			var pathItems = path.split("#");
			
			index = pathItems[0].indexOf("?");
			if (index != -1){
				path = pathItems[0].substr(0, index);
				this._parseParams(pathItems[0].substr(index+1));
			}else{
				path = pathItems[0];
			}
		}

		if (path) {
			if (path.indexOf(VERSION_PREFIX) !== -1){
				var isAbsolute = (path.charAt(0)=='/');
				var names = path.split("/");
				
				var hasVls = false;
				for (var i=0;i<names.length; i++){
					if ((i===0) && !names[i]) continue;
					if (hasVls){
						this.pathname += "/" + names[i];
					}else{
						if (URL._isVLS(names[i])){
							this._parseVLS(names[i]);
							hasVls = true;
						}else{
							this.contextname += "/" + names[i];	
						}
					}
				}
				if (!isAbsolute){
					if (this.contextname){
						this.contextname = this.contextname.substring(1);
					}else if (this.pathname){
						this.pathname = this.pathname.substring(1);
					}
				}
				
				if (!hasVls){
					this.noVLS = true;
					this.pathname = this.contextname;
					this.contextname = "";
				}
			}else{
				if (window.__justep && window.__justep.__ResourceEngine && window.__justep.__ResourceEngine.contextPath && (path.indexOf(window.__justep.__ResourceEngine.contextPath)===0)){
					this.contextname = window.__justep.__ResourceEngine.contextPath;
					this.pathname = path.substring(window.__justep.__ResourceEngine.contextPath.length);
				}else{
					this.noVLS = true;
					this.contextname = "";
					this.pathname = path;
					/*
					var names = path.split("/");
					this.contextname = names[1];
					this.pathname = ((names.length > 2 ? '/' : '') + names.slice(2, names.length).join('/'));
					*/	
				}
			}
		}
	};

	URL.prototype.enabledVls = function(){
		if (this.noVLS) return false;
		var url = window.location.href;
		if (window.__justep && window.__justep.__ResourceEngine && window.__justep.__ResourceEngine.url){
			url = window.__justep.__ResourceEngine.url;
		}

		var items = url.split("/");
		for (var i=0; i<items.length; i++){
			if (URL._isVLS(items[i])){
				return true;
			}
		}
		return false;
	};
	
	URL._isVLS = function(name){
		return name && (name.indexOf(VERSION_PREFIX) === 0)
				&& (name.indexOf(LANGUAGE_PREFIX) !== -1)
				&& (name.indexOf(SKIN_PREFIX) !== -1)
				&& (name.indexOf(DEVICE_PREFIX) !== -1)
				|| (name == VERSION_PREFIX); 
		
	};
	
	// @vxx@lxxx@sxxx
	URL.prototype._parseVLS = function(vls) {
		var items = vls.split(VERSION_PREFIX);
		items = items[1].split(LANGUAGE_PREFIX);
		this.version = items[0];
		if (items[1]) {
			items = items[1].split(SKIN_PREFIX);
			this.language = items[0];
			if (items[1]){
				items = items[1].split(DEVICE_PREFIX);
				this.skin = items[0] || "";
				this.device = items[1] || "";
			}
		}
	};

	URL.prototype._parseParams = function(str) {
		if (!str)
			return;
		var paramItems = str.split("&");
		for ( var i = 0; i < paramItems.length; i++) {
			var index = paramItems[i].indexOf("=");
			if (index > -1){
				var name = paramItems[i].substr(0, index);
				var value = paramItems[i].substr(index+1);
				var newValue = value;
				try{
					newValue = decodeURIComponent(value);
				}catch(e){
					newValue = value;
				}
				this._setParam(name, newValue);
			}
		}
	};
	
	URL.prototype.removeParam = function(name){
		delete this.params[name];
	};

	URL.prototype.setParam = function() {
		if (arguments.length === 2) {
			this._setParam(arguments[0], arguments[1]);
		} else if (arguments.length === 1) {
			if (typeof arguments[0] === 'string') {
				this._parseParams(arguments[0]);
			} else {
				for ( var i in arguments[0]) {
					if (arguments[0].hasOwnProperty(i)){
						this._setParam(i, arguments[0][i]);	
					}
				}
			}
		}
	};

	URL.prototype._setParam = function(name, value) {
		this.params[name] = value;
		if (name === SKIN) {
			this.skin = value;
		} else if (name === LANGUAGE) {
			this.language = value;
		} else if (name === VERSION) {
			this.version = value;
		} else if (name === DEVICE){
			this.device = value;
		}
	};

	URL.prototype.getParam = function(name) {
		return this.params[name];
	};

	URL.prototype.setHash = function(val) {
		this.hash = val;
	};

	URL.prototype.getHash = function() {
		return this.hash;
	};

	URL._instance = function() {
		if (!URL.__instance) {
			URL.__instance = new URL(window.location.href);
		}

		return URL.__instance;
	};

	URL.getBSessionID = function() {
		return URL._instance().getBSessionID();
	};

	URL.getSkin = function() {
		return URL._instance().getSkin();
	};

	URL.getDevice = function() {
		return URL._instance().getDevice();
	};

	URL.getLanguage = function() {
		return URL._instance().getLanguage();
	};

	URL.getSearch = function(args, prefix) {
		var search = [];
		for ( var i in args) {
			if (args.hasOwnProperty(i)) {
				var value = args[i];
				var p = prefix ? prefix + '.' + i : i;
				if (typeof value == 'object') {
					search.push(URL.getSearch(value, p));
				} else
					search.push(p + '=' + encodeURIComponent(value));
			}
		}
		return search.join('&');
	};
	
	URL._getAURLs = function(){
		if (!URL._aURLs){
			var url = require.toUrl("$model/UI2/activity2WindowURL.json");
			$.ajax({
                type: "GET",
                url: url.toString(),
                async: false,
                cache: true 
            }).done(function(data){
            	try{
            		var items = {};
                	if (data){
                		if (typeof (data) === "string")
                			items = JSON.parse(data);
                		else
                			items = data;
                	}
                	URL._aURLs = {};
                	if (items){
            			for (var p in items){
            				if (items.hasOwnProperty(p)){
            					var item = new URL(require.toUrl("$model" + p)).pathname;
            					URL._aURLs[item] = items[p];
            					var item2 = new URL(require.toUrl("$UI" + p)).pathname;
            					URL._aURLs[item2] = items[p];
            				}
            			}
                	}
            	}catch(e){
            		
            	}
            }).fail(function(){
            	
            });
		}
		
		return URL._aURLs;
	};
	
	URL._processAURL = function(path){
		var result = null;
		var urls = URL._getAURLs();
		if (urls){
			var device = URL.getDevice();
			if (!device){
				device = "pc";
				var items = ["Android", "iPhone", "iPad", "iPod", "Windows Phone"];
				for (var i=0; i<items.length; i++){
					if (navigator.userAgent.indexOf(items[i]) > 0){
						device = "mobile";
						break;
					}
				}
			}
			if ("pc" !== device){
				device = "mobile";
			}
			result = urls[path + device];
		}
		if (!result)
			throw new Error(path + "不支持!");
		return result;
	};	
	
	URL.activity2WURL = function(aURL){
		if (!aURL) return aURL;
		var result = null;
		var index = aURL.indexOf("?");
		var query = "";
		if (index !== -1){
			query = aURL.substr(index);
			aURL = aURL.substr(0, index);
		}
		
		if (aURL.substr(aURL.length-2) == ".a"){
			index = aURL.indexOf(".a") + 2;
			var path = aURL.substring(0, index);
			path = new URL(path).pathname;
			if (window.__justep && window.__justep.__isPackage ){
				//TODO 特殊点: 如果path是UI2开头, 删除UI2
				if (path.indexOf("/UI2/")===0){
					path = path.substring("/UI2".length);
				}
				
				result = URL._processAURL(path);
				result = require.toUrl("$model" + result + (query || ""));
			}else{
				var url = new URL(ACTIVITY2WURL);
				url.setParam("aurl", path);
				result = "";
				var response;
				response = $.ajax({
	                type: "GET",
	                url: url.toString(),
	                async: false,
	                cache: true //缓存不严格, 更新有问题
	            }).done(function(data){
	            	if (data === "no"){
						var msg = new Message(Message.JUSTEP230102, aURL);
						throw _Error.create(msg);
	            	}else{
	            		result = require.toUrl("$model" + data + (query || ""));
	            	}
	            }).fail(function(){
	            	var msg = new Message(Message.JUSTEP230102, aURL);
					throw _Error.create(msg);
	            });
				
				/*
				if (response.responseText === "no"){
					var msg = new Message(Message.JUSTEP230102, aURL);
					throw _Error.create(msg);
				}else{
					result = require.toUrl("$model" + response.responseText + (query || ""));
				}
				*/
				
				/*
				result = Cache.getItem(url.toString(), function(){
					var response = $.ajax({
		                type: "GET",
		                url: url.toString(),
		                async: false,
		                cache: false
		            });
					if (response.responseText === "no"){
						var msg = new Message(Message.JUSTEP230102, aURL);
						throw _Error.create(msg);
					}else{
						return require.toUrl("$model" + response.responseText + (query || ""));
					}
				});
				*/
			}

			
		}else{
			result = aURL + (query || "");
		}
		
		return result;
	};	
	
	URL._removeVLS = function(url){
		if (url){
			var items = url.split("/");
			var newItems = [];
			for (var i=0; i<items.length; i++){
				if (URL._isVLS(items[i])){
					newItems[newItems.length] = VERSION_PREFIX; //特殊处理, 将vls部分替换成v_
				}else{
					newItems[newItems.length] = items[i];
				}
			}
			return newItems.join("/");
		}else{
			return url;
		}
		
		
		
	};
	
	URL.isUI2 = function(url) {
		if (url){
			var str = URL.activity2WURL(require.toUrl(url));
			if (str)
				return str.indexOf("/UI2/") !== -1;
		}
		return false;
	};
	
	return URL;
});