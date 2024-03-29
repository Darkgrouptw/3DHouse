function showstate()
{
	if(watchmode)
	{
		Mode.className = "fa fa-eye";
	}
	else
	{
		Mode.className = "fa fa-pencil-square-o";
	}
			
}
var fullScreenflag = 0;
function ScreenControll()
{
	fullScreenflag = !fullScreenflag;
	if(fullScreenflag)
	{
		ScreenController.className = "fa fa-compress";
		toggleFullScreen();
	}
	else
	{
		ScreenController.className = "fa fa-arrows-alt";
		toggleFullScreen();
	}
}
function toggleFullScreen()
{
    var doc = window.document;
    var docel = doc.documentElement;

    var requestFullScreen = docel.requestFullscreen || docel.mozRequestFullScreen || docel.webkitRequestFullScreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen;

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement)
    {
        requestFullScreen.call(docel);
    }
    else { cancelFullScreen.call(doc);  }
}
function modifyWall()
{
	var n = getNodeType(pickObjId);
	if(n == null)
		return;
	var type = n.getType();
	type = type.split('/')[0];
	if (type == "wall")
	{
		PartClick();
	}
}
var TabAmount = 1;// 樓層數初始為一層 屋頂是第2層
var SelectId = -1; // 選取的樓層初始為0
function functionkey()
{
	var key = getElem("functionkey");
	if(key.innerHTML=="X")
	{
		deleteTab();
	}
	else
	{
		addTab();
	}
	
}
function selectLayer()
{
	var node = scene.getNode(lastid);
	var n = scene.findNode(pickObjId);
	var type = n.parent.parent.getName();
	
	var key = getElem("functionkey");
	if (type == "base" ||type == "backWall") 
	{
		SelectId = node.getLayer();
		selectTab(SelectId,false);
		if(TabAmount>1)
		{
			key.innerHTML = "X";	
		}
		else
		{
			key.innerHTML = "+";
		}
	}
	else if(type == "roof")//roof can't be delete
	{
		SelectId = 0;
		selectTab(SelectId,false);
		key.innerHTML = "+";
	}
}
function selectTab(id,UIentrance){
	var Selected = getElem(id);
	var alltab = getSubElem(getElem("Tab"),"li");
	for (var i = 0; i < alltab.length; i++){
		alltab[i].className = "General";
	}
	Selected.className = "Selected";
	SelectId = parseInt(id);
	lastFloor = SelectId;
	var key = getElem("functionkey");
	if (SelectId != 0)//not roof
	{
		if(TabAmount > 1)
		{
		key.innerHTML = "X";
		}
		else
		{
		key.innerHTML = "+";
		}
		closePartBar("subPartBar");
		closePartBar("mainPartBar");
	}
	
	if (SelectId == 0)//roof
	{
		lastFloor = TabAmount + 1;
		key.innerHTML = "+";
		PartClick();
		componentClick("Part2");
	}
	if(UIentrance)
	{
		dirty = true;
	}
}

function addTab(){
	TabAmount++;
	var ul = getElem("Tab");
	var roof = getElem("0");
	var liElem = createElem("li");
	liElem.id = TabAmount.toString();
	liElem.onclick = function(){selectTab(liElem.id,true)};
	var text = createTextNode(TabAmount.toString() + "F");
	liElem.appendChild(text);
	ul.insertBefore(liElem, roof);
	//selectTab(liElem.id,true);
	setFloorTab(PropertyFT,ValueFT);
	lastid = -1;
	lastFloor = -1;
	SelectId = -1;
	var alltab = getSubElem(getElem("Tab"),"li");
	for (var i = 0; i < alltab.length; i++){
		alltab[i].className = "General";
	}
	closePartBar("subPartBar");
	closePartBar("mainPartBar");
	addBase();
}

function deleteTab(){
	var ul = getElem("Tab");
		if(SelectId != 0)//屋頂、wholeview不能刪除
		{
		ul.removeChild(getElem(SelectId.toString()));
		if (SelectId == TabAmount){
			TabAmount--;
			selectTab(SelectId - 1, true);
			deleteTopBase();
		}
		else{
			//resort
			var tab;
			for (var i = SelectId + 1;i <= TabAmount; i++){
				tab = getElem(i.toString());
				tab.id = (i-1).toString();
				tab.innerHTML = tab.id + "F"  ;
			}
			TabAmount--;
			selectTab(SelectId,true);
			deleteBase(SelectId);
		}
		lastFloor = SelectId;
		}	
}

//For FuncBar
function PrintClick()
{
	inputTaskName("yes");		
	
}
function ExportClick()
{
	Export_click_flag = !Export_click_flag;
	ExportMenu.style.display = "block";
	setInvisibleFuncBar();
}

function SaveClick(){
	inputTaskName("no");	
}

function PreviousClick()
{
	console.log("login_account : "+login_account);
	getPreviousXML();
	PreviousMenu.style.display = "block";
	setInvisibleFuncBar();
}

function closeExportMenu()
{
	ExportMenu.style.display = "none";
	PreviousMenu.style.display = "none";
	Modal.display = "none";
	Export_click_flag = 0;
	setOriFuncBar();
}

function PartClick()
{
	setOriPartBar();
	setInvisibleFuncBar();
}
//For PartBar

var totalPart = [10, 10, 4];//0-window 1-door 2-roof
var flag = [0, 0, 0];//0-window 1-door 2-roof
function componentClick(id){
	var subPart = getElem("Sub" + id);
	subPart.style.display = "block";
	setMultiStyle(subPart.getElementsByTagName("div"),"display","block");
	setPartBar(Math.max(Width,Height), PropertyPBul, ValuePBli, PropertyPBimgclose, PropertyPBContent,Propertycloseli,Valuecloseli)	
	getStyle("subPartBar").display = "block";
	
}
var rfcomponent = ["gable", "hip", "mansard","cross_gable","cross_mansard"];
function subPartClick(id){
	tmp = id.split("_");
	type = parseInt(tmp[1]);	index = parseInt(tmp[2]);
	console.log(type);
	var myid = lastid;
	if(type == 0)//window
	{
		changeWall(myid,"wall/single_window");
	}
	if(type == 1)
	{
		changeWall(myid,"wall/door_entry");
	}
	if(type == 2)//roof
	{
		changeRoof("roof/" + rfcomponent[index-1]);
	}
}

function closePartBar(id){
	var Bar = getStyle(id);
	Bar.display = "none";
	//clear subPartBar
	var subPartBar = getElem("subPartBar").getElementsByTagName("div");
	setMultiStyle(subPartBar,"display","none");
	
	/*var fixed = getElem("fixed");
	while(fixed.childElementCount > 1){
		fixed.removeChild(fixed.firstElementChild);
	}	
	var content = getElem("content");
	while(content.hasChildNodes()){
		content.removeChild(content.lastChild);
	}*/
	//show FuncBar
	if(id == "mainPartBar"){
		setInvisiblePartBar();
		setOriFuncBar();
	}
	else
	{
		partmode = -1;
	}
	//click_flag = 0;
	
}



var Texture_flag = 1;
function TextureClick()
{
	var Texture = getStyle('Texture');
	Texture_flag = !Texture_flag;
	if(Texture_flag)
		Texture.backgroundColor = "rgb(247,202,24)";
	else
		Texture.backgroundColor = "rgba(34,167,240,0.6)";
	textureToggle();
}

//取得使用者之前放在server的xml
function getPreviousXML(){
    
	$.ajax({
			url : "http://54.250.173.124/main_server/readxml.php",
			type: 'GET',	
			data: {"user":login_account},
			dataType:'json',
			success: function (json) {		
				
				
				var list = document.getElementById("XMLSELECT");
				for(var i in json) {
				  list.add(new Option(json[i]));
				  
				}
			},
			error: function (jqXHR, tranStatus, errorThrown) {
				alert(
					'Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '. ' +
					'Response: ' + jqXHR.responseText
				);
			}
			});	
	
}
//load的之前編輯過的xml
function changeXML(){
	var xmlSelector = document.getElementById("XMLSELECT");
	var selectedXML = xmlSelector.value.replace(".xml","");
	document.location.href="http://54.250.173.124/main_server/3D-House-master/draw.php?XML=../../xml/"+login_account+"/"+selectedXML;	
}