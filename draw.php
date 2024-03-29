<html lang = "en">
<head>
	<meta charset = "utf-8">
	<meta http-equiv = "X-UA-Compatible" content = "IE=edge">
	<meta name="viewport" content="width=device-width, user-scalable=no" />
	<meta name="mobile-web-app-capable" content="yes" /> 
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">


	<title>3D House - Draw</title>
	<?php include 'detectdevice.php';?>
	<script>var Mobile = <?php echo $Mobile;?>;</script>
	<link href = "css/reset.css" rel = "stylesheet">
	<link href = "css/style.css" rel = "stylesheet">
    <link href = "css/template.css" rel = "stylesheet">
    <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css">
	<script src = "js/scenejs.js"></script>
	<script src = "js/paramanager.js"></script>
	<script src = "js/buildTexture.js"></script>
	<script src = "js/ui_attachinput.js"></script>
	<script src = "js/ui_getModelS.js"></script>
	<script src = "js/ui.js"></script>
	<script src = "js/gesture.js"></script>
    <script src = "js/common.js"></script>
    <script src = "js/layout.js"></script>
    <script src = "js/plugins/lib/jquery-1.8.3.min.js"></script>
    <script src = "js/ModelConverter.js"></script>
    <script src = "js/interact.js"></script>
	<script src = "js/animation.js"></script> 
    <script src = "js/superXReProduction.js"></script>
	<script src = "js/uiedit.js"></script>
	<script src = "js/percent2RGB.js"></script>
	<?php
		include	"HouseXML.php";
		
		$OpenSuccess = false;				//確定有沒有打開成功
		$ErrorStr = "";
		
		if(isset($_GET["XML"]))
		{
			$FileLocation = "./xml/".$_GET["XML"].".xml";
			if(file_exists($FileLocation))
			{
				$XML = new HouseXML();
				$XML->init($FileLocation);
				$OpenSuccess = true;
				//echo "<script src = 'js/setup.js'></script>\n";
			}
			else
				$ErrorStr = "檔案不存在";
		}
		else
			$ErrorStr = "請輸入要讀的XML檔案";
		
		function PrintError($str)
		{
			echo "<h2 style = 'text-align:center'><font color = 'white'>".$str."</font></h2>";
		}
		
	?>
	<?php
		//儲存使用者名稱帳號
		session_start();
		if(isset($_SESSION['account'])){
			$account = $_SESSION['account'];
		}else{
			$account = 'none';
		}
		if(isset($_SESSION['username'])){
			$username = $_SESSION['username'];
		}else{
			$username = 'none';

		}

		
		
		
		
		
	?>
	
	<script type='text/javascript'>		
	    
	//存取登入帳號
		var account = "<?php echo($_SESSION['account']); ?>";
		setAccount(account);
	</script>
		}
	
</head>
<body onresize = "setLayout()" onload = "initial();loadsrc()" onclick = "showstate()" ondblclick = "showstate()">
<i id = "Mode" class="fa fa-eye"></i>
<i id = "ScreenController" class="fa fa-arrows-alt" onclick = "ScreenControll()"></i>	
<div id = "FLOORTAB">
		<ul id = "Tab">
			<li id = "1" onclick = "selectTab('1',true)">1F</li>
			<li id = "0" onclick = "selectTab('0',true)">ROOF</li>
			<li id = "functionkey" onclick = "functionkey()">+</li>
		</ul>
</div>
	
	<div id="codewrapper" style="display: none" >
        <div id="srcbutton">
            <div id="dragsquare" data-draggable="true"></div>
            <p> source </p>
        </div>
        <div id="uiarea">
        	<input type="checkbox" id = "powerEditMode" checked = true>要不要啟動強力編輯模式<br>
			<input type="checkbox" id = "windowMode" checked = true onclick='dirty = true;'>要不要顯示配件<br>
        	<!--<input type="button" onclick="changeRoof('roof/gable')" value = "gable">
        	<input type="button" onclick="changeRoof('roof/hip')" value = "hip">
        	<input type="button" onclick="changeRoof('roof/mansard')" value = "mansard">
			<input type="button" onclick="changeRoof('roof/cross_gable')" value="cross_gable"><br>-->
        </div>            
    </div>
	
	<div id = "SCALECONTROLL">
		<div id = "scaleHControll" class = "H" data-draggable="true"></div>
		<div id = "scaleVControll" class = "V" data-draggable="true"></div>
	</div>

	<script>
	function checkserAgent(){
	var userAgentInfo=navigator.userAgent;
	var userAgentKeywords=new Array("Android", "iPhone" ,"SymbianOS", "Windows Phone", "iPad", "iPod", "MQQBrowser");
	var flag=false;
		if(userAgentInfo.indexOf("Windows NT")==-1){
			flag=true;
		}
	return flag;
	}
	if(checkserAgent()){
	   
	}else{
		document.getElementById("SCALECONTROLL").style.visibility = "hidden";		
	}
	</script>
	
	<div id="DRAGCONTROLL" data-draggable="true">
		<i class="fa fa-arrows" aria-hidden="true"></i>
	</div>
	
    
	<?php
		if($OpenSuccess)
		{
			echo "<canvas id = \"archcanvas\"></canvas>";
			echo $XML->Draw();
		}
		else
			PrintError($ErrorStr);
	?>
<div id = "FUNCBAR">
	<div class = "funcsquare File invisible" onclick = "ExportClick()"><p>Export</p></div>
	<div class = "funcsquare File invisible" onclick = "PreviousClick()"><p>Previous</p></div>
	<div class = "funcsquare File invisible" onclick = "SaveClick()"><p>Save</p></div>
	<div class = "funcsquare File invisible" onclick = "PrintClick()"><p>Print</p></div>
	<div id = "File_close" class = "funcsquare File" onclick = "FuncBarClick(this.className, 'funcsquare edit')"><p id = "File">File</p></div>
	
	<div class = "funcsquare Edit invisible" onclick = "PartClick()"><p>Part</p></div>
	<div id = "Edit_close" class = "funcsquare Edit" onclick = "FuncBarClick(this.className, 'funcsquare file')"><p id = "Edit">Edit</p></div>
</div>

<div id = "EXPORTMENU" class = "invisible">
	<h1>Export File:</h1>
	<HR>
	<h2 onclick = "oneStlButtonFunc()">Export as one .stl</h2>
	<h2 onclick = "multiStlButtonFunc()">Export as multiple .stl</h2>
	<h2 onclick = "oneObjButtonFunc()">Export as one .obj</</h2>
	<h2 onclick = "multiObjButtonFunc()">Export as multiple .obj</h2>
	<h1 style="position:absolute;right:0%;bottom:0%;" onclick = "closeExportMenu()">X</h1>
</div>

<div id = "PREVIOUSMENU" class = "invisible" >
	<h1>Previous House:</h1>
	<HR>
	<select id="XMLSELECT"></select>
	<br><br><br>
	<button type="button" onclick="changeXML()">Select</button>
	<h1 style="position:absolute;right:0%;bottom:0%;" onclick = "closeExportMenu()">X</h1>
</div>

<div id = "PARTBAR" class = "invisible">
	<ul id = "mainPartBar" class = "fixed">
		<li id = "Part0" onclick = "componentClick(this.id)"><img src = "./images/icon-window.png"></li>
		<li id = "Part1" onclick = "componentClick(this.id)"><img src = "./images/icon-door.png"></li>
		<!--<li id = "Part2" onclick = "componentClick(this.id)"><img src = "./images/icon-roof.png"></li>-->
		<li onclick = "addInterWall()"><img src = "./images/icon-wall.png"></li>
		<li onclick = "closePartBar('mainPartBar')"><img name = "ImgClose" src = "./images/icon-close.png" class = "fixed"></li>
	</ul>
	
	<ul id = "subPartBar" class = "fixed invisible" style = "background-color:rgb(247, 202, 24);">
	
		<div id = "SubPart0" style = "display:none;">
			<div class = "main fixed">
				<li class = "SubClose" onclick = "closePartBar('subPartBar')"><img name = "ImgClose" src = "./images/icon-close.png" class = "fixed"></li>
			</div>
		
			<div class = " content fixed">
			</div>
		</div>
		
		<div id = "SubPart1" style = "display:none;">
			<div  class = "main fixed">
				<li class = "SubClose" onclick = "closePartBar('subPartBar')"><img name = "ImgClose" src = "./images/icon-close.png" class = "fixed"></li>
			</div>
		
			<div class = " content fixed">
			</div>
		</div>
		
		<div id = "SubPart2" style = "display:none;">
			<div  class = "main fixed">
				<li class = "SubClose" onclick = "closePartBar('subPartBar')"><img name = "ImgClose" src = "./images/icon-close.png" class = "fixed"></li>
			</div>
		
			<div class = " content fixed">
			</div>
		</div>
		
	</ul>
</div>

<div id = "TRASHCAN" onclick = "deleteTab()"><i class="fa fa-trash-o"></i></div>

<div id = "MODAL" class = "invisible"></div>

	
</body>
</html>
</html>
