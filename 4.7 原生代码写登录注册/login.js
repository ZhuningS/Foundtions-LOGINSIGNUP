function loginBtnClick(){
	var $ = require("jquery");//???bug
	
	/*	var justep = require("./justep.js");*/
	
    var common = require("./common.js");	//引用内部的JS文件
	debugger;
 
/* 
	var MyConstructor = function(){
    this.myNumber = 5;
}

	
	MyConstructor.prototype = {
    myNumber: 5,
    getMyNumber: function(){
        return this.myNumber;
    }
};
*/

	var Model = function(){
		
		this.callParent();	//这里调用callParent , 就是父类的方法 , 返回父类方法中的内容 
	};

			
			
			//！需要重写可以实现对应功能的基本的方法
	
//登录按钮
	Model.prototype.loginBtnClick = function(event){
		
		var name = this.getElementById("username").value();
		
		var password = $(document.getElementById("password")).value();
		
		if (!name&&!password) {
			alert("请填写完整");	//显示提示信息
		}
		else{
			var login = common.login({name:name,password:password,type:'login'});
			
			//回调，then方法
			login.then(function(data){
				if (data.status==200) {
					alert("登录成功");
				}
				else{
					alert("检查帐号和密码");
				}
			}.bind(this));	//直接调用bind(this)方法,使回调内的作用域，和全局作用域一致（bind(this)方法是原生的）
		}
		
		
	};
	
	
	/*
	//跳转到注册界面，显示sign,这里用HTML链接跳转
	Model.prototype.registerBtnClick = function(event){
		
		
	};
	*/
	
	return Model;
	
	
	
	
	
	
};

