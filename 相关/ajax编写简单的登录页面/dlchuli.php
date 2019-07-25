<?php
include("DADB.class.php");
$db=new DADB();
$uid=$_POST["uid"];
$pwd=$_POST["pwd"];
$sql="select password from login where username='{$uid}'";
 
$arr=$db->Query($sql);
 
if($arr[0][0]=$pwd && !empty($pwd))
{
 echo"OK";
}
else{
 echo"NO";
}
?>