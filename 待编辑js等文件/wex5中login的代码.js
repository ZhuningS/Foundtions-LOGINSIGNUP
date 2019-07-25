define(function(require){
	var $ = require("jquery");
	var justep = require("$UI/system/lib/justep");
	
    var common = require("$UI/login/common");	//引用内部的JS文件
    
	var Model = function(){
		this.callParent();
	};
	
	//图片路径转换
	Model.prototype.toUrl = function(url){
		return url ? require.toUrl(url) : "";
	};
	
		
	
//登录按钮
	Model.prototype.loginBtnClick = function(event){
		
		var name = this.comp("nameInput").val();
		
		var password = $(this.getElementByXid("passwordInput")).val();
		
		if (!name&&!password) {
			justep.Util.hint("请填写完整");	//显示提示信息
		}
		else{
			var login = common.login({name:name,password:password,type:'login'});
			
			//回调，then方法
			login.then(function(data){
				if (data.status==200) {
					justep.Util.hint("登录成功");
				}
				else{
					justep.Util.hint("检查帐号和密码");
				}
			}.bind(this));	//直接调用bind(this)方法,使回调内的作用域，和全局作用域一致
		}
		
		
	};
	
	//跳转到注册界面
	Model.prototype.registerBtnClick = function(event){
		justep.Shell.showPage("sign");
		
	};
	
	return Model;
	
	
	
	
	
});

