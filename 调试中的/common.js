
define(function(require){
	var $ = require("./jquery-3.3.1.min.js");
	return{
		/*注册新用户
		 *params 内容：name(用户名),password(密码),email(电子邮箱),type(值为register)。
		 *return ajax对象。
		*/
		register:function(params){
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
		login:function(params){
			var aa = $.ajax({
				async:true,
				data:params,
				url:'http://120.79.152.58/controller.php',
				dataType:"json",
				type:"post"
			});
			return aa;
		}
	}
});
/*
<script src="./jquery-3.3.1.min.js">
	function login(params){
			var aa = JQuery.ajax({
				async:true,
				data:params,
				url:'http://120.79.152.58/controller.php',
				dataType:"json",
				type:"post"
			});
			return aa;
		}
</script>*/
