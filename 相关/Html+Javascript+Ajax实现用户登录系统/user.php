<?php  
    $mysql_server_name="localhost"; //数据库服务器名称  
    $mysql_username="root"; // 连接数据库用户名  
    $mysql_password="326699"; // 连接数据库密码  
    $mysql_database="hello"; // 数据库的名字  
      
     // 连接到数据库  
    $conn=mysql_connect($mysql_server_name, $mysql_username,  
                        $mysql_password);  
    if(!$conn) {  
        echo "数据库连接失败！".mysql_error;  
    }  
    mysql_select_db($mysql_database, $conn);  
      
    //获取url参数  
    $action = isset($_POST['action']) ? $_POST['action'] : '';  
    $name = isset($_POST['name']) ? $_POST['name'] : '';  
    $psd = isset($_POST['psd']) ? $_POST['psd'] : '';  
      
    if($action=='login') {  
        login($name, $psd, true);  
    } else if($action=='register') {  
        register($name, $psd);  
    } else if($action=='modifyPsd') {  
        modifyPsd($name, $psd);  
    } else if($action=='showAll') {  
        showAll();  
    } else {  
        $result = array("result"=>"error_request");  
        $json = json_encode($result);  
        echo $json;  
    }  
      
    close_conn();  
      
    /*用户登录*/  
    function login($name, $psd, $normal) {  
        global $conn;  
          
        if($conn) {  
            $result = mysql_query("select name,psd from student");  
            $success = false;  
            while($row = mysql_fetch_array($result)) {  
                if($name == $row['name'] && $psd == $row['psd']) {  
                    $success = true;  
                }  
            }  
            if($normal) {  
                $login_result = array('login_result'=>$success);  
                $json = json_encode($login_result);  
                echo $json;  
            }  
        }  
        return $success;  
    }  
      
    /*用户注册*/  
    function register($name, $psd) {  
        $tel = $_POST['tel'];         
        global $conn;  
          
        if($conn) {  
            //数据库查询  
            $result = mysql_query("select name from student");  
            $exist = false;  
            while($row = mysql_fetch_array($result)) {  
                if($name == $row['name']) {  
                    //注册失败，用户名已存在;  
                    $exist = true;  
                    $register_result = array("register_result"=>false,"error_code"=>0);  
                    $json = json_encode($register_result);  
                    echo $json;  
                }  
            }  
              
            //插入数据库           
            if(!$exist) {  
                $id = mysql_num_rows($result) + 1;  
                $success = mysql_query("insert into student values('$id', '$name', '$tel', '$psd')");  
                if($success) {  
                    //注册成功  
                    $register_result = array("register_result"=>$success);  
                    $json = json_encode($register_result);  
                    echo $json;  
                } else {  
                    //注册失败，数据库插入错误  
                    $register_result = array("register_result"=>$success,"error_code"=>1);  
                    $json = json_encode($register_result);  
                    echo $json;  
                }  
            }             
        }  
    }  
      
    /*修改登录密码*/  
    function modifyPsd($name, $psd) {  
        $newpsd = $_POST['newpsd'];  
        global $conn;  
          
        if($conn) {  
            //用户登录  
            $login_result = login($name, $psd, false);  
            //修改密码  
            if($login_result) {  
                $success = mysql_query("update student set psd='$newpsd' where name='$name'");  
                if($success) {  
                    //修改成功  
                    $modify_result = array("modify_result"=>$success);  
                    $json = json_encode($modify_result);  
                    echo $json;  
                } else {  
                    //修改失败，数据库错误  
                    $modify_result = array("modify_result"=>$success,"error_code"=>1);  
                    $json = json_encode($modify_result);  
                    echo $json;  
                }  
            } else {  
                    //修改失败，登录失败  
                    $modify_result = array("modify_result"=>false,"error_code"=>2);  
                    $json = json_encode($modify_result);  
                    echo $json;  
            }  
        }  
    }  
      
    //显示所有用户  
    function showAll() {  
        global $conn;  
        if($conn) {  
            $result = mysql_query("select * from student");  
            $success = false;  
            $array_data = array();  
  
            $total = mysql_num_rows($result);  
            //$data = array("total"=>$total,"datas"=>array(array("data"=>"123","name"=>"zhugeheng"),  
            //                                                                                   array("data"=>"456","name"=>"zhaodanni")  
            //                                                                      ));  
                                                                                      
            while($row = mysql_fetch_array($result)) {  
                $array_temp = array("name"=>$row['name'], "tel"=>$row['tel']);  
                array_push($array_data, $array_temp);  
            }  
            $data = array("total"=>$total,"datas"=>$array_data, "result"=>true);             
            $json = json_encode($data);  
            echo $json;  
          
        }  
    }  
      
    //关闭连接  
    function close_conn() {  
        global $conn;  
        mysql_close($conn);  
    }  
  
?>  