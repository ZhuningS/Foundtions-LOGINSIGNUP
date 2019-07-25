/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
define(function(require) {
	var bind = require("bind");
	var ViewComponent = require("./viewComponent");
	var Object = require("./object");

	var BindComponent = ViewComponent.extend({
		constructor : function(config) {
			this.disabled = false;
			this.refDisabled = false;
			this.callParent(config);
		},		// 继承类实现
		doInit : function(value, bindingContext, allBindings) {
		},
		render : function() {
			this.needRender = false;
		},
		isDisabled: function(){
			return this.disabled || this.refDisabled;
		},
		dispose : function() {
			if(this._subscribeReadOnlyHandle)this._subscribeReadOnlyHandle.dispose();
			if(this._subscribeValidationHandle)this._subscribeValidationHandle.dispose();
			this.callParent();
		},
		val2ref : function() {// 将组件数据写回到ref
			if (bind.isObservable(this.ref)) {
				var v = 'function' != typeof (this.val) ? this.get('value') : this.val();
				this._val2ref(this.ref, v);
			}
		},
		_val2ref : function(ref, v) {// 将数据写回到ref
			if (bind.isObservable(ref))
				ref.set(v);
		},
		// 初始化
		init : function(value, bindingContext, allBindings) {
			this.callParent(value, bindingContext, allBindings);
			//处理bind-value同步到组件的value
			if(this.hasOwnProperty('value') && allBindings && allBindings.has('value')){
				var v = allBindings.get('value');
				this.value = v;
				var self = this;
				this.$domNode.on('koUpdateValue',function(){
					self.value = self.$domNode.val();
				});
			}
			var oldRef = this.ref;
			if(value && value.ref instanceof BindComponent.NullValue){
				this.set({refDisabled : true});
			}
			this.ref = value && !(value.ref instanceof BindComponent.NullValue) ? value.ref : null;
			var ret = this.doInit(value, bindingContext, allBindings);
			this.doUpdate(value, bindingContext, allBindings);
			//需要放着doUpdate之后
			if(oldRef!==this.ref){
				this._subscribeReadOnly(this.ref);
				this._subscribeValidation(this.ref);
			}
			this._inited = true;
			this.render();
			return ret;
		},
		update : function(value, bindingContext, allBindings) {
			var oldRef = this.ref;
			if(value && value.ref instanceof BindComponent.NullValue){
				this.set({refDisabled : true});
			}
			this.ref = value && !(value.ref instanceof BindComponent.NullValue) ? value.ref : null;
			this.doUpdate(value, bindingContext, allBindings);
			//需要放着doUpdate之后
			if(oldRef!==this.ref){
				this._subscribeReadOnly(this.ref);
				this._subscribeValidation(this.ref);
			}
			this.callParent(value, bindingContext, allBindings);
		},
		// 完成组件的数据及状态感知更新，默认实现数据、只读、约束更新，其他内容可以在组件中扩展
		doUpdate : function(value, bindingContext, allBindings) {
			if (value && value.hasOwnProperty('ref')) {
				this.updateValue(value.ref);// 数据更新
				this.updateReadonly(value.ref);// 只读状态更新
				this.updateValidation(value.ref);// 约束状态更新
			}
		},
		_subscribeReadOnly: function(ref){
			if(this._subscribeReadOnlyHandle)this._subscribeReadOnlyHandle.dispose();
			if(bind.isObservable(ref) && ref.readonly && bind.isObservable(ref.readonly.computed)){
				var me = this;
				this._subscribeReadOnlyHandle = ref.readonly.computed.subscribe(function(){
					me.updateReadonly(ref);
				});
			}
		},
		_subscribeValidation: function(ref){
			if(this._subscribeValidationHandle)this._subscribeValidationHandle.dispose();
			if(bind.isObservable(ref) && bind.isObservable(ref.isValid)){
				var me = this;
				this._subscribeValidationHandle = ref.isValid.subscribe(function(){
					me.updateValidation(ref);
				});
			}
		},
		updateValue : function(ref) {
			var v = bind.isObservable(ref) ? ref.get() : (ref instanceof BindComponent.NullValue?"":ref);
			if ('function' != typeof (this.val))
				this.set({
					value : v
				});
			else
				this.val(v);
		},
		updateValidation : function(ref) {
			if (!bind.isObservable(ref) || !ref.isValid || !ref.isModified)
				return;
			var isModified = ref.isModified.get(), isValid = ref.isValid.get();

			var func = (isModified ? !isValid : false) ? 'addClass' : 'removeClass';
			this.$domNode[func]('has-error');

			var title = this.$domNode.attr('data-orig-title');
			if (null === title)
				title = this.$domNode.attr('title');
			this.$domNode.attr('title', isValid ? title : ref.error.get()).attr('data-orig-title', isValid ? null : title);
		},
		updateReadonly : function(ref) {
			if (bind.isObservable(ref) && ref.readonly && 'function' === typeof (ref.readonly.readonlyFN)) {
				// 进行只读运算
				if (!ref.readonly.used) {
					// 创建只读计算
					ref.readonly.computed = bind.computed(function() {
						var fn = ref.readonly.readonlyFN;
						return fn.call(ref.readonly.ctx.caller, ref.readonly.readonlyDef, ref.readonly.ctx);// 运算只读
					});
					ref.readonly.used = true;
				}
				var readonly = ref.readonly.computed.get();
				this.set({
					refDisabled : readonly
				});
			}
		},
		disabledRender: function(){
			if(this.$domNode)this.$domNode.attr('disabled', this.isDisabled());
		},
		propertyChangedHandler : function(key, oldVal, value) {
			if (this.$domNode){
				if(key==='disabled' || key==='refDisabled') this.disabledRender();
				else this.$domNode.attr(key, value);
			}
		},// 默认直接写dom属性
		set : function(name,value) {
			if (name) {
				this.callParent(name,value);
				if (this.needRender)
					this.render();
			}
		}
	});

	BindComponent.NullValue = Object.extend({
		toString : function() {
			return '';
		}
	});

	return BindComponent;
});