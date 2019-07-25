/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
define(function(require) {
	var toString = Object.prototype.toString;
	var Str = require("./string");
	var __Date = require("./date");
	var $ = require("jquery");
	var bind = require("bind");

	var disableEvent = function(e) {
		// e.stopPropagation(); //阻止了事件冒泡，但不会阻击默认行为
		e.preventDefault(); // 不阻击事件冒泡，但阻击默认行为
		// return false; //阻止了事件冒泡，也阻止了默认行为
	};
	
	
	if (!window.requestAnimationFrame) {
		var lastTime = 0;
		window.requestAnimationFrame = window.webkitRequestAnimationFrame || function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
		window.cancelAnimationFrame = window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || function(id) {
			clearTimeout(id);
		};
	}
	

	var util = {
		/*	
		loadScript: function(url, callback){
			if (url){
				var items = $("script[src='" + url + "']");
				if (items.length===0){
					var head= document.getElementsByTagName('head')[0];  
					var script= document.createElement('script');  
					script.type= 'text/javascript';
					if (callback){
						script.onload = script.onreadystatechange = function() {  
						    if (!this.readyState || this.readyState === "loaded" ||    this.readyState === "complete" ) { 
						        callback();  
						        // Handle memory leak in IE 
						        script.onload = script.onreadystatechange = null;  
						    } };  
					}
					script.src= url;  
					head.appendChild(script);  
				}
			}
		},
		*/
		isBoolean : function(value) {
			return typeof value === 'boolean';
		},
		isString: function(value){
			return toString.call(value) === '[object String]';
		},
		isFunction: function(value){
			return toString.call(value) === '[object Function]';
		},
		isArray : function(value) {
			return toString.call(value) === '[object Array]';
		},
		toArray : function(iterable, start, end) {
			if (!iterable || !iterable.length) {
				return [];
			}

			if (typeof iterable === 'string') {
				iterable = iterable.split('');
			}

			return Array.prototype.slice.call(iterable, start || 0, end || iterable.length);
		},
		clone : function(item) {
			if (item === null || item === undefined) {
				return item;
			}

			var type = toString.call(item);

			// Date
			if (type === '[object Date]') {
				return new Date(item.getTime());
			}

			var i, clone, key;

			// Array
			if (type === '[object Array]') {
				i = item.length;

				clone = [];

				while (i--) {
					clone[i] = util.clone(item[i]);
				}
			}
			// Object
			else if (type === '[object Object]' && item.constructor === Object) {
				clone = {};

				for (key in item) {
					clone[key] = util.clone(item[key]);
				}
			}

			return clone || item;
		},

		isObject : (toString.call(null) === '[object Object]') ? function(value) {
			// check ownerDocument here as well to exclude DOM nodes
			return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
		} : function(value) {
			return toString.call(value) === '[object Object]';
		},

		apply : function(object, config, defaults) {
			if (defaults) {
				this.apply(object, defaults);
			}

			if (object && config && typeof config === 'object') {
				for ( var i in config) {
					object[i] = config[i];
				}
			}

			return object;
		},
		addCookie : function(name, value, path, expiresHours, noescape) {
			var cookieString = name + "=" + (!noescape?escape(value):value);
			// 判断是否设置过期时间
			if (expiresHours && expiresHours > 0) {
				var date = new Date();
				date.setTime(date.getTime() + expiresHours * 3600 * 1000);
				cookieString = cookieString + "; expires=" + date.toGMTString();
			}
			if (path) {
				cookieString = cookieString + "; path=" + path;
			}
			document.cookie = cookieString;
		},
		getCookie : function(name) {
			var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
			if (arr = document.cookie.match(reg))
				return unescape(arr[2]);
			else
				return null;
		},
		deleteCookie : function(name, path) {
			var date = new Date();
			date.setTime(date.getTime() - 10000);
			var cookieString = name + "=v; expires=" + date.toGMTString();
			if (path) {
				cookieString = cookieString + "; path=" + path;
			}
			document.cookie = cookieString;
		},
		toExprString : function(dataType, value, isKSQL) {
			dataType = dataType ? dataType.toUpperCase() : "STRING";
			if (null === value || typeof value === 'undefined')
				return "null";
			if (("DATE" == dataType || "TIME" == dataType || "DATETIME" == dataType) && typeof value == 'string') {
				value = __Date.fromString(value, 'yyyy-MM-ddThh:mm:ss');
			}
			if (value instanceof Date)
				value = __Date.toString(value, 'yyyy-MM-dd hh:mm:ss');
			if ("STRING" == dataType) {
				return "'" + value + "'";
			} else if ("DATE" == dataType)
				return "stringToDate('" + value + "')";
			else if ("TIME" == dataType)
				return "stringToTime('" + value + "')";
			else if ("DATETIME" == dataType)
				return "stringToDateTime('" + value + "')";
			else
				return value + '';
		},
		disableTouchMove : function(node) {
			$(node).on('touchmove', disableEvent);
		},
		enableTouchMove : function(node) {
			$(node).off('touchmove', disableEvent);
		},
		disableEvent : function(node,evtName) {
			$(node).on(evtName, disableEvent);
		},
		enableEvent : function(node,evtName) {
			$(node).off(evtName, disableEvent);
		},
		fixedIosPanel : function(node,enable){
			var $panel = $(node).closest('.x-panel');
			var count = $panel.prop('x_fixedIosPanel_count')||0;
			enable?count++:count--;
			if(count<0) count=0;
			$panel.prop('x_fixedIosPanel_count', count); //解决windowDialog+panel在ios下多层嵌套的问题
			$panel[count>0?'addClass':'removeClass']('ios-fixed-panel');
		},
		hint: function(text, options){
			if(!text) return;
			if(typeof text == 'string'){
				options = options || {};
				options.text = text;
			}else if(typeof text == 'object'){
				options = text;
			}
			
			options.type = options.type || 'info';
			options.delay = options.delay || 3000;
			options.position = options.position || 'top';
			options.parent = options.parent || 'body';
			options.style = options.style || '';
			
			var template = '<div class="alert alert-{0} x-hint x-hint-{1}" style="z-index: 50000;{2}">' +
					'<button type="button" class="close">' + 
						'<span aria-hidden="true">&times;</span>' +
						'<span class="sr-only">Close</span>' +
					'</button>' +
					'{3}' +
				"</div>";
			var html = Str.format(template, options.type, options.position, options.style, options.text);
			var $el = $(html).appendTo(options.parent).show('slow');
			var iid;
			if(options.delay){
				iid = setTimeout(function(){
					closeFn();
				}, options.delay);
			}
			$('.close', $el).click(closeFn);
			function closeFn(){
				$el.remove();
				clearTimeout(iid);
			}
		},
		confirm: function(text, onOk, onCancel, type){
			if(!text) return;
			
			var btn = '<button type="button" class="btn btn-primary ok">确定</button>' +
	        	'<button type="button" class="btn btn-link cancel">取消</button>';
 
			if (type === "ok"){
				btn = '<button type="button" class="btn btn-default ok">关闭</button>';
			}
			
			//永远在最上层
			var template = '<div class="modal" style="z-index: 50000;">' +
			  '<div class="modal-dialog">' +
			    '<div class="modal-content">' +
			      '<div class="modal-header">' +
			        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
			        '<h4 class="modal-title">{0}</h4>' +
			      '</div>' +
			      '<div class="modal-body">' +
			        '<p>{1}</p>' +
			      '</div>' +
			      '<div class="modal-footer">' + btn + 
			      '</div>' +
			    '</div>' +
			  '</div>' +
			'</div>';		
			
			var html = Str.format(template, '提示', text);
			var $el = $(html).appendTo('body').show();
			$('.close', $el).click(closeFn);
			if(type !== "ok"){
				$('.cancel', $el).click(closeFn);	
			}
			$('.ok', $el).click(function(){
				$el.remove();
				onOk && onOk();
			});
			function closeFn(){
				$el.remove();
				onCancel && onCancel();
			}
		},
		setGlobalValue : function(n,v){
			if(!window.__justep._userData) window.__justep._userData = {}; 
			window.__justep._userData[n] = v;
		},
		getGlobalValue : function(n){
			if(!window.__justep._userData) window.__justep._userData = {}; 
			return window.__justep._userData[n];
		},
		callModelFn : function(option){
			var fn = option.fn;
			if(fn){
				var context = option.context;
				if(!context){
					var domNode = option.domNode || (option.event?(option.event.target||option.event.srcElement):null);
					if(domNode)context = bind.contextFor(domNode);
				}
				if(context){
					var model = context['$model'];
					if(model && 'function'===typeof(model[fn])){
						var args = [];
						for(var i=1,len=arguments.length;i<len;i++){
							args.push(arguments[i]);
						}
						return model[fn].apply(model, args);
					}
				}
			}
		},		
		bindModelFn : function(model,func,caller){
			if(model && $.isFunction(model.bindModelFn)) return model.bindModelFn(func,caller);
			else if('function'===typeof(func)) return func.bind(caller||window);
			else return func;
		},
		getModel: function(element){
			if (element){
				var ctx = bind.contextFor(element);
				if (ctx) return ctx["$model"];
			}
			return null;
		},
		toUrl: function(url){
			return url?require.toUrl(url):url;
		},
		getHref: function(){
			return window.location.href;
		},
		getHost: function(){
			return window.location.host;
		},
		getPathname: function(){
			return window.location.pathname;
		},
		getSearch: function(){
			return window.location.search;
		}
	};
	
	
	
	return util;
});