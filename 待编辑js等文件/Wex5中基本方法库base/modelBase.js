/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
/**
 * 页面的生命周期： 1. 请求页面的model.js, 创建Model实例, 在创建Model实例的过程中, 创建Data实例; 2. 请求页面的view;
 * 3. 将Model实例与view进行数据绑定, 创建view中组件实例; 4. [用户使用]触发onModelConstruct事件; 5. 加载数据,
 * [引擎使用]触发onModelConstructing事件，data监听这个事件来加载数据; 6.
 * [用户使用]触发onModelConstructDone事件; 7. [用户使用]触发onLoad事件; 8. [用户使用]页面关闭或被删除时,
 * 触发onunLoad事件
 */
define(function(require) {
	var Component = require("./component");
	var Object = require("./object");
	var _Error = require("./error");
	var Context = require("./context");
	var UUID = require("./uuid");
	var Observable = require("./observable");
	var $ = require("jquery");
	var bind = require("bind");
	var INNER_MODEL = "__inner-model__";
	var Message = require("./message");
	var RouteState = require('$UI/system/lib/route/routeState');
	var URL = require("./url");
	var Util = require("./util");
	require("$UI/system/resources/system.res");

	var Model = Object.extend({
		mixins : Observable,
		
		setParams: function(params, noUpdateState){
			this.params = params;
			if (!noUpdateState){
				this._updateState();	
			}
			if (this._status >= Model.MODEL_STATUS_LOAD){
				this.fireEvent(Model.PARAMS_RECEIVE_EVENT, {source: this, params: this.params, data: this.params});
			}
		},
		
		close: function(){
			this.owner.close();
		},
		
		_updateState: function(){
			try{ 
				var hash = "";
				if (this.__src){
					hash = new URL(this.__src).hash;	
				}
				this.$routeState.resetState(hash || "");
			}catch(e){
				if (console && console.log && e){
					conslog.log(e.stack || "");
				}
			}
		},
		
		_getParamsFromURL: function(url){
			var urlObj = new URL(url);
			return urlObj.params || {};
		},
		
		_createContext: function(){
			var params = this._getParamsFromURL(this.__contextUrl);
			return new Context({params:params}, this);
		},
		
		getLoadedDeferred: function(id){
			id = id || new UUID().toString();
			
			var result = this.__loadedDefereds[id];
			if (!result){
				result = $.Deferred();
				this.__loadedDefereds[id] = result;
			}
			
			return result;
		},
		
		constructor : function() {
			this['_editor_class_'] = {};
			this._status = Model.MODEL_STATUS_CONSTRUCT;
			if (this.__contextUrl) {// __contextUrl支持url和json对象
				if (typeof (this.__contextUrl) === 'string') {
					this.__context = this._createContext();
				} else {
					if (!this.__contextUrl.flag){
						var result = {
								"message" : this.__contextUrl.message || "",
								"reason" : this.__contextUrl.reason || "",
								"code" : this.__contextUrl.code || "",
								"stack" : this.__contextUrl.stack || "",
								"messages" : "",
								"url" : "",
								"param" : ""
							};
						throw _Error.create(_Error.SERVER_ERROR_START + JSON.stringify(result) + _Error.SERVER_ERROR_END);
					}
					this.__context = new Context(this.__contextUrl.data, this);
				}
			}
			this.callParent();

			this.__title = bind.observable("");

			this.__componentDefereds = {};
			
			this.__loadedDefereds = {};

			this.__components = {}; // 用来存储data组件

			var self = this;
			this._onMessageFn = function(event) {
				var data = event.originalEvent.data;
				try{/*这里是为了兼容IE9*/
					data = JSON.parse(data);
				}catch(e){}	
				if (data.type && data.type == "model") {
					self.fireEvent(data.event.name);
				}
			}; 
			
			$(window).on('message', this._onMessageFn);

			this._unloadFn = function(){
				self.destroy();
			};
			$(window).on("unload", this._unloadFn);
			Observable.prototype.constructor.call(this);
			
			this.$routeState = new RouteState(this);
			this.$routeState.on('onRouteStatePublish',function(event){
				this.fireEvent('onRouteStatePublish',event);
			},this);
			this.$routeState.on('onRoute', function(event){
				if (event.xid === "__state"){
					event.cancel = true;
				}			
			});
		},

		getTitle: function(){
			return this.__title.get();
		},
		setTitle: function(t){
			this.__title.set(t);
		},
		_getOperation : function(op) {
			if (typeof (op) == 'string') {
				var index = op.indexOf(".");
				if (index != -1) {
					return {
						owner : op.substring(0, index),
						name : op.substring(index + 1)
					};
				} else {
					var msg = new Message(Message.JUSTEP230075, op);
					throw _Error.create(msg);
				}
			} else
				return op;
		},
		
		executeOperation: function(defOps, event){
			if(!$.isArray(defOps))
				defOps = [defOps];
				
			for(var i=0;i<defOps.length;i++){
				var defOp = defOps[i];
				var op = this._getOperation(defOp['operation']);
				if (op) {
					defOp.operation = op;// 进行缓存
					var comp = this.comp(op.owner);
					if (comp){
						var bindingContext = event && event.bindingContext || {};
						var ctx = $.extend({
							$model : this,
							$event : event,
							$object : bindingContext.$object,
							args : defOp.args
						},bindingContext);
						comp.executeOperation(op.name, ctx);
					} else {
						var msg = new Message(Message.JUSTEP230114, defOp['operation']);
						throw _Error.create(msg);
					}
				}
			}
		},

		_callModelFn : function() {
			var event = arguments[2];
			event.bindingContext = bind.contextFor(event.currentTarget);
			var viewModel = this, fn = arguments[0];
			if (typeof (fn) === 'string') {
				/* jshint -W085 */
				with (viewModel) {
					/* jshint +W085 */
					try {
						fn = eval("(" + fn + ")");
					} catch (e) {
						var msg = new Message(Message.JUSTEP230064, event.type, fn);
						throw _Error.create(msg);
					}
				}
			}
			var t = typeof (fn);
			if(t === 'function') return fn.apply(this, [ event ]);
			else if (t === 'object' && fn['operation']){
				return this.executeOperation([fn], event);
			}else if ($.isArray(fn)){
				return this.executeOperation(fn, event);
			}else{
				var msg = new Message(Message.JUSTEP230113, arguments[0]);
				throw _Error.create(msg);
			} 
		},

		getEditorClass: function(url){
			return this['_editor_class_'][url];
		},
		
		addEditorClass: function(url,clz){
			this['_editor_class_'][url] = clz;
		},

		call : function(caller, fn) {
			if (1 == arguments.length) {
				fn = caller;
				caller = this;
			}
			return function() {
				return fn.apply(caller);
			};
		},

		ref : function(col) {
			return function(item) {
				return (item && item.ref) ? item.ref(col) : "";
			};
		},

		getParent : function() {
			return this._parentModel;
		},
		
		getParentModel: function(){
			return this.getParent();
		},

		getRootNode : function() {
			return this._rootNode;
		},
		
		setRootNode: function(node){
			this._rootNode = node;
		},

		isConctructed : function() {
			return this.isConstructed();
		},

		isConstructed : function() {
			return Model.MODEL_STATUS_CONSTRUCTED===this._status;
		},
		
		// compositionComplete
		attached : function(child, parent, context) {
			this.__parent = parent;
			bind.utils.domData.set(parent, INNER_MODEL, this); // 在compose组件中会使用INNER_MODEL来获取
			if (parent) {
				var parentContext = bind.contextFor(parent);
				if (parentContext && parentContext.$model) {
					this._parentModel = parentContext.$model;
				}
			}

			// 处理__componentDefereds
			var allError = "";
			for ( var xid in this.__componentDefereds) {
				if (this.__componentDefereds.hasOwnProperty(xid)){
					var dtd = this.__componentDefereds[xid];
					if (dtd.state() == 'pending') {
						var err = "";
						var curComponent = this.comp(xid);
						if (curComponent) {
							err = new Message(Message.JUSTEP230082, xid, curComponent.componentName).getMessage();
						} else {
							err = new Message(Message.JUSTEP230081, xid).getMessage();

						}
						dtd.reject(err);
						if (allError)
							allError += ",";
						allError += err;
					}
				}
				
			}
			
			this.__componentDefereds = {};
			

			if (allError) {
				throw new Error(allError);
			}
			

			this.fireEvent(Model.MODEL_CONSTRUCT_EVENT, {
				source : this
			});
			this._status = Model.MODEL_STATUS_CONSTRUCTING;
			this.fireEvent(Model.MODEL_CONSTRUCTING_EVENT, {
				source : this
			});
			this._status = Model.MODEL_STATUS_CONSTRUCT_DONE;
			this.fireEvent(Model.MODEL_CONSTRUCT_DONE_EVENT, {
				source : this
			});
			this._status = Model.MODEL_STATUS_LOAD;
			this.fireEvent(Model.LOAD_EVENT, {
				source : this
			});
			//data为了兼容
			this.fireEvent(Model.PARAMS_RECEIVE_EVENT, {source: this, params: this.params, data: this.params});			

			var composeComponent = this.comp(parent);
			if (composeComponent && composeComponent.loaded) {
				composeComponent.loaded();
			}


			this._status = Model.MODEL_STATUS_CONSTRUCTED;
			
			
			

			var processItemsDeferred = [];
			for ( var id in this.__loadedDefereds) {
				if ((this.__loadedDefereds.hasOwnProperty(id)) && this.__loadedDefereds[id].promise){
					processItemsDeferred.push(this.__loadedDefereds[id].promise());
				}
			}
			
			var self = this;
			$.when.apply($, processItemsDeferred).done(function(){
				self.fireEvent(Model.LOADED_EVENT, {
					source : self
				});
				self.__loadedDefereds = {};
			}).fail(function(){
				self.__loadedDefereds = {};
			});
		},

		getStatus : function(){
			return this._status;
		},
		detached : function(child, parent, context) {
			this.destroy();
		},
		
		bindModelFn : function(func,caller){
			return this._bindModelFn(func,{model:this,caller:caller});
		},
		_bindModelFn : function(func,context){
			if(!$.isFunction(func)) return func;
			context = context || {model:this};
			var ret = function(){
				if(this.model.isDestroyed){
					if('function'===typeof(this.modelDestroyHandle)) this.modelDestroyHandle();
					return;
				}
				func.apply(this.caller||this.model,arguments);
			};
			return ret.bind(context);
		},
		setInterval : function(cb, ms){
			var context = {model:this};
			var fn = this._bindModelFn(cb,context);
			var t = window.setInterval(fn, ms);
			context.modelDestroyHandle = function(){window.clearInterval(t);};
			return t;
		},
		destroy: function(){
			this.isDestroyed = true;
			this.__componentDefereds = {};
			
			this.fireEvent(Model.UNLOAD_EVENT, {source : this});
			if (this.__parent){
				bind.utils.domData.set(this.__parent, INNER_MODEL);	
			}
			this.__parent = null;
			this._parentModel = null;
			$(window).off("message", this._onMessageFn);
			$(window).off("unload", this._unloadFn);
			this._onMessageFn = null;
			this._unloadFn = null;
			
			this.$routeState.off('onRouteStatePublish');
		},

		_getComponentDeferedKeys: function(xidOrNode){
			var result = [];
			if (typeof(xidOrNode) === "string"){
				result.push(xidOrNode);
			}else{
				var $e = $(xidOrNode);
				var xid = $e.attr("xid");
				if (xid){
					result.push(xid);
				}
				var _xid = $e.attr("_xid");
				if (_xid){
					result.push(_xid);
				}
			}
			return result;
		}, 
		
		resolvedComponent : function(xidOrNode) {
			var c = this.comp(xidOrNode);
			var keys = this._getComponentDeferedKeys(xidOrNode);
			for (var i=0; i<keys.length; i++){
				this._getComponentDefered(keys[i]).resolve(c);
			}
		},

		_disposeComponent : function(xidOrNode) {
			var keys = this._getComponentDeferedKeys(xidOrNode);
			for (var i=0; i<keys.length; i++){
				delete this.__componentDefereds[keys[i]];
			}
		},		
		componentPromise : function(xidOrNode) {
			return this._getComponentDefered(xidOrNode).promise();
		},

		_getComponentDeferedKey : function(xidOrNode) {
			var key = null;
			if (xidOrNode) {
				if (typeof (xidOrNode) === 'string') {
					key = xidOrNode;
				} else {
					var $e = $(xidOrNode);
					key = $e.attr("_xid");
					if (!key) {
						key = new UUID().toString();
						$e.attr("_xid", key);
					}
				}
			}
			return key;
		},

		_getComponentDefered : function(xidOrNode) {
			var key = this._getComponentDeferedKey(xidOrNode);
			var result = this.__componentDefereds[key];
			if (!result) {
				result = $.Deferred();
				this.__componentDefereds[key] = result;
				// 如果xidOrNode是null, undefined, ""时, 直接结束promise
				if (!xidOrNode)
					result.resolve(xidOrNode);
			}
			return result;
		},

		registerComponent : function(xid, component) {
			// 只有data组件需要调用addComponent
			this.__components[xid] = component;
		},

		unRegisterComponent : function(xid) {
			this._disposeComponent(xid);
			delete this.__components[xid];
		},

		getComponent : function(xid, sourceNode) {
			if (typeof (xid) === "string") {
				// 优先找this.__components中的data组件
				if (this.__components[xid]) {
					return this.__components[xid];
				} else if (sourceNode) {
					return this.getComponentInRange(xid, sourceNode);
					/*
					var componentContext = this._getComponentContext(sourceNode);
					return this.getComponentByContext(xid, componentContext);
					*/
				} else {
					return this._getViewComponentByXid(xid);
				}
			} else {
				// 如果是节点，直接返回节点关联的组件
				return Component.getComponent(xid);
			}
		},
		
		getComponentInRange: function(xid, sourceNode){
			var $sourceNode = $(sourceNode);
			//忽略compose内的元素
			if (Component.BLOCK_CONTEXT === $sourceNode.attr(Component.CONTEXT_ATTR_NAME)){
				return null;
			}
			var children = $sourceNode.children();
			for ( var i = 0; i < children.length; i++) {
				var child = $(children[i]);
				if (xid === child.attr("xid")){
					return Component.getComponent(children[i]);
				}else{
					var result = this.getComponentInRange(xid, children[i]);
					if (result)
						return result;
				}
			}
			return null;
		},

		/**
		 * @param xid
		 * @param componentContext:
		 *            结构类似{node: xx, id: xx},
		 *            其中id只会在foreach中出现，表示一行的唯一标识，即Component.INLINE_ID_ATTR_NAME
		 *            在foreach中，每一行的第一级节点会有一个Component.INLINE_ID_ATTR_NAME属性，用来标识一行
		 * @returns
		 */
		getComponentByContext : function(xid, componentContext) {
			if (this.__components[xid]) {
				return this.__components[xid];
			} else {
				if (componentContext && componentContext.node && componentContext.node.nodeType) {
					var founds = [];
					while (true) {
						if (componentContext) {
							if ($(componentContext.node).attr(Component.CONTEXT_ATTR_NAME) === Component.BLOCK_CONTEXT) {
								return this._getViewComponentByXid(xid);
							} else {
								var result = this._getComponent(xid, componentContext, founds);
								if (result)
									return result;
							}
						} else {
							return null;
						}
						componentContext = this._getComponentContext(componentContext.node);
					}

					return null;
				} else {
					return this._getViewComponentByXid(xid);
				}
			}
		},

		_getViewComponentByXid : function(xid) {
			var e = this.getElementByXid(xid);
			if (e) {
				return Component.getComponent(e);
			} else {
				return null;
			}
		},

		_getComponent : function(xid, componentContext, founds) {
			if (founds[componentContext.node]) {
				return null;
			}

			var parent = $(componentContext.node);
			var children = parent.children();
			for ( var i = 0; i < children.length; i++) {
				var child = $(children[i]);

				// 忽略不是所在行的节点，
				if (componentContext.inlineId && (child.attr(Component.INLINE_ID_ATTR_NAME) !== componentContext.inlineId)) {
					continue;
				}

				var context = child.attr(Component.CONTEXT_ATTR_NAME);
				// 忽略节点生成的私有节点
				if (context !== Component.PRIVATE_CONTEXT) {
					if (child.attr("xid") === xid) {
						return Component.getComponent(child[0]);
					}
				}

				// 忽略被compose的内容
				if (context !== Component.BLOCK_CONTEXT) {
					var result = this._getComponent(xid, {
						node : child[0]
					}, founds);
					if (result) {
						return result;
					}
				}
			}

			founds[founds.length] = componentContext.node;

			return null;
		},

		_getComponentContext : function(element) {
			if (!element)
				return null;

			var elementObj = $(element);
			if (elementObj.attr(Component.CONTEXT_ATTR_NAME) === Component.BLOCK_CONTEXT) {
				return null;
			}

			var parentObj = elementObj.parent();
			if (parentObj) {
				var contextAttr = parentObj.attr(Component.CONTEXT_ATTR_NAME);
				if (contextAttr === Component.INLINE_CONTEXT) {
					return {
						node : parentObj[0],
						inlineId : elementObj.attr(Component.INLINE_ID_ATTR_NAME)
					};

				} else if (contextAttr === Component.BLOCK_CONTEXT) {
					return {
						node : parentObj[0],
						id : null
					};
				} else {
					return this._getComponentContext(parentObj[0]);
				}
			} else {
				return null;
			}

		},

		getComponents : function(xid) {
			var result = [];
			if (this.__components[xid])
				result[result.length] = this.__components[xid];

			var elements = this.getElementsByXid(xid);
			for ( var i = 0; i < elements.length; i++) {
				var element = elements[i];
				var component = Component.getComponent(element);
				if (component) {
					result[result.length] = component;
				}
			}

			return result;
		},

		/**
		 * @param xidOrNode:
		 *            xid属性或node节点
		 * @param sourceNode:
		 *            源节点，可选
		 * @returns 说明：如果没有指定source，将在当前的页面（即Window）中查找；
		 *          如果指定了sourceNode，将从sourceNode最近的上下文中查找（不跨出Window）；
		 *          会产生上下文的元素有：compose, foreach. 其中compse产生的上下文件是block;
		 *          foreach产生的上下文件是inline, 在foreach的第一级子节点上, 会生成__inline-id__
		 *          属性, 用来标识同一行的内容; 查找的过程中, 忽略上下文为private的节点.
		 */
		comp : function(xidOrNode, sourceNode) {
			var ret = this.getComponent(xidOrNode, sourceNode);
			return ret;
		},

		comps : function(xid) {
			return this.getComponents(xid);
		},

		getIDByXID : function(xid) {
			if (xid) {
				return this.getContextID() + "_" + xid;
			} else {
				return null;
			}
		},

		getElementByXid : function(xid) {
			var id = this.getIDByXID(xid);
			if (id) {
				try{
					var items = $("#" + id);
					if (items.length > 0) {
						return items[0];
					} else {
						return null;
					}
				}catch(e){
					return null;
				}
			} else {
				return null;
			}
		},

		getElementsByXid : function(xid) {
			var id = this.getIDByXID(xid);
			if (id) {
				return $("*[id='" + id + "']");
			} else {
				return [];
			}
		},

		removeElement : function(e) {
			if (e) {
				bind.removeNode(e);
			}
		},

		removeElementByXid : function(xid) {
			var e = this.getElementByXid(xid);
			this.removeElement(e);
		},

		getContextID : function() {
			return this.__id;
		},
		getContext : function() {
			return this.__context;
		},
		postMessage : function(message) {
			this.fireEvent(Model.MESSAGE_EVENT, {
				source : this,
				message : message
			});
		},
		
		addComponent : function(parentElement, component, targetElement) {
			bind.addComponent(parentElement, component, targetElement);
		},

		removeComponent : function(component) {
			if (component && component.domNode) {
				bind.removeNode(component.domNode);
			}
		},
		
		addNode: function(parentElement, element, targetElement){
			bind.addNode(parentElement, element, targetElement);
		},
		
		addNodes: function(parentElement, elements, targetElement){
			bind.addNodes(parentElement, elements, targetElement);
		},
		
		removeNode: function(node){
			bind.removeNode(node);
		},
		
		getConfig: function(){
			if(!this.__cfg){
				this.__cfg = {};
				$.extend(this.__cfg,this._appCfg_,this._wCfg_);
			}
			return this.__cfg;
		},
		
		getAppkey: function(){
			/*
			var cfg = this.getConfig();
			return cfg['appkey'];
			*/
			//使用域名分析租户
			var host = window.location.host;
			var ipos = host.indexOf(".");
			if(ipos>0){
				var subdomain = host.substring(0, ipos);
				//var ext = subdomain.substring(subdomain.length-4);
				//if("-ide"===ext || "-app"===ext) subdomain = subdomain.substring(0,subdomain.length-4);
				return subdomain;
			}
		}
	});
	Model.PARAMS_RECEIVE_EVENT = "onParamsReceive";
	Model.ACTIVE_EVENT = "onActive";
	Model.INACTIVE_EVENT = "onInactive";
	Model.MESSAGE_EVENT = "onMessage";
	Model.MODEL_CONSTRUCT_EVENT = "onModelConstruct";
	Model.MODEL_CONSTRUCTING_EVENT = "onModelConstructing";
	Model.MODEL_CONSTRUCT_DONE_EVENT = "onModelConstructDone";
	Model.MODEL_CONSTRUCTED_EVENT = "onModelConstructed";
	Model.LOAD_EVENT = "onLoad";
	Model.LOADED_EVENT = "onLoaded";
	Model.UNLOAD_EVENT = "onunLoad";

	Model.MODEL_STATUS_CONSTRUCT = 1;
	Model.MODEL_STATUS_CONSTRUCTING = 2;
	Model.MODEL_STATUS_CONSTRUCT_DONE = 3;
	Model.MODEL_STATUS_LOAD = 4;
	Model.MODEL_STATUS_CONSTRUCTED = 5;
	
	return Model;
});