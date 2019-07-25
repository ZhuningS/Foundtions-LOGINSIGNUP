define(function(require) {
	var $ = require("jquery");
	var Request = require("$UI/system/lib/base/request");
	var URL = require("$UI/system/lib/base/url");

	var ActionPermission = function() {
		this._disabledActions = {};
		this._bSessionID = null;
	};
	
	ActionPermission.prototype._getDisabledActions = function(process,context) {
		var key = process;
		var executor = context && $.isFunction(context.getExecutor)?context.getExecutor():null;
		if(executor) key = process +'/'+ executor;//增加执行者支持
		if (this._bSessionID != URL.getBSessionID()) {
			this._bSessionID = URL.getBSessionID();
			this._disabledActions = {};
		}
		if (this._disabledActions[key]) {
			return this._disabledActions[key];
		} 
		var self = this;
		var params = new Request.ActionParam();
		params.setString("process", process);
		params.setString("activity", "*");
		Request.sendBizRequest({
			"process" : "/SA/OPM/system/systemProcess",
			"activity" : "mainActivity",
			"action" : "getDisabledActions",
			"context": context,
			"parameters" : params,
			"callback" : function(res) {
				res.ignoreError = true;
				if (res.state) {
					self._disabledActions[key] = res.response;
				}
			}
		});
		
		return this._disabledActions[key];
	};
	
	ActionPermission.prototype.isDisabledAction = function(model, action) {
		var context,process,activity;
		if ($.isPlainObject(model)) {
			process = model.process;
			activity = model.activity;
			action = model.action;
		} else {
			context = model.getContext();
			process = context.getProcess();
			activity = context.getActivity();
		}
		
		var disabledActions = this._getDisabledActions(process,context);
		var actionFullName = process + "/" + activity + "/" + action;
		return ($.inArray(actionFullName, disabledActions) >= 0);
	};
	
	return new ActionPermission();
});
