/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
define(function(require){
	var Component = require("./component");
	var ModelComponent = Component.extend({
		getXid : function(){
			return this.xid; //要求有xid域
		}
	});
	return ModelComponent;
});