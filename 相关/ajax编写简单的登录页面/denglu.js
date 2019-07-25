$("#btn").click(function(){
 //第一步：取数据,这里用到了用户名和密码
 var uid=$("#username").val();
 var pwd=$("#password").val();
 //第二步：验证数据，这里需要从数据库调数据，我们就用到了ajax
 $.ajax({
  url:"http://120.79.152.58/controller.php",//请求地址
  data:{uid:username,pwd:password},//提交的数据
  type:"POST",//提交的方式
  dataType:"TEXT", //返回类型 TEXT字符串 JSON XML
  success:function(data){
  //开始之前要去空格，用trim()
   if(data.status==200)
   {
    window.location.href = "http://120.79.152.58";
   }
   else{
    alert("用户名或者密码错误");
   }
  }
 })
 
})