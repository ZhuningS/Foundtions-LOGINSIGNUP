/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
define(function(require) {
	var URL = require("./url");
	var deviceTypes = new Array("Android", "iPhone", "iPad", "iPod", "Windows Phone", "PC");

	function currentDevice() {
		var userAgentInfo = navigator.userAgent;
		for ( var v = 0; v < deviceTypes.length; v++) {
			var i = userAgentInfo.indexOf(deviceTypes[v]);
			if (i > 0) {
				return v;
			}
		}
		return deviceTypes.length - 1;
	}
	
	function currentTV(){
		var device = URL._instance().params['device'];
		if(device == "stb"){
			return true;
		}else{
			return false;
		};
	}
	function getInternetExplorerVersion(){
		var rv = 0, ua, re;
		if(!!window.ActiveXObject || "ActiveXObject" in window){
			if (navigator.appName == 'Microsoft Internet Explorer')
			{
				ua = navigator.userAgent;
				re  = /MSIE ([0-9]{1,}[\.0-9]{0,})/;
				if (re.exec(ua) !== null)
					rv = parseFloat( RegExp.$1 );
			}
			else if (navigator.appName == 'Netscape')
			{
				ua = navigator.userAgent;
				re  = /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/;
				if (re.exec(ua) !== null)
					rv = parseFloat( RegExp.$1 );
			}
		}
		return rv;
	}
	
	function currentPC(){
		var device = URL.getDevice();
		if (device){
			return device === "pc";
		}else{
			return deviceTypes[currentDevice()] === "PC";
		}
	}
	
	function currentMobile(){
		var device = URL.getDevice();
		if (device){
			return device === "m";
		}else{
			device = deviceTypes[currentDevice()]; 
			return (device === "Android") || (device === "iPhone") || (device === "Windows Phone");
		}
	}
	
	var sim = false;
	try{
		sim = window.parent && window.parent.getOSName;
	}catch(err){
		
	}
	
	var Browser = {
		IE: getInternetExplorerVersion(),
		IE6: (navigator.appVersion.indexOf("MSIE 6.0")!= -1 && document.compatMode != "BackCompat"), 
		IE7: (navigator.appVersion.indexOf("MSIE 7.0")!= -1 && document.compatMode != "BackCompat")||(document.compatMode != "BackCompat" && document.documentMode==7), 
		IE8: (document.compatMode != "BackCompat" && document.documentMode==8), 
		IE9: (document.compatMode != "BackCompat" && document.documentMode==9), 
		IE10: (document.compatMode != "BackCompat" && document.documentMode==10),
		IE11: (getInternetExplorerVersion() == 11),
		FF: (!window.ActiveXObject && !("ActiveXObject" in window)) && navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1,
		Safari: navigator.userAgent.indexOf("Safari")>0,  
		hasTouch: 'ontouchstart' in window,
		isAndroid: (/android/gi).test(navigator.appVersion),
		isIphone: (/iphone/gi).test(navigator.appVersion),
		isIpad: (/ipad/gi).test(navigator.appVersion),
		
		deviceType: deviceTypes[currentDevice()],
		
		isSimulator: sim,
		isTV : currentTV(),
		isX5App: (navigator.userAgent.indexOf("x5app") >= 0) || (navigator.userAgent.indexOf("Crosswalk") >= 0),
		isYuanXin: navigator.userAgent.indexOf("JDQ") >= 0,
		isWeChat: navigator.userAgent.indexOf("MicroMessenger") >= 0,
		isPCFromUserAgent: deviceTypes[currentDevice()] === "PC",
		isMobileFromUserAgent: (deviceTypes[currentDevice()] === "Android") || (deviceTypes[currentDevice()] === "iPhone") || (deviceTypes[currentDevice()] === "Windows Phone"),
		isIOS: (deviceTypes[currentDevice()] === "iPad") || (deviceTypes[currentDevice()] === "iPod") || (deviceTypes[currentDevice()] === "iPhone"),
		isStandalone : 'standalone' in window.navigator && window.navigator.standalone,
		isPC: currentPC(),
		isMobile: currentMobile()
	};

	return Browser;
});