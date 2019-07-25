/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
define(function(require) {
	require("$UI/system/resources/system.res");
	var Component = require("./component");
	var Util = require("./util");
	var Object = require("./object");
	var Message = require("./message");
	var _Error = require("./error");
	var $ = require("jquery");
	var bind = require("bind");
	var BIND_PREFIX = "bind-";
	var BIND_ATTR_PREFIX = "bind-attr-";
	var EVENT_NAME = "data-events";
	var BIND_NAME = "data-bind";
	//var BIND_READY = "bindReady";
	var BIND_EVENTS = ["bind-click", "bind-dbclick", "bind-dblclick", "bind-focus", "bind-blur", "bind-select", "bind-mousedown", "bind-mouseup",
			"bind-mouseover", "bind-mousemove", "bind-mouseout", "bind-mouseenter", "bind-mouseleave", "bind-keydown", "bind-keyup", "bind-keypress",
			"bind-touchstart", "bind-touchmove", "bind-touchend", "bind-abort", "bind-error", "bind-change", "bind-reset", "bind-resize",
			"bind-submit" , "bind-load", "bind-unload"];

	var ViewComponent = Component.extend({
		/**
		 * @param config
		 *            参数格式 { parentNode: xx, prop1: value1 }
		 */
		constructor : function(config) {
			this.__eventOperation__ = {};// 存放事件的操作
			this.__events = {};
			this.callParent(config);
		},
		
		getXid : function(){
			if (this.domNode){
				return this.domNode.getAttribute("xid");
			}else{
				return null;
			}
		},

		constructed : function(config) {
			this.callParent();
			// 将组件添加到节点上时，统一做bind数据绑定
			if (config && config.templateNode) {
				this._bind(config.templateNode);
			} else {
				config = config || {};
				var template = this.buildTemplate(config);
				if (!!template) {
					var element = $(template)[0];
					this._bind(element);

					// TODO 只处理了events和binds，按合理的角度，还要处理properties;
					// 出于性能优化的考虑, 要求组件开发者在buildTemplate中处理properties
					this._processEvents(config);
					this._processComponentBind(config);
					this._processBind(element, config);
					if (config.parentNode)
						Component.addComponent(config.parentNode, this);
				}
			}
		},

		getDataByExpr : function(expr){
			var $$__data__$$ = this.getModel().comp(expr);
			if($$__data__$$) return $$__data__$$;
			try{
				//增加支持data是表达式
				var ctx = bind.contextFor(this.domNode);
				/*jshint -W085 */
				with (this.getModel()) {
				/*jshint +W085 */
					/*jshint -W085 */
					with (ctx) {
					/*jshint +W085 */
						$$__data__$$ = eval('(' + expr + ')');//特殊写法，避免变量被覆盖，所以使用怪异的变量名
					}
				}
				return $$__data__$$;
			}catch(e){
				return null;
			}
		},

		_getComponentBinds : function() {
			var cfg = this.getConfig() || {};
			return cfg.binds || {};
		},

		_processComponentBind : function(config) {
			config = config || {};
			var e = $(this.domNode);
			var component = e.attr(Component.COMPONENT_ATTR_NAME);
			if (component) {
				var binds = "component:{name:'" + component + "'";
				var items = this._getComponentBinds();
				for ( var prop in items) {
					if (items.hasOwnProperty(prop)){
						if (config[prop]) {
							if (binds)
								binds += ",";
							binds += items[prop] + ":" + config[prop];
						}
					}
				}

				binds += "}";

				var oldBinds = e.attr(BIND_NAME);
				if (oldBinds)
					binds = oldBinds + "," + binds;
				e.attr(BIND_NAME, binds);
			}
		},

		_getEvents : function() {
			var cfg = this.getConfig() || {};
			return cfg.events || [];
		},

		_processEvents : function(config) {
			if (!config)
				return;
			var events = this._getEvents();
			if (Util.isArray(events)) {
				for ( var i = 0; i < events.length; i++) {
					if (config[events[i]]) {
						this.__events[events[i]] = config[events[i]];
					}
				}
			}
		},

		_getStandardBinds : function(node, config) {
			var result = {};
			var $node = $(node);
			var attrs = node.attributes;
			for ( var i = 0; i < attrs.length; i++) {
				var name = attrs[i].name;
				var value = attrs[i].value;
				if (name.indexOf(BIND_PREFIX) === 0) {
					result[name] = value;
					$node.removeAttr();
				}
			}

			config = config || {};
			var binds = (this.getConfig() || {}).binds || {};
			for ( var key in config) {
				if (config.hasOwnProperty(key)){
					if ((key.indexOf(BIND_PREFIX) === 0) && !(key in binds)) {
						result[key] = config[key];
					}
				}
			}

			return result;
		},

		_processEventValue : function(value) {
			if (value && (value.indexOf(".") == -1) && (value.indexOf("(") == -1)) {
				return "$model._callModelFn.bind($model, '" + value + "')";
			}if(value && value.indexOf("{") === 0){//支持动态创建时也支持操作bind
				return "$model._callModelFn.bind($model, " + value + ")";
			} else {
				return value;
			}
		},

		_processBind : function(template, config) {
			if (template.nodeType != 1)
				return;
			var e = $(template);

			var localname = "";
			var binds = "";
			var attrBinds = "";
			var eventBinds = "";
			var items = this._getStandardBinds(template, config);
			for ( var name in items) {
				if (items.hasOwnProperty(name)){
					var value = items[name];
					if (BIND_EVENTS.indexOf(name) != -1) {
						localname = name.substring(BIND_PREFIX.length);
						if (eventBinds)
							eventBinds += ",";
						eventBinds += localname + ":" + this._processEventValue(value);

					} else if (name.indexOf(BIND_ATTR_PREFIX) === 0) {
						localname = name.substring(BIND_ATTR_PREFIX.length);
						if (attrBinds)
							attrBinds += ",";
						attrBinds += localname + ":" + value;

					} else {
						localname = name.substring(BIND_PREFIX.length);
						if (binds)
							binds += ",";
						binds += localname + ":" + value;
					}
				}
			}

			if (attrBinds) {
				if (binds)
					binds += ",";
				binds += "attr:{" + attrBinds + "}";
			}

			if (eventBinds) {
				if (binds)
					binds += ",";
				binds += "event:{" + eventBinds + "}";
			}

			if (binds) {
				var oldBinds = e.attr(BIND_NAME);
				if (oldBinds)
					binds = oldBinds + "," + binds;
				e.attr(BIND_NAME, binds);
			}

			var children = e.children();
			for ( var i = 0; i < children.length; i++) {
				this._processBind(children[i]);
			}
		},

		setCSS : function(css) {
			this.$domNode.css(css);
		},
		addClass : function(cls) {
			this.$domNode.addClass(cls);
		},
		toggleClass : function(cls) {
			this.$domNode.toggleClass(cls);
		},
		removeClass : function(cls) {
			this.$domNode.removeClass(cls);
		},
		fireEvent : function(name, evt) {// 重新实现，增加bindingContext
			if (evt && this.domNode && !evt.hasOwnProperty('bindingContext'))
				evt['bindingContext'] = bind.contextFor(this.domNode);
			return this.callParent(name, evt);
		},
		free : function(){
			if (this.domNode){
				bind.removeNode(this.domNode);
			}
		},

		dispose : function() {
			if (this.domNode) {
				if (this.getModel())
					this.getModel()._disposeComponent(this.domNode);
				bind.utils.domData.set(this.domNode, Component.BIND_NAME, null);
				this.domNode = null;
				this.$domNode = null;
			}
			this.callParent();
		},
		inited : function() {
			this.getModel().resolvedComponent(this.domNode);
		},
		/* abstract */
		buildTemplate : function(config) {
		},
		init : function(value, bindingContext) {
			var cfg = this.$domNode.data('config');
			if (cfg)
				this.set(cfg);
			var viewModel = this.getModel();
			var events = $(this.domNode).attr(EVENT_NAME);
			if (typeof (events) == "string") {
				var items = events.split(";");
				for ( var i = 0; i < items.length; i++) {
					var item = items[i];
					if (item !== "") {
						var index = item.indexOf(":");
						if (index != -1) {
							var event = item.substring(0, index);
							var fnName = item.substring(index + 1);
							this.on(event, fnName, viewModel);
						} else {
							var msg = new Message(Message.JUSTEP230065, events);
							throw _Error.create(msg);
						}
					}
				}
			}

			for ( var prop in this.__events) {
				if (this.__events.hasOwnProperty(prop)){
					this.on(prop, this.__events[prop], viewModel);
				}
			}

			delete this.__events;
		},
		update : function(value, bindingContext) {
			if (!value)
				return;

			var values = {};
			var name = null;
			for (name in value){
				if (value.hasOwnProperty(name)){
					values[name] = bind.utils.unwrapObservable(value[name]);	
				}
			}
				

			if (!this._oldValues) {
				this._oldValues = values;
				return;
			}

			for (name in values) {
				if (values.hasOwnProperty(name)){
					var oldValue = this._oldValues[name];
					var newValue = values[name];
					if (newValue !== oldValue) {
						var event = {
							name : name,
							value : newValue,
							oldValue : oldValue,
							allValue : values,
							oldAllValue : this._oldValues,
							source: this
						};
						this.fireEvent(ViewComponent.DATA_CHANGED, event);
						this._oldValues[name] = newValue;
					}
				}
			}

			this._oldValues = values;
		},

		controlsDescendantBindings : function() {
			return false;
		},

		getComponentByCompID : function(compId) {
			var element = this.getElementByCompID(compId);
			return Component.getComponent(element);
		},

		getElementByCompID : function(compId) {
			return this._getElementByCompID(this.domNode, compId);
		},

		_getElementByCompID : function(element, compId) {
			var elementObj = $(element);
			if (element !== this.domNode) {
				if (elementObj.attr(Component.COMP_ID) === compId) {
					return element;
				}
			}

			if (!elementObj.attr(Component.COMPONENT_ATTR_NAME)) {
				var children = elementObj.children();
				for ( var i = 0; i < children.length; i++) {
					var child = children[i];
					var result = this._getElementByCompID(child, compId);
					if (result) {
						return result;
					}
				}
			}
			return null;
		},

		hasDisplayFunc: function(){
			return 'function'===typeof(this.getDisplayHtml) || 'function'===typeof(this.getDisplayText); 
		},
		
		_bind : function(element) {
			bind.utils.domData.set(element, Component.BIND_NAME, this);
			this.domNode = element;
			this.$domNode = $(this.domNode);
			bind.utils.domNodeDisposal.addDisposeCallback(element, this.dispose.bind(this));
		}
	});

	var DisplayContext = Object.extend({
		constructor : function(option) {
			//comp:self,type:'grid',colDef:colDef,row:r,extendType:extendTypeObj,editor:,readonly
			this.comp = option.comp;
			this.type = option.type;
			this.colDef = option.colDef;
			this.row = option.row;
			this.extendType = option.extendType;
			this.editor = option.editor;
			this.readonly = option.readonly;
			this.bindRef = option.bindRef;
		},
		getParam : function(name){
			if(this.editor) return this.editor.get(name);
			else if(this.extendType) return this.extendType.getParam(name);
		}
	});
	
	ViewComponent.defaultCreateEditor = function(clz,context){
		if(!context) return;
		var param = {};
		$.extend(param,context.getParam());
		if(context.bindRef) param['bind-ref'] = context.bindRef;
		return new clz(param);
	};
	
	ViewComponent.DisplayContext = DisplayContext;
	ViewComponent.CreateEditorContext = DisplayContext;
	
	ViewComponent.DATA_CHANGED = "onDataChanged";

	return ViewComponent;
});