$('button').on('click',function(){;
      var booluser = $('#data input')[0].value.length >= 8;
      var   boolpwd = $('#data input')[1].value.length >= 6 ;
      var boolpwd1 = $('#data input')[1].value == $('#data input')[2].value ;
      var retel =/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/g; 
      var booltel = retel.test($('#data input')[3].value);
      var reemail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/g ;
      var boolemail = reemail.test($('#data input')[4].value);
      //这里应该嵌套使if的,但是不是实际开发,这么写便于代码观看
      if(!booluser){
        console.log('user:不能少于8位');
      }
      if(!boolpwd){
        console.log('pwd:不能少于6位');
      }
      if(!boolpwd1){
        console.log('pwd1:两次输入密码不一致');
      }
      if(!booltel){
        console.log('tel:请输入正确的电话号');
      }
      if(!boolemail){
        console.log('email:请输入正确的邮箱格式');
      }