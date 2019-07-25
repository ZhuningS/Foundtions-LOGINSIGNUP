<?php
var_dump($_GET);
$user = $_GET['user'];
$pwd = $_GET['pwd'];
$tel = $_GET['tel'];
$email = $_GET['email'];
$msg = '';
header('Content-type:text/html;charset=utf8');
  $adders = "mysql:host=localhost;dbname=Users;";
  $db = new PDO($adders,"root");
  $db->exec('set names utf8');
  //链接数据库,创建表
  $result = $db->exec('create table if not exists ajaxreg(user varchar(100) 
     primary key,pwd varchar(100),tel varchar(30),email varchar(30)) 
     default charset=utf8');
  $resulttel = $db->query("select tel from ajaxreg ");
  $resulttel->setFetchMode(PDO::FETCH_ASSOC);
  $arr = $resulttel->fetchAll();
  
  foreach($arr as $ar){
    if( $ar['tel'] == $tel){
      $msg = "您输入的手机号已经存在";
     echo $msg;
    //如果手机号已存在,终止整个程序
    die();
    }
  }
     //如果手机号不存在执行下面代码
     $result = $db->exec("insert into ajaxreg values(
     '$user','$pwd','$tel','$email')");
     if($result){
      $msg = "注册成功";
     }else{
     $msg = "用户名已存在";
     }
  echo $msg;
 $db->close();
?>