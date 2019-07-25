/* define(function(require){
	
	return{ */
		/*注册新用户
		 *params 内容：name(用户名),password(密码),email(电子邮箱),type(值为register)。
		 *return ajax对象。
		 */
		var $ = require("jquery");		
		 
		var register = function(params){
			var aa = $.ajax({
				async:true,
				data:params,
				url:'http://120.79.152.58/controller.php',
				dataType:"json",
				type:"post"
			});
			return aa;
		},
		/*验证是否能登录成功
		 *params 内容：name(用户名),password(密码),type(值为login)。
		 *return ajax对象。
		 */
			var login = function(params){
			var aa = $.ajax({
				async:true,
				data:params,
				url:'http://120.79.152.58/controller.php',
				dataType:"json",
				type:"post"
			});
			return aa;
		}
/* 	}
}); */