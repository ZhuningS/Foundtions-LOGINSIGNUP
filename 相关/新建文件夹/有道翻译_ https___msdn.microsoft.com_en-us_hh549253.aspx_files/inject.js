//本地URL路径
var LocalURL = "http://localhost:809/";
var fhzd_timer = null;
fhzd_data.IsAdd = false;//是否添加过屏蔽功能按钮	
fhzd_data.atag_num=0;
fhzd_data.imgtag_num=0;
fhzd_data.quick_filter_interval=null;//循环定时器
fhzd_data.quick_filter_count=-1;//定义循环次数

//判断网页大小,小于960的将不显示出来
var winWidth = 0;
winWidth = document.body.clientWidth;
if (winWidth < 960 || top!=this) 
{
	var oControl=document.getElementById('fhzd_control');
	if(oControl)
		oControl.style.display = 'none';
}


//鼠标移动到图片后交换图片
function MouseOverImage(obj,imgPath)
{
	clearTimeout(fhzd_timer);
	/*var oImg = document.getElementById(obj);
	oImg.setAttribute('src',LocalURL + imgPath);*/
	
}

//关闭功能栏
function CloseThis() {
	var thisURL = document.URL;
	var openUrl = LocalURL + "control.close";
	ExecuteCommand(openUrl);
}
//重新加载自身
function reloadSelf() {
	location.reload();
}
//显示功能栏
function showMenu() {	
	var oAllMenu=document.getElementById('fhzd_all');
	var oMenu = document.getElementById("fhzd_menu");
	var oLogo=document.getElementById('fhzd_Logo');
	

	
	oMenu.style.display='block';
	oAllMenu.style.backgroundColor='#0EAE74';	
	startMove(fhzd_Logo,{opacity:100},null);	
	startMove(fhzd_all,{height:200,left:0},null);
	startMove(fhzd_menu,{opacity:100},null);
	
	clearTimeout(fhzd_timer);
	//dObj.style.display="block";
//	dObj.style.backgroundColor='#0EAE74';
	//noimg
	/*if(String(fhzd_data.no_img) == "1")
	{	
		document.getElementById('li_noimg').style.display='none';
	}*/
}
//隐藏功能栏
function hideMenu() {
	var oAllMenu=document.getElementById('fhzd_all');
	var oLogo=document.getElementById('fhzd_Logo');
	var oMenu = document.getElementById("fhzd_menu");

	startMove(fhzd_all,{height:40,left:90},null);
	startMove(fhzd_menu,{opacity:0},function()
	{
		oMenu.style.display='none';
		oAllMenu.style.backgroundColor='';
		startMove(fhzd_Logo,{opacity:30},null);		
	});
	
	/*fhzd_timer = setTimeout(function()
	{
		var oLogo = document.getElementById('fhzd_Logo');
		oLogo.setAttribute('src',LocalURL + 'img/000.png');
	}
	,100);*/
}
//添加黑名单
function AddToBlack() {
	var thisURL = document.URL;
	var openUrl = LocalURL + "control.black?url=" + thisURL;
	ExecuteCommand(openUrl);
}
//添加白名单功能
function AddToWhite() {
	var thisURL = document.URL;
	var openUrl = LocalURL + "control.white?url=" + thisURL;
	ExecuteCommand(openUrl);
}
//添加到无图名单
function AddToNoImg()
{
	var thisURL = document.URL;
	var openUrl = LocalURL + "control.noimg?url=" + thisURL;
	ExecuteCommand(openUrl);	
}
//清空cookie
function ClearCookie()
{
	var expires=new Date();
	expires.setTime(expires.getTime()-1000);

	document.cookie='expires='+	expires.toGMTString();
}

//执行命令
function ExecuteCommand(openUrl)
{
	hideMenu();
	var iWidth = 500; //弹出窗口的宽度;
	var iHeight = 160; //弹出窗口的高度;
	var iTop = (window.screen.availHeight - 30 - iHeight) / 2; //获得窗口的垂直位置;
	var iLeft = (window.screen.availWidth - 10 - iWidth) / 2; //获得窗口的水平位置;
	var winObj = window.open(openUrl, "_blank", "resiable=no,location=no,height=" + iHeight + ", width=" + iWidth + ", top=" + iTop + ", left=" + iLeft);
	setTimeout("winObj.close();",3000);
	setTimeout("location.reload();", 1000);	
}

$jf(document).ready(function()
{
	//显示功能栏目
	var oMenu=document.getElementById('fhzd_all');
	if(oMenu)
		oMenu.style.display='block';
	var t = fhzd_data;
	
	//用户手工屏蔽图片功能			
	var ManualNonePicture = (function() {
	var t = fhzd_data;
	if (fhzd_data.manual_nonepic != "1") {
				return;
			}
		
	//var a = "<a href='#' class='ManualNonePicture' ><img class='ManualNonePicture'  src='http://localhost:809/img/jb.jpg' width='20px' height='20px' /></a>";
	var a = "<div class='ManualNonePicture' id='ImageFilter' title='屏蔽该图片' style='margin: 0px; border: 0px solid #FF0; cursor: pointer; position: absolute; text-align: center; line-height: 20px; width: 35px; height: 20px; background-color: #090; font-size: 14px; color: white; font-weight: bold; font-family: '宋体'; z-index: 99999;' >×</div>"
	
	var addA = function(el) {
		if (el instanceof $jf) {
			if(t.IsAdd)return;
			t.IsAdd = true;

			var x = el.position().left,	
			y = el.position().top;
			var ImageWidth = el.css('width');
			
			var Width = parseInt(ImageWidth);
			Width +=parseInt(x);
			Width -= 34;
			currentA = $jf(a).css({
				'position': 'absolute',
				'left': Width,
				'top': y ,
				'width':35,
				'height':20,
				'z-index':99999
			}).insertAfter(el).data('src', el.attr('src'));
		}
	};
	
	//改变屏蔽按钮背景颜色
	$jf("body").on("mouseenter",".ManualNonePicture",
	function()
	{
		var oDiv = document.getElementById('ImageFilter');
		oDiv.style.backgroundColor ='red';
	});
	//恢复背景颜色
	$jf("body").on("mouseout",".ManualNonePicture",
	function()
	{
		var oDiv = document.getElementById('ImageFilter');
		oDiv.style.backgroundColor='#090';
	});

	$jf("body").on("mouseenter", "img",
	function() {
		var width = $jf(this).width();
		var height = $jf(this).height();

		if (width <= 60 || height <= 60 || $jf(this).attr("src").indexOf("localhost") != -1) {
			return;
		}

		addA($jf(this));			

	}).on("mouseout", "img",
	function(e) {
		if ((!$jf(e.toElement).hasClass('ManualNonePicture'))) {
			$jf('.ManualNonePicture').remove();
			t.IsAdd = false;
		}
	});

	$jf('body').on('click', '.ManualNonePicture',
	function(e) {
		e.preventDefault();
		var This = $jf(this);

		var srcToReport = null;
		srcToReport = This.data('src');
		
		if(srcToReport == null)return;
		
		$jf('img[src="' + srcToReport + '"]').attr('src', 'http://localhost:809/img/dot.jpg');
		
		
		if (String(srcToReport).indexOf("//") == 0) 
		{
			srcToReport = "http:" + srcToReport;
		}		
		else if (String(srcToReport).indexOf("/") == 0) 
		{
			//http://www.fenglaishop.com/themes/default/Shangjia/statics/images/loginimg_03.png
			var thisURL = window.location.host;

			srcToReport = "http://" + thisURL + srcToReport;
		}
		
		$jf.ajax({
				url: 'http://localhost:809/control.filterimage',
				type: 'GET',
				data: {
					url: srcToReport
				},
				dataType: 'html',
				success: function(data) {}
			});
		setTimeout("location.reload();", 300);	
	});
})();

//无图模式
fhzd_data.none_picture_mode = function()
{
	var t = this;
	//检测是否开启了无图模式
	if(String(t.no_img) != "1")
	{						
		return;
	}
	var imglist = $jf("img");
	if (imglist && imglist.length > 0) {
		var len = imglist.length;
		
		
		if(len!=t.imgtag_num)
		{
			t.imgtag_num=len;
			
			for (var i = 0; i < len; i++) 
			{
				var img = $jf(imglist[i]);
				var imgTxt = String(img.attr("alt"));
				
				if(String(img.attr('fhzd_has_checked')) != 'true')
				{
					if(String(img.attr('src')).indexOf('http://localhost') == -1)
					{
						//添加检测过的标记
						img.attr('fhzd_has_checked','true');					
						//隐藏图片
						img.css({"visibility":"hidden"});		
					}
				}		
			}
				
		}
	}
}


fhzd_data.do_filter = function() {
	var t = this;
	t.quick_filter_count++;

	if(t.quick_filter_count==3)
	{
		clearInterval(t.quick_filter_interval);
		//获得DOM后，连续快速过滤5次，然后改为每5秒过滤一次
		t.quick_filter_interval=setInterval(function() {
			t.do_filter();			
		},
		5000);
	}
	//执行无图模式过滤
	t.none_picture_mode();
}
//执行操作
t.quick_filter_interval = setInterval(function()
										{
											t.do_filter();
										},10);
		
});


