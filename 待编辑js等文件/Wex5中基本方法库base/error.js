/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
define(function(require){
	var Message = require("./message");
	var jquery = require("jquery");
	require("$UI/system/resources/system.res");
	var titleLabel = (new Message(Message.JUSTEP230101)).getMessage();
	var msgLabel = (new Message(Message.JUSTEP230091)).getMessage();
	var codeLabel = (new Message(Message.JUSTEP230092)).getMessage();
	var reasonLabel = (new Message(Message.JUSTEP230093)).getMessage();
	var showDetailLabel = (new Message(Message.JUSTEP230094)).getMessage();
	var hideDetailLabel = (new Message(Message.JUSTEP230095)).getMessage();
	var closeLabel = (new Message(Message.JUSTEP230096)).getMessage();

	var _Error = {
			SERVER_ERROR_START: "__justepServerErrorStart__",
			SERVER_ERROR_END: "__justepServerErrorEnd__",
			CLIENT_ERROR_START: "__justepClientErrorStart__",
			CLIENT_ERROR_END: "__justepClientErrorEnd__",
			create : function(message){
				if (message instanceof Message){
					var data = {'code': message.getCode(), 'reason': message.getReason(), 'message': message.getMessage(),
							'stack': message.getStack(), 'messages':message.getMessages()};
					
					return new Error(this.CLIENT_ERROR_START + JSON.stringify(data) + this.CLIENT_ERROR_END);
				}else{
					return new Error(message);
				}
			}
		};
	
	
	
	function getErrorContent(err, startStr, endStr){
		var message = err.message || "";
		var start = message.indexOf(startStr);
		var end = message.indexOf(endStr);
		if ((start!=-1) && (end!=-1) && (end>start)){
			return message.substr(start+startStr.length, end-(start+startStr.length)); 
		}else{
			return null;
		}
	}
	
	function getClientError(err){
		return getErrorContent(err, _Error.CLIENT_ERROR_START, _Error.CLIENT_ERROR_END);
	}
	
	function getServerError(err){
		return getErrorContent(err, _Error.SERVER_ERROR_START, _Error.SERVER_ERROR_END);
	}
	
	function ErrorDialog(){
		var id = "__justepErrorDialog__";
		var node = $("#" + id)[0];
		if (!node){
			/*<span style='font-weight:bold'>"+msgLabel+"</span>*/
			var content = "	<div class='modal' style='z-index:30000' id='"+ id +"'>" +
						"		<div class='modal-dialog'>" +
						"			<div class='modal-content'>" +
						"				<div class='modal-header'>" +
						" 					<button type='button' class='close x-error-close' aria-hidden='true'>&times;</button>" +						
						"					<h4>" + titleLabel + "</h4>" +
						"				</div>" +
						"				<div class='modal-body' style='overflow:auto;max-height:400px'>" +
						"					<div class='x-error-message'><span style='word-wrap: break-word;word-break: break-all;' class='x-error-message-body'/></div>" +
						"					<div class='x-error-code'><span style='font-weight:bold'>"+codeLabel+"</span><span class='x-error-code-body'/></div>" +
						"					<div class='x-error-reason'><span style='font-weight:bold'>"+reasonLabel+"</span><span class='x-error-reason-body'/></div>" +
						"					<div><a  class='x-error-show-detail'>"+showDetailLabel+"</a></div>" +
						"					<div class='x-error-stack' style='word-wrap: break-word;'/>" +
						"				</div>" +
						"				<div class='modal-footer'>" +
						"					<button type='button' class='btn btn-default x-error-close'>"+closeLabel+"</button>" +
						"				</div>" +
						"			<div>" +
						"		</div>" +
						"	</div>";
			
			
			var $node = $(content);
			$("#applicationHost").append($node);
			if (!(window.__justep && window.__justep.isDebug)){
				$(".x-error-show-detail").hide();
			}
			$node.find(".x-error-close").on("click", function(){
				$node.hide();
			});
			$node.find(".x-error-show-detail").on("click", function(){
				var btn = $node.find(".x-error-show-detail");
				if (btn.hasClass("x-error-show")){
					btn.removeClass("x-error-show");
					btn.text(showDetailLabel);
					$node.find(".x-error-stack").hide();
				}else{
					btn.text(hideDetailLabel);
					btn.addClass("x-error-show");
					$node.find(".x-error-stack").show();
				}
			});
			this.domNode = $node[0];
			this.$domNode = $node;
		}
	}
	
	ErrorDialog.prototype.open = function(data){
		var info = data.server || data.client;
		this.$domNode.find(".x-error-message-body").empty();
		this.$domNode.find(".x-error-message-body").append((info.message || "").replace(new RegExp('\n', "gm"), '<br/>'));
		if (info.code){
			this.$domNode.find(".x-error-code").show();
			this.$domNode.find(".x-error-code-body").text(info.code);
		}else{
			this.$domNode.find(".x-error-code").hide();
		}
		if (info.reason){
			this.$domNode.find(".x-error-reason").show();
			this.$domNode.find(".x-error-reason-body").text(info.reason);
		}else{
			this.$domNode.find(".x-error-reason").hide();
		}

		this.$domNode.find(".x-error-show-detail").text(showDetailLabel).removeClass("x-error-show");
		this.$domNode.find(".x-error-stack").text(info.stack || "").hide();
		
		this.$domNode.show();
	};
	

	function getError(err){
		var msg = err.message || "";
		try{
			return JSON.parse(msg);
		}catch(data){
			return null;
		}
	}

	window.onerror = function(){
		if(arguments.length > 2){
			//fix weixin ios browser bug
			if(arguments[2] === 55 && arguments[0] === "TypeError: null is not an object (evaluating 'a.childNodes')"){
				return;
			}
			//fix leshi nightmod bug
			if(arguments[2] === 1 && arguments[0] === "Uncaught ReferenceError: diableNightMode is not defined"){
				return;
			}
			//fix qiku 360browser
			if(arguments[2] === 1 && arguments[0] === "Uncaught SyntaxError: Unexpected identifier"){
				return;
			}
		}
		
		
		var err = null;
		for (var i=0; i<arguments.length; i++){
			if (arguments[i] instanceof Error){
				err = arguments[i];
				break;
			}
		}
		
		//解决safari取不到err对象的问题
		if (!err){
			var msg = arguments[0] || ""; 
			var index = msg.indexOf(":");
			if (index != -1){
				msg = msg.substr(index+1);
			}
			err = {message: msg};
		}
		
		var data = {};
		if (err){
			var json = getError(err);
			if (json){
				data.server = json;
			}else{
				var content = getServerError(err);
				if (content){
					//server error
					data.server = JSON.parse(content);
					data.client = {};
					data.client.message = (err.message||"").replace(_Error.SERVER_ERROR_START, "").replace(_Error.SERVER_ERROR_END, "");
					data.client.stack = (err.stack||"").replace(_Error.SERVER_ERROR_START, "").replace(_Error.SERVER_ERROR_END, "");
					
				}else{
					content = getClientError(err);
					if (content){
						//client error
						data.client = JSON.parse(content);
						if (!data.client.stack){
							data.client.stack = (err.stack||"");
						}
						data.client.stack = data.client.stack.replace(_Error.CLIENT_ERROR_START, "").replace(_Error.CLIENT_ERROR_END, "");
					}else{
						//other error
						data.client = {};
						data.client.message = err.message;
						data.client.stack = err.stack;
					}
				}
			}
		}else{
			data.client = {};
			data.client.message = arguments[0];
		}

		
		if (!window.errorDialog)
			window.errorDialog = new ErrorDialog();
		
		window.errorDialog.open(data);
		return false;
	};
	

	$(document).ajaxError( function(event, jqXHR, options, data){
		if (jqXHR.status==0 && !jqXHR.responseText){
			setTimeout(function(){
				var msg = new Message(Message.JUSTEP230109);
				throw _Error.create(msg);
			}, 1);
		}
	});
	
	
	
	return _Error;
});