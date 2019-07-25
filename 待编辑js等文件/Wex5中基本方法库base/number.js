/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
define(function(require) {
	var _Number = {};
	
	var _numbersAfterPoint = function(arg){
		try{
			return arg.toString().split(".")[1].length;
		}catch(e){
			return 0;
		}	
	};

	_Number.accDiv = function(arg1, arg2){  
		var t1 = _numbersAfterPoint(arg1);  
		var t2 = _numbersAfterPoint(arg2);  
		var r1 = Number(arg1.toString().replace(".", ""));  
		var r2 = Number(arg2.toString().replace(".", "")); 
		return (r1 / r2) * Math.pow(10, t2 - t1);  
	};

	_Number.accMul = function(arg1, arg2){  
		var m = 0;  
		m += _numbersAfterPoint(arg1);  
		m += _numbersAfterPoint(arg2);  
		var r1 = Number(arg1.toString().replace(".", ""));  
		var r2 = Number(arg2.toString().replace(".", "")); 
		return r1 * r2 / Math.pow(10, m);
	};

	_Number.accAdd = function(arg1, arg2){  
		var t1 = _numbersAfterPoint(arg1);  
		var t2 = _numbersAfterPoint(arg2);  
		var m = Math.pow(10, Math.max(t1, t2));  
		return (arg1 * m + arg2 * m) / m; 
	};  

	_Number.accSub = function(arg1, arg2){  
		var t1 = _numbersAfterPoint(arg1);  
		var t2 = _numbersAfterPoint(arg2);  
		var m = Math.pow(10, Math.max(t1, t2));
		var n = (t1 >= t2) ? t1 : t2;
		return parseFloat(((arg1 * m - arg2 * m) / m).toFixed(n));  
	};
	
	return _Number;
});