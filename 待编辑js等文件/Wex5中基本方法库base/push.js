/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
define(function(require) {
	require("$UI/system/lib/cordova/cordova");
	require("cordova!com.justep.cordova.plugin.push");
	require("cordova!cordova-plugin-device");
	var Baas = require("./baas");
	var Shell = require("../portal/shell");
	var Browser = require("./browser");
	var Object = require("./object");
	var Observable = require("./observable");
	var Operational = require("./operational");
	
	
	

	var _processMessage = null;
	/**
	 * message格式: 
	  	{
	  		title: "hello",
      		detailTitle: "hello detail",
      		icon: "",
      		url: "",
      		surl:"",
      		exts: {}     
	  	}
	 */	
	var Push = Object.extend({
		mixins : [ Observable, Operational ],
		constructor : function() {
			this.callParent();
			Observable.prototype.constructor.call(this);
			Operational.prototype.constructor.call(this);
		},

		init: function(personID, password){
			if (Browser.isPC){
				//this._registerTerminal(personID, personID + ".pcid");
				
			}else{
				var me = this;

				document.addEventListener('deviceReady',function(){
					var connectSuccess = function(){
						var terminalID = navigator.push.token;

						me._registerTerminal(personID, terminalID);
					};
					var connectFail = function(){
						if (console)
							console.error('push connect error');
					};
					//var password = new MD5(true).hex_md5("justep");//Utils.getCookie("access_token") || "";
					var params = { 
						userName: personID,
						password: password,
						topicName: me._getTopicName(personID)
					};
					if (!_processMessage){
						_processMessage = function(evt){
							try{
								var message = JSON.parse(evt.data);
								//因为ios的扩展属性转换成了string
								if (message.e && (typeof(message.e) === "string")){
									try{
										message.e = JSON.parse(message.e);
									}catch(e1){
										if (console){
											console.log(e1);
										}
									}
								}
								if (message.aps && message.aps.alert)
									message.title = message.aps.alert;
								var event = {message: message, cancel: false};
								me.fireEvent(me.MESSAGE_EVENT, event);
								if (!event.cancel){
									message.type = message.type || me.DEFAULT_TYPE;
									event = {message: message, cancel: false};
										me.fireEvent(message.type, event);
									if (!event.cancel && (message.type === me.DEFAULT_TYPE)){
										//默认打开相应的功能页面
										if (message.url){
											justep.Shell.showPage({url: message.url, title: message.title||""});
										}else if (message.surl){
											$.ajax({
								                type: "GET",
								                url: message.surl,
								                async: false,
								                cache: false 
								            }).done(function(data){
								            	justep.Shell.showPage({url: data, title: message.title||""});
								            }).fail(function(){
								            	if (console)
								            		console.error("请求" + message.surl + "失败!");
								            });
										}
									}
								}
							}catch(err){
								if (console)
									console.error(err);
							}
						};		
					}
					
					document.addEventListener('pushMessage', _processMessage, false);
					if (navigator && navigator.push && navigator.push.connect){
						navigator.push.connect(connectSuccess, connectFail, params);
					}else{
					}
				},false);
			}
		},
		
		disConnect: function(){
			if (_processMessage){
				document.removeEventListener('pushMessage', _processMessage, false);
			}
			if (navigator && navigator.push && navigator.push.disConnect){
				navigator.push.disConnect();
			}
		},
		
		
		_getTopicName: function(personID){
			return "/" + personID + "/" + this.getTerminalType() + "/%1$s" + this.BUSINESS_TOPIC;
		},
			
		_registerTerminal: function(personID, terminalID){
			this._do(personID, terminalID, "registerTerminalAction");
		}, 
		
		_unRegisterTerminal: function(personID, terminalID){
			this._do(personID, terminalID, "unRegisterTerminalAction");
		},
		
		_do: function(personID, terminalID, action){
			try{
				Baas.sendRequest({
					"url" : "/org/push",
					"action" : action,
					"async" : false,
					"params" : {
						type : this.getTerminalType(),
						terminalID : terminalID, 
						protocol: this.getTerminalProtocol(),
						personID: personID
					}
				});
			}catch(e){
				if (console){
					console.log(e)
				}
			}
		},
		
		getTerminalProtocol: function(){
			if (Browser.isIOS){
				return this.TERMINAL_PROTOCOL_APNS;
			}else{
				return this.TERMINAL_PROTOCOL_MQTT;
			}
		},
		
		getTerminalType: function(){
			if (Browser.isPC){
				return this.TERMINAL_TYPE_PC;
			}else if (Browser.isMobile){
				return this.TERMINAL_TYPE_MOBILE;
			}else{
				return this.TERMINAL_TYPE_PC;
			}
		},
		
		TERMINAL_TYPE_PC: "pc",
		TERMINAL_TYPE_MOBILE: "mobile",
		TERMINAL_TYPE_PAD: "pad",
		TERMINAL_PROTOCOL_MQTT: "mqtt",
		TERMINAL_PROTOCOL_APNS: "apns",
		
		BUSINESS_TOPIC: "/business",
		PUSH_SERVER: "/PushServer",
		PUSH_TOPIC: "/PushServer",
		DEFAULT_TYPE: "default",
		
		MESSAGE_EVENT: "onMessage"
	});
	
	var cur = new Push();
	return cur;
});
