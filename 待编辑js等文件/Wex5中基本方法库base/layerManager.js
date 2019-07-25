define(function(require){
	var $ = require("jquery");
	var Object = require("$UI/system/lib/base/object");
	var Observable = require("$UI/system/lib/base/observable");
	
	var LayerManager = Object.extend({
		mixins:Observable,
		constructor: function(){
			Observable.prototype.constructor.call(this);
		},
		getTopmostLayer:function(){
			var result = {
				topmostElement:document,
				topmostIndex:0
			};
			
			$('[layerIndex]').each(function(index,element){
				var currentIndex = parseInt($(element).attr("layerIndex"));
				var topmostIndex = parseInt($(result.topmostElement).attr("layerIndex") || 0);
				if(currentIndex > topmostIndex){
					result.topmostElement = element;
					result.topmostIndex = currentIndex; 
				}
			});
			return result;
		},
		setLayerIndex:function(element){
			var topmostIndex = this.getTopmostLayer().topmostIndex;
			$(element).attr("layerIndex",topmostIndex+1);
			this.fireEvent('onLayerChange',{
				topmostLayer:this.getTopmostLayer()
			});
		},
		removeLayerIndex:function(element){
			$(element).removeAttr("layerIndex");
			this.fireEvent('onLayerChange',{
				topmostLayer:this.getTopmostLayer()
			});
		}
	});
	return new LayerManager();
});