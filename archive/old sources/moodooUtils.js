function trace(HTMLOutput){
	console.log(HTMLOutput);
	if (document.getElementById('traceOutput')){
		if (document.getElementById('traceOutput').style.display!='none'){
			document.getElementById('traceOutput').innerHTML+=HTMLOutput+'<br/>';
			//window.alert(HTMLOutput);
		}
	}
}

function hidediv(id) {
	//trace('hiding div '+id);	
	//safe function to hide an element with a specified id
	if (document.getElementById) { // DOM3 = IE5, NS6
		if (document.getElementById(id)){
			document.getElementById(id).style.display = 'none';
		}
	}
	else {
		if (document.layers) { // Netscape 4
			document.id.display = 'none';
		}
		else { // IE 4
			document.all.id.style.display = 'none';
		}
	}
}

function showdiv(id) {
	
	
	
	
	//safe function to show an element with a specified id
	//trace('showing div '+id);	 
		 
	if (document.getElementById) { // DOM3 = IE5, NS6
		if (document.getElementById(id)){
			document.getElementById(id).style.display = 'block';
		}
		else {
			//trace('showdiv: element with id '+id+' does not exist!');
		}
	}
	else {
		if (document.layers) { // Netscape 4
			document.id.display = 'block';
		}
		else { // IE 4
			document.all.id.style.display = 'block';
		}
	}
	
	
}
 

function highlightDiv(id){
	trace('highlighing div '+id+'<br/>');	
	//trace('div.style= '+document.getElementById(id).style);	
	showdiv(id);
	var divToShow=document.getElementById(id);
	divToShow.display='block';
	
	var thisDivHeight;
	
	if (document.defaultView && document.defaultView.getComputedStyle){
		thisDivHeight = document.defaultView.getComputedStyle(divToShow, "").getPropertyValue('height');
	}
	else {
		thisDivHeight=divToShow.offsetHeight;
	}
	
	//trace('before parseInt, thisDivHeight= '+thisDivHeight+'<br/>');
	if (thisDivHeight!='NaN'){
	 thisDivHeight=parseInt(thisDivHeight);
	}
	//trace('thisDivHeight= '+thisDivHeight+'<br/>');
	
	
	
	
	divToShow.style.position = 'absolute';
	divToShow.style.height=thisDivHeight+'px';
	//divToShow.style.top=thisDivTop+'px';
	//find pos of this div in rightColumnDivIds global array
	var thisDivArrayPos=rightColumnDivIds.indexOf(id);
	
	
	
	//loop: find next div in global array, check if div is hidden, if it is, select the following div in the array
	
	var nextDivId=rightColumnDivIds[parseInt(thisDivArrayPos+1)];
	
	nextDiv=document.getElementById(nextDivId);
	
	//trace('nextDivId='+nextDivId);
	
	//trace('nextDiv='+nextDiv);
	
	var j=1;
	
	
	while (nextDiv.style.display=='none'){
		//get next id, next div = getElementById(newId)
		
		var nextDivId=rightColumnDivIds[parseInt(thisDivArrayPos+j)];
	
		nextDiv=document.getElementById(nextDivId);
		
		if (nextDiv=='null' || nextDiv==undefined){
			//trace('nextDiv is null or undefined');
			break;
		}
		
		j++;
		
		
		
	}
	
	//trace('after while loop');
	
	var col2Height;
	if (document.defaultView && document.defaultView.getComputedStyle){
		col2Height=document.defaultView.getComputedStyle(document.getElementById('col2'), '').getPropertyValue('height');
	}
	else {
		col2Height=document.getElementById('col2').offsetHeight;
	}
	col2Height=parseInt(col2Height);
	
	if (nextDiv!='null' && nextDiv!=undefined){
		if (nextDiv.style.display=='block'){
			nextDiv.style.marginTop=parseInt(thisDivHeight+80)+'px';
		}
		col2Height+=thisDivHeight+100;
		
		document.getElementById('col2').style.height=col2Height+'px';
	}
	else {
		//there's no div below this one to give a margin-top to, but we still need to adjust containing column to match height - makes sure that highlighted divs don't hang over footer
		
		
		
		//trace('col2Height='+col2Height);
		
		col2Height+=thisDivHeight+100;
		
		document.getElementById('col2').style.height=col2Height+'px';
	}
	
	
	
	
	//trace('nextDiv= '+nextDiv+'; nextDiv.id='+nextDiv.id);
	

	
	document.getElementById('black').style.zIndex=100;
	divToShow.style.zIndex = 102;
	
	
	
	//trace('black.style.zIndex= '+document.getElementById('black').style.zIndex+'<br/>');	
	document.getElementById('black').style.display='block';
	//trace('document.getElementById(id).style.zIndex= '+document.getElementById(id).style.zIndex);
}


function unHighlightDiv(id){
	
	//trace('unHighlightDiv running<br/>');
	trace('unhighlighing div '+id);	
	var divToHide=document.getElementById(id);
	
	
	divToHide.style.position = 'inherit';
	divToHide.style.height = 'auto';
	hidediv(id);
	
	//find pos of this div in rightColumnDivIds global array
	var thisDivArrayPos=rightColumnDivIds.indexOf(id);
	
	
	
	//loop: find next div in global array, check if div is hidden, if it is, select the following div in the array
	
	var nextDivId=rightColumnDivIds[parseInt(thisDivArrayPos+1)];
	
	var nextDiv=document.getElementById(nextDivId);
	
	if (nextDiv!=null && nextDiv!=undefined){
		var k=1;
		
		while (nextDiv.style.display=='none'){
			//get next id, next div = getElementById(newId)
			
			var nextDivId=rightColumnDivIds[parseInt(thisDivArrayPos+k)];
		
			nextDiv=document.getElementById(nextDivId);
			
			if (nextDiv==null && nextDiv==undefined){
			 break;
			}
			
			k++;
		}
		if (nextDiv!=null && nextDiv!=undefined){
			nextDiv.style.marginTop='0px';
		}
	}
	
	
	document.getElementById('col2').style.height='auto';
	
	
	
	document.getElementById('black').style.zIndex=100;
	
	
	
	document.getElementById('black').style.display='none';
	
}




function fadeInDiv(id){
	var target = document.getElementById(id);
	//trace("fadeInDiv running id="+id);
	if (target!=null){
		target.style['opacity']=0;
		target.style['-moz-opacity']=0;
		
	
		target.style.display='block';
		var opacityTween = new OpacityTween(target,Tween.regularEaseIn, 0, 100, 1);
		opacityTween.start();
		
	}
	


}

function fadeOutDiv(id){
	var target = document.getElementById(id);
	//trace("fadeInDiv running, target="+target);

	if (target.style.display=='block'){
		var opacityTween = new OpacityTween(target,Tween.regularEaseIn, 100, 0, 1);
		opacityTween.start();
	}


}

function fadeInAll(){
	//trace('fadeInAll running');
	for (var y in visiblePanels){
		
		//trace('visiblePanels['+y+']='+visiblePanels[y]);
		if (y!='indexOf'){
			//showdiv(visiblePanels[y]);//works in IE
			fadeInDiv(visiblePanels[y]);//throws errors in IE
		
		}
	}
}

function hideAll(){
	
	//trace("hideAll: panels="+panels);
	
	if (panels){
		for (var n=0; n<panels.length; n++){
			
			hidediv(panels[n]);
	
		}
	}
	
	
	if (isIE){
		document.getElementById('mooderator').style.position='absolute';
		document.getElementById('mooderator').style.top='-2000px';
		document.getElementById('moodPie').style.position='absolute';
		document.getElementById('moodPie').style.top='-2000px';
	}
	
	
}

String.prototype.capitalize = function(){
   return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
  };

function showdeadcenterdiv(Xwidth,Yheight,divid) { 
// First, determine how much the visitor has scrolled

	var scrolledX, scrolledY; 
	if( self.pageYOffset ) { 
		scrolledX = self.pageXOffset; 
		scrolledY = self.pageYOffset; 
	} else if( document.documentElement && document.documentElement.scrollTop ) { 
		scrolledX = document.documentElement.scrollLeft; 
		scrolledY = document.documentElement.scrollTop; 
	} else if( document.body ) { 
		scrolledX = document.body.scrollLeft; 
		scrolledY = document.body.scrollTop; 
	}
	
	// Next, determine the coordinates of the center of browser's window
	
	var centerX, centerY; 
	if( self.innerHeight ) { 
		centerX = self.innerWidth; 
		centerY = self.innerHeight; 
	} else if( document.documentElement && document.documentElement.clientHeight ) { 
		centerX = document.documentElement.clientWidth; 
		centerY = document.documentElement.clientHeight; 
	} else if( document.body ) { 
		centerX = document.body.clientWidth; 
		centerY = document.body.clientHeight; 
	}
	
	// Xwidth is the width of the div, Yheight is the height of the 
	// div passed as arguments to the function: 
	var leftOffset = scrolledX + (centerX - Xwidth) / 2; 
	var topOffset = scrolledY + (centerY - Yheight) / 2; 
	// The initial width and height of the div can be set in the 
	// style sheet with display:none; divid is passed as an argument to // the function 
	var o=document.getElementById(divid); 
	var r=o.style; 
	r.position='absolute'; 
	r.top = topOffset + 'px'; 
	r.left = leftOffset + 'px'; 
	r.display = "block"; 
} 


function setSelectControl(selectControl, desiredValue){
	//trace('setSelectControl: desiredValue='+desiredValue);
		if (selectControl){
			//trace('setSelectControl: select control exists');
			
			//trace('setSelectControl: selectControl='+selectControl);
			for (var q=0; q<selectControl.options.length; q++){
				//trace('selectControl.options[q].value='+selectControl.options[q].value);
								
				if (selectControl.options[q].value==desiredValue){
					
						selectControl.options[q].selected = true;
					
				}
			}
		}
	

}

function changeClass (elementID, newClass) {
	var element = document.getElementById(elementID);
	
	if (element!=null){
				
		element.setAttribute("class", newClass); //For Most Browsers
		element.setAttribute("className", newClass); //For IE; harmless to other browsers.
	
	}
}

function toggleDisabled(el) {
    try {
        el.disabled = el.disabled ? false : true;
    }
    catch(E){}
    
    if (el.childNodes && el.childNodes.length > 0) {
        for (var x = 0; x < el.childNodes.length; x++) {
            toggleDisabled(el.childNodes[x]);
        }
    }
}


function getURLData() {
	var qsParm=new Array();
	//trace('getURLData running');
	var query = window.location.search.substring(1);
	var parms = query.split('&');
	for (var i=0; i<parms.length; i++) {
		var pos = parms[i].indexOf('=');
		if (pos > 0) {
			var key = parms[i].substring(0,pos);
			var val = parms[i].substring(pos+1);
			qsParm[key] = val;
		}
	}
	//trace('got URLvars, id='+qsParm['id']+'; mood='+qsParm['mood']);
	return qsParm;
}



var waitLogoAngle=90;
var logoTimer_is_on=0;
var logoTimer;

function spinLogo() {
	
	
	drawWaitLogo(waitLogoAngle, 25);
	waitLogoAngle+=0.5;
	logoTimer=setTimeout("spinLogo()", 100);
}

function animateWaitLogo() {
	//trace('animateWaitLogo running');
	if (!logoTimer_is_on){
	  logoTimer_is_on=1;
	  spinLogo();
	 }
}


function stopAnimatingLogo()
{
	clearTimeout(logoTimer);
	logoTimer_is_on=0;
}


function drawWaitLogo(startAngle, theRadius){
	//trace('drawWaitLogo running');
	
	var percentages=new Array({colour:colourArray[1], number:0.125}, {colour:colourArray[2], number:0.125}, {colour:colourArray[3], number:0.125}, {colour:colourArray[4], number:0.125}, {colour:colourArray[5], number:0.125}, {colour:colourArray[6], number:0.125}, {colour:colourArray[7], number:0.125}, {colour:colourArray[8], number:0.125});
	
	
	var logoCanvas=document.getElementById('waitLogo');
	

	
	if (logoCanvas.getContext){
		var logoContext = logoCanvas.getContext("2d");
	}
	logoContext.clearRect(0,0,50,50);
	//logoContext.lineWidth=1;
	//logoContext.lineCap='round';
	//logoContext.lineJoin='round';
	   
	    
	   
	
	
	var lastAngle=startAngle;
	for (var g=0; g<percentages.length; g++){
		//trace('lastAngle='+lastAngle);
		
		logoContext.beginPath();
		logoContext.moveTo(theRadius, theRadius);
		
		
		//trace('percentages[g].colour='+percentages[g].colour);
		//trace('percentages[g].number='+percentages[g].number);
		
		
		
			
		logoContext.fillStyle=percentages[g].colour;
		
		var angle=(Math.PI*2)*percentages[g].number;
		//trace('angle='+angle);
		logoContext.arc(theRadius, theRadius, theRadius-6.75, lastAngle-0.01, lastAngle+angle+0.01, false);
		logoContext.closePath();
		logoContext.fill();
		lastAngle+=angle;
	}
	
	var logolineGrad = logoContext.createLinearGradient(0,0,45,45);
	logolineGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
	
	logolineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
		
	
	
	logoContext.moveTo(0, 0);
	
	logoContext.lineWidth=6.5;
	logoContext.lineCap='round';
	logoContext.lineJoin='round';
	logoContext.strokeStyle = logolineGrad;
	
	logoContext.beginPath(); 
	logoContext.arc(theRadius, theRadius, theRadius-3.5, 0, Math.PI * 2, false); 
	logoContext.closePath();
	
	
	logoContext.stroke();
}

function drawSolidCircle(context, centreX, centreY, radius){
	//trace('drawCircle running');
	
	context.beginPath(); 
	context.arc(centreX, centreY, radius, 0, Math.PI * 2, false); 
	context.closePath();
	
	context.stroke();
	context.fill();
}


function getCursorPosition(e, DOMElement) { 
	//trace('getCursorPosition running');
	var theX; 
	var theY; 
	if (e.pageX != undefined && e.pageY != undefined) {
		 theX = e.pageX; 
		 theY = e.pageY; 
		 theX -= DOMElement.offsetLeft; 
		 theY -= DOMElement.offsetTop;
		 //trace("DOMElement.offsetLeft="+DOMElement.offsetLeft);
		 //trace("DOMElement.offsetTop="+DOMElement.offsetTop);
		 
	}
	else { 
		theX = e.offsetX; 
		theY = e.offsetY; 
		 
		
	}
	
	

	
	
	//trace("getCursorPosition; y="+theY+"; x="+theX);
	var pos={x:theX, y:theY};
	return pos;
}


//taken from http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/


function getStyle(oElm, strCssRule){
	//trace('getStyle running, oElm='+oElm+', strCssRule='+strCssRule);
	var strValue = "";
	if(document.defaultView && document.defaultView.getComputedStyle){
		strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
	}
	else {
		strValue = window.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
	}
	return strValue;
}

 
function removeAllChildNodes(elementID){
	var element = document.getElementById(elementID);
	
	if ( element.hasChildNodes() )
	{
	    while ( element.childNodes.length >= 1 )
	    {
	        element.removeChild( element.firstChild );       
	    } 
	}
}


function focusTextField(field){
	field.value='';
	field.style.color='#000000';
}

function removeElement (element) {
    while (element.firstChild) {
        element.parentNode.insertBefore (element.firstChild, element);
    }
    element.parentNode.removeChild (element);
}


//GLOBAL VARIABLES

//mood levels

var theMoods=new Array();

theMoods[0]='gloomy';
theMoods[1]='grouchy';
theMoods[2]='narky';
theMoods[3]='grumpy';
theMoods[4]='fuzzy';
theMoods[5]='happy';
theMoods[6]='boppy';
theMoods[7]='bouncy';
theMoods[8]='snappy';
theMoods[9]='zappy';

//store no of seconds in time intervals
var timeConstants=new Array();
timeConstants[0]=0;
//1 minute
timeConstants[1]=60;
//1 hour
timeConstants[2]=3600;
//1 'threehours'
timeConstants[3]=10800;
//1 'sixhours'
timeConstants[4]=21600;
//1 day
timeConstants[5]=86400;
//1 'threeday'
timeConstants[6]=259200;
//1 week
timeConstants[7]=604800;
//1 month
timeConstants[8]=2592000;
//1 year
timeConstants[9]=31536000;
//1 decade
timeConstants[10]=315360000;

//names of time intervals
var timeConstantNames=new Array();
timeConstantNames[0]='seconds';
timeConstantNames[1]='minutes';
timeConstantNames[2]='hours';
timeConstantNames[3]='threehours';
timeConstantNames[4]='sixhours';
timeConstantNames[5]='days';
timeConstantNames[6]='threedays';
timeConstantNames[7]='weeks';
timeConstantNames[8]='months';
timeConstantNames[9]='years';
timeConstantNames[10]='decades';

var monthNames=new Array();
	
monthNames[0] = "January";
monthNames[1] = "February";
monthNames[2] = "March";
monthNames[3] = "April";
monthNames[4] = "May";
monthNames[5] = "June";
monthNames[6] = "July";
monthNames[7] = "August";
monthNames[8] = "September";
monthNames[9] = "October";
monthNames[10] = "November";
monthNames[11] = "December";



var customScale=new Array();
customScale[0]=0.095500495079682;
customScale[1]=0.106111661199647;
customScale[2]=0.117901845777386;
customScale[3]=0.131002050863762;
customScale[4]=0.145557834293069;
customScale[5]=0.161730926992299;
customScale[6]=0.179701029991443;
customScale[7]=0.199667811101603;
customScale[8]=0.221853123446226;
customScale[9]=0.246503470495807;
customScale[10]=0.273892744995341;
customScale[11]=0.304325272217045;
customScale[12]=0.338139191352273;
customScale[13]=0.375710212613636;
customScale[14]=0.417455791792929;
customScale[15]=0.46383976865881;
customScale[16]=0.515377520732011;
customScale[17]=0.572641689702235;
customScale[18]=0.636268544113594;
customScale[19]=0.706965049015105;
customScale[20]=0.785516721127894;
customScale[21]=0.872796356808771;
customScale[22]=0.969773729787524;
customScale[23]=1.077526366430582;
customScale[24]=1.197251518256202;
customScale[25]=1.330279464729113;
customScale[26]=1.478088294143459;
customScale[27]=1.642320326826066;
customScale[28]=1.824800363140073;
customScale[29]=2.027555959044526;
customScale[30]=2.252839954493917;
customScale[31]=2.503155504993242;
customScale[32]=2.781283894436935;
customScale[33]=3.090315438263261;
customScale[34]=3.433683820292512;
customScale[35]=3.815204244769458;
customScale[36]=4.23911582752162;
customScale[37]=4.710128697246245;
customScale[38]=5.814973700304006;
customScale[39]=6.461081889226673;
customScale[40]=7.178979876918526;
customScale[41]=7.976644307687251;
customScale[42]=8.862938119652501;
customScale[43]=9.847709021836112;
customScale[44]=10.941898913151236;
customScale[45]=10.941898913151236;
customScale[46]=12.157665459056929;
customScale[47]=13.508517176729921;
customScale[48]=15.009463529699912;
customScale[49]=16.677181699666569;
customScale[50]=18.53020188851841;
customScale[51]=20.5891132094649;
customScale[52]=22.876792454961;
customScale[53]=28.2429536481;
customScale[54]=28.2429536481;
customScale[55]=31.381059609;
customScale[56]=34.86784401;
customScale[57]=38.7420489;
customScale[58]=43.046721;
customScale[59]=47.82969;
customScale[60]=53.1441;
customScale[61]=59.049
customScale[62]=65.61;
customScale[63]=72.9;
customScale[64]=81;
customScale[65]=90;
customScale[66]=100;

//array of mood colours used in Moodoo
var colourArray= new Array('#000000', '#DD1F26', '#DF6B28', '#F7971E', '#FED020', '#F9ED32', '#AAD037', '#3AA141', '#007482','#1C75BC');

//array of div ids in right column - used for expanding/highlighting divs when in focus
var rightColumnDivIds=new Array('wait', 'updateMoodButton', 'moodInput', 'locationBox', 'statusBox', 'mySettings', 'settingsBox', 'current_mood', 'average_mood', 'moodPie');





