function regBtnClick(require){
	var $ = require("jquery");
	
	/* var justep = require("("./jquery.js");*/

	var common = require("./common.js");	//引用内部的JS文件

	var Model = function(){
		this.callParent();
	};

//注册按钮
	Model.prototype.regBtnClick = function(event){
		var name = document.getElementById("username").value();
		var pwd = document.getElementById("password").value();
		var repwd = document.getElementById("repassword").value();
		var email = document.getElementById("email").value();
		
		if (!name||!pwd||!repwd||!email) {
			alert("请完整填写页面上的信息");//显示提示信息
			return 0;
		}
		else{
			if (pwd!==repwd) {
				alert("两次密码输入不一致");
				return 0;
			}
			var reg = new RegExp("^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$");
			if (!reg.test(email)) {	//reg.test为正则验证，test() 方法用于检测一个字符串是否匹配某个模式.
				alert("邮箱只允许英文字母、数字、下划线、英文句号、以及中划线");
				return 0;
			}
			var register = common.register({name:name,password:pwd,email:email,type:'register'});
			
			//ajax的回调,then方法
			register.then(function(data){
				if (data.status==200) {
					alert("注册成功");
					Response.Write("<script language=\"javascript\">window.opener=null;window.close();</script>");//关闭页面
				}
				else{
					alert("邮箱已存在");
				}
			}.bind(this));	//使回调内的作用域，和全局作用域一致 ,直接引用bind(this)方法
			
		}
		
	};

	return Model;
};