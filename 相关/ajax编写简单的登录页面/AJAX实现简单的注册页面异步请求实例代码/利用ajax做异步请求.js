if(booluser && boolpwd && boolpwd1 && booltel && boolemail){        
        $.ajax({
          type:"get",
          
          url:"reg.php",
          async:true,
          data:{
 
            user:$('#data input')[0].value,
            pwd:$('#data input')[1].value,
            tel:$('#data input')[3].value,
            email:$('#data input')[4].value
          },
          success : function(data){
            console.log(data);
          }
        });
      }
      })
