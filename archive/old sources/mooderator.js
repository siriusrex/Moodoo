/*
Moodoo Component: Mooderator. Contains code for drawing a line graph on a canvas element based on data from the user's mood updates; code for drawing the MoodPie pie chart on a canvas element based on averages from the same data; and event handlers for the line graph (mouse and touch-enabled devices)

*/

//canvas for the main mooderator graph
var canvas=document.getElementById('mooderator_graph');

//set variable to keep track of zoom level on touch-enabled devices
var touchZoom=0;

//canvas for moodPie pie chart graph
var pieCanvas=document.getElementById('moodPie_graph');


//canvas context variable

var ctx;

//event bubbling tracker for mouseUp events - was the mouseUp inside or outside the graph?
var mouseUpInGraph=false;


//normal background
var backgroundColour1="#47709E";
var backgroundColour2="#FFFFFF";

//background whilst dragging
var backgroundColour3="#3A5D7C";
var backgroundColour4="#FFFFFF";

//background when maximum drag left or right
var backgroundColour5="#FFFFFF";
var backgroundColour6="#47709E";

//preloaded mood icons for canvas drawing
var moodIcons=new Array();


//border
var borderColour="#666666";

var mooderatorHeight=125;


//init custom cursor
changeClass('mooderator_graph', 'grab');

function drawMooderator() {  
	//trace('drawMooderator running');
	
	
	//trace('isIE='+isIE);
	
	if (isIE){
		document.getElementById('mooderator').style.position='inherit';
		document.getElementById('mooderator').style.top='0px';
		document.getElementById('moodPie').style.position='inherit';
		document.getElementById('moodPie').style.top='0px';
	}	
	
	var moodData=me.data;
	
	
	mooderatorWidth=564;
		
	if (isIphone) {
		mooderatorHeight=200;
		document.getElementById('mooderator_graph').setAttribute('height', mooderatorHeight+20);
		document.getElementById('mooderator_graph').setAttribute('width', mooderatorWidth);
	}
	
	//preloaded mood icons for canvas drawing
	for (var v=0; v<10; v++){
		//trace('theMoods[v]+"Small"='+theMoods[v]+'Small');
		moodIcons.push(document.getElementById(theMoods[v]+'Small'));
	}
	
	//set variable for min/max height for actual graph line
	var graphInnerHeight=mooderatorHeight-30;
	
	//trace('drawMooderator BREAK 1');
	
	//get no of seconds between first update and last update (timespan)
	
	var tempStartTime=moodData[0]["seconds"];
	var tempEndTime=moodData[moodData.length-1]["seconds"];
	var endTime;
	var tempTimespan=tempEndTime-tempStartTime;
	
	var zoomScale;
	if (touchZoom==0){
		zoomScale=customScale[mooderatorZoomLevel];
	}
	else {
		zoomScale=customScale[mooderatorZoomLevel]*(1/touchZoom);
	} 
	
	//trace('drawMooderator BREAK 2');
	
	//trace('ratioScale='+zoomScale);
	
	
	if (zoomScale){
		var timespan=tempTimespan*(zoomScale/100);
		var startTime=tempEndTime-tempTimespan*(zoomScale/100);
	}
	else {
		var timespan=tempTimespan;
		var startTime=tempStartTime;
	}
	
	//if user has dragged the graph with the mouse
	if (distance!=0){
		//find how many seconds each pixel is worth at this zoom level
		var secondsPerPixel=timespan/mooderatorWidth;
		var distanceInSeconds=distance*secondsPerPixel;
		startTime+=distanceInSeconds;
		
		
		
		endTime=tempEndTime+distanceInSeconds;
		if (endTime>tempEndTime){
			endTime=tempEndTime;
			startTime-=distanceInSeconds;
		}
		
		if (startTime<tempStartTime){
			startTime=tempStartTime;
			//startTime+=distanceInSeconds;
		}
	}
	
	//trace('timespan='+timespan);
	
	//array of each point on the graph
	var graphPoints=new Array();
	
	for (var k=0; k<moodData.length; k++){
		//get no of Seconds between this update and the first update
		var mySeconds=(moodData[k]["seconds"])-startTime;
		
		//convert to ratio for drawing line graph
		graphPoints[k]=(mySeconds/timespan);
		
	
	}
	
	
	//what time interval to use creating guide on bottom of graph (in seconds)
	var timeScale=Math.floor(timespan/5);
	
	
	var timeStops=new Array();
	var timeStopsLabels=new Array();
	
	
	//how many stops will there be?
	var count=5;
	
	
	
	
	//find the date of the first instant in the data
	var startDate=new Date(startTime*1000);
		
	//trace('startDate='+startDate);
	
		
	//create array of time stops
	for (var q=0; q<count; q++) {
		var secondsToAdd=timeScale*q;
		timeStops[q]=new Date((startTime+secondsToAdd)*1000);
			
		
	}
	//trace('timeStops='+timeStops);
		
		
		
	for (p=1; p<timeStops.length; p++){
			
		
		var tempMonth=timeStops[p].getMonth();
		
		var timeStopMonth=monthNames[tempMonth];
		timeStopMonth=timeStopMonth.slice(0, 3);
			
		
		
		var tempDay=timeStops[p].getDate();
		
		var tempHours=timeStops[p].getHours();
		var tempMinutes=timeStops[p].getMinutes().toString();
				
			
		if (tempMinutes.length==1){
			tempMinutes="0"+tempMinutes;
		}
		if (tempHours>12){
			tempHours-=12;
			tempMinutes+='pm';
		}
		else {
			tempMinutes+='am';
		}
	
			
		timeStopsLabels[p]=timeStopMonth+' '+tempDay+', '+tempHours+':'+tempMinutes;
			
			
			

	}
		
	
		

	//trace('drawMooderator BREAK 3');
	
	
	
	
	
	
	
	//DO DRAWING ON CANVAS
	
	//vertical distance fraction btwn each point on the gradient
	
	var gradientGap=(1/10);
	
  	
  	if (canvas){
  		//trace('canvas exists');
  		if (canvas.getContext) {  
  			//trace('canvas.getContext exists');
	    	//new canvas context
	   		ctx = canvas.getContext("2d"); 
	   		
	    }
  	}
  	else {
  		//trace('mooderator - error: canvas isnt registered!');
  	}
	
	
	   
    //clear canvas
    ctx.clearRect (0, 0, 450, 150);
	
		     
	
	
	//background gradient 
	var greygrad = ctx.createLinearGradient(0,0,0,mooderatorHeight);
	
	if (!dragging){
	
		greygrad.addColorStop(0, backgroundColour1);
		greygrad.addColorStop(1, backgroundColour2);
	
	} else {
		greygrad.addColorStop(0, backgroundColour3);
		greygrad.addColorStop(1, backgroundColour4);
	}
	
	ctx.fillStyle=greygrad;
	
	
	
	roundRect(ctx, 0, 5, mooderatorWidth, mooderatorHeight, 15, 1, 0);
	
	
	
	//create gradient fill for line based on mood colours - bottom is red, top is blue
	
	
	var lingrad = ctx.createLinearGradient(0,20,0, graphInnerHeight); 
	for (var j in colourArray){
		
		lingrad.addColorStop((1-(j*gradientGap)), colourArray[j]);
	};
	
	
	ctx.lineWidth=4;
	
	
	
	ctx.lineCap='round';
	ctx.lineJoin='round';
   
    
   
    ctx.beginPath();
    
    var heightRatio=graphInnerHeight/10;
    
    ctx.moveTo(-5, (graphInnerHeight-(moodData[0]["mood"]*heightRatio)));
    //trace('moodData.length='+moodData.length+');
  	canvasPoints=new Array();
   
    //draw mood line graph
    for (var i=1; i<moodData.length; i++){
    	
		var graphX=(graphPoints[i]*mooderatorWidth);
		var nextGraphX=(graphPoints[i+1]*mooderatorWidth);
		
		var graphY=(10+graphInnerHeight-(moodData[i]["mood"]*heightRatio));
		
		
		
		

		//check to see if next point will be in visible zone; if so, draw from this point (so that the height of the line is correct at x=0px)
		if (!(nextGraphX<0)){
			
			//draw line to point
			ctx.lineTo(graphX, graphY);
			
			
			
			
			
			//store point in array
			canvasPoints.push({x:graphX, y:graphY, number:i, mood:moodData[i]["mood"]});
			//trace("canvasPoints["+i+"].x="+graphX+", y="+graphY);
	
		}
		
    	
    }
    
    
    ctx.strokeStyle = lingrad;
    
    
    
	ctx.stroke();
	console.log('drawing mood Icons onto mooderator graph');
	
	//draw coloured circle points onto mooderator graph
	ctx.lineWidth = 0;
	
	for (var u=0; u<canvasPoints.length; u++){
    	var tempMoodNum=parseInt(canvasPoints[u].mood);
    	
		var tempMood=parseInt(canvasPoints[u].mood);
		ctx.fillStyle=colourArray[tempMoodNum];
		
		ctx.strokeStyle=greygrad;	
		
		ctx.lineWidth=2;
		
		var radius=4;
		if (isIphone){
			radius=8;
			ctx.lineWidth=6;
		
		
		}
		console.log('drawing mooderator circles; canvasPoints[u].x='+canvasPoints[u].x+', canvasPoints[u].y='+canvasPoints[u].y);
		drawSolidCircle(ctx, canvasPoints[u].x, canvasPoints[u].y, radius);
    }
	
	
	
	
	
	//draw regular time stops and labels
	
	
		for (var m=1; m<timeStops.length; m++){
	    	ctx.beginPath();
	    	ctx.strokeStyle = '#666666';
			ctx.lineWidth=2;
			var gap=(mooderatorWidth/timeStops.length)*m;
			
	    	ctx.moveTo(gap, mooderatorHeight+4);
	    	ctx.lineTo(gap, mooderatorHeight-5);
	    	ctx.stroke();
	    	
	    	if (document.getElementById('timeStop'+m)){
	    		document.getElementById('timeStop'+m).innerHTML=timeStopsLabels[m];
	    	}
	    }
	
	
		
	console.log('drawMooderator Section 6'); 
		
	
	
	
	
	  
	/*
	toolTip=document.getElementById("mooderator_tooltip");
	toolTip.style.position='absolute';
	toolTip.style.top='20px';
	*/
	  
}




/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * If you omit the last three params, it will draw a rectangle 
 * outline with a 5 pixel border radius 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }       
  
  
  
   
}

/*mouse events */


function onMouseOverGraph(e){
	if (canvas.addEventListener){
		canvas.addEventListener("mousemove", onMouseMoveGraph, false);
	}
	else if (canvas.attachEvent){
		canvas.attachEvent("onmousemove", onMouseMoveGraph);
	}

	changeClass('mooderator_graph', 'grab');
	
	if (e.preventDefault)
        e.preventDefault();
    else
        e.returnValue= false;
    return false;
}

function onMouseOutGraph(e){
	if (canvas.removeEventListener){
		canvas.removeEventListener("mousemove", onMouseMoveGraph, false);
	}
	else if (canvas.detachEvent){
		canvas.detachEvent("onmousemove", onMouseMoveGraph);
	}
	hideToolTip();
	if (e.preventDefault)
        e.preventDefault();
    else
        e.returnValue= false;
    return false;
		
}

function onMouseDownGraph(e){

	//trace('mouse down');
	dragPosA=getCursorPosition(e, canvas);
	dragPosB=getCursorPosition(e, canvas);
	//trace('dragPosA='+dragPosA);
	dragging=true;
	
	
	changeClass('mooderator_graph', 'grabbing');
	
	drawMooderator();
	
	if (e.preventDefault)
        e.preventDefault();
    else
        e.returnValue= false;
    return false;
}

function onMouseUpGraph(e){
	//trace('mouse up graph');
	mouseUpInGraph=true;
	dragging=false;
	
	
	changeClass('mooderator_graph', 'grab');
	
	drawMooderator();
	
	if (e.preventDefault)
        e.preventDefault();
    else
        e.returnValue= false;
    return false;
}

function onMouseUpDocument(e){
	//trace('mouse up document');
	if (!mouseUpInGraph){
		dragging=false;
		canvas.removeEventListener("mousemove", onMouseMoveGraph, false);
		hideToolTip();
		changeClass('mooderator_graph', 'grab');
		
		drawMooderator();
		
		//if (e.preventDefault)
	       // e.preventDefault();
	    //else
	       // e.returnValue= false;
	    return false;
    }
    else {
    	mouseUpInGraph=false;
    }
}

function onMouseMoveGraph(e){
	//trace("onMouseMoveGraph running");
	var mousePos=getCursorPosition(e, canvas);
	var hit=false;
	//trace("mousePos.x="+mousePos.x);
	//trace("mousePos.y="+mousePos.y);
	
	if (!dragging){
		for (var i=0; i<canvasPoints.length; i++){	
			var testX=Math.round(canvasPoints[i].x);
			var testY=Math.round(canvasPoints[i].y);
			
			//trace("testX="+testX);
			//trace("testY="+testY);
			if ((testX>(mousePos.x-10) && testX<(mousePos.x+10)) && ((testY>(mousePos.y-10)) && (testY<(mousePos.y+10)))){
				//trace("hit");
				hit=true;
				
				
				//changeClass('mooderator_graph', 'invisible');
				//changeClass('mooderator_tooltip', 'invisible');
				
				showToolTip(canvasPoints[i].x, canvasPoints[i].y, canvasPoints[i].number);
				
			}
			if (hit!=true){
				//changeClass('mooderator_tooltip', 'grab');
				//changeClass('mooderator_graph', 'grab');
				
				hideToolTip();
				
			}
		}
		
	}
	
	else {
		dragPosA=dragPosB;
		dragPosB=getCursorPosition(e, canvas);
		
		
		
		scrollMooderator();
	}
	
}


function onTouchStartGraph(e){
	trace("touch start");
	var hit=false;
			
	
	var touchPos=getTouchPosition(e, canvas);
	trace('touchPos.x='+touchPos.x+'; touchPos.y='+touchPos.y);
	//diagnostic cursor
	//drawSolidCircle(ctx, touchPos.x*2, touchPos.y*2, 4);
	
	for (var r=0; r<canvasPoints.length; r++){	
		var testX=Math.round(canvasPoints[r].x);
		var testY=Math.round(canvasPoints[r].y);
		//trace('testX='+testX);
		//trace('testY='+testY);
		
		var range=20;
		
		//why *2? not sure!! the touch position seems to be giving me half the actual x & y...ugly hack, want to fix it
		
		if ((testX>((touchPos.x*2)-range) && testX<((touchPos.x*2)+range)) && ((testY>((touchPos.y*2)-range)) && (testY<((touchPos.y*2)+range)))){
			//trace("hit");
			hit=true;
			
							
			
			//why -4? not sure, maybe something to do with the range.
			showToolTip((canvasPoints[r].x/2), (canvasPoints[r].y/2), canvasPoints[r].number);
			
		}
		if (!hit){
			
			dragPosA=getTouchPosition(e, canvas);
			dragPosB=getTouchPosition(e, canvas);
			
			dragging=true;
			hideToolTip();
			
		}
		
	}
	
	
}

function onTouchMoveGraph(e){
	//trace("touch move");
	if (dragging){
		dragPosA=dragPosB;
		dragPosB=getTouchPosition(e, canvas);
		//trace("dragPosA.x="+dragPosA.x);
		scrollMooderator();
	}
}

function onTouchEndGraph(e){
	//trace("touch end or cancel");
	
	dragging=false;
	scrollMooderator();
}


function getTouchPosition(e, DOMElement) {
	//trace('getTouchPosition running');
	var theX;
	var theY;
	
    if (!e) {
    
   		var e = event;
   	}
    e.preventDefault();
    theX = e.targetTouches[0].pageX - DOMElement.offsetLeft;
 	theY = e.targetTouches[0].pageY - DOMElement.offsetTop;
 	
 	
 	
    var pos={x:theX, y:theY};
	return pos;
}

function onGestureStartGraph(e){
	//trace('gesture start; scale='+e.scale);
	canvas.removeEventListener('touchstart', onTouchStartGraph);
	canvas.removeEventListener('touchmove', onTouchMoveGraph);
}

function onGestureChangeGraph(e){
	//trace('gesture change; scale='+e.scale);
	zoomChangeTouch(e.scale);
}

function onGestureEndGraph(e){
	//trace('gesture end; scale='+e.scale);
	canvas.addEventListener('touchstart', onTouchStartGraph);
	canvas.addEventListener('touchmove', onTouchMoveGraph);
}

function hideToolTip(){
	
	if (toolTip){
		toolTip.style.display='none';
	}
}

function showToolTip(posX, posY, number){
	trace("showToolTip running; posX="+posX+"; posY="+posY);
	document.getElementById('pinpoint').style.display='block';
	document.getElementById("mooderatorToolTipMessage").style.width="auto";
	
	
		if (canvas.offsetLeft){
			toolTip.style.left=parseFloat(canvas.offsetLeft+posX)+'px';
			toolTip.style.top=parseFloat(canvas.offsetTop+posY)+'px';
		
		}
		
		else if (canvas.offsetX){
			toolTip.style.left=mousePos.x+'px';
			toolTip.style.top=mousePos.y+'px';
		}
	
	if (isIphone) {
	
		//iphone version of tooltip display
		document.getElementById('mooderatorToolTipMessage').style.position='inherit';
		document.getElementById('mooderatorToolTipMessage').style.left='0px';
		document.getElementById('mooderatorToolTipMessage').style.margin='0px 0px 0px 0px';
		document.getElementById('mooderatorToolTipMessage').style.width='100%';
		
		document.getElementById('mooderator').insertBefore(document.getElementById('mooderatorToolTipMessage'), document.getElementById('mooderator_label'));
		
		
	}
	var arrayIndex=parseInt(number);
	//trace("me.data[arrayIndex].status="+me.data[arrayIndex].status);
	
	var tempMoodNum=me.data[arrayIndex].mood;
	//document.getElementById("mooderatorToolTipMessage").style.display="block";
	document.getElementById("mooderatorToolTipMessage").innerHTML="<img style='margin:0px; float:left; width:15px; height:15px' src='images/"+theMoods[tempMoodNum]+"_face.png'/> <p style='display:inline; position:relative; top:2px'>&nbsp;&nbsp;"+me.data[arrayIndex].status+"</p>";
	
	toolTip.style.display='block';
	toolTip.style.margin='0px';
	toolTip.style.padding='0px';
	
	
}





function scrollMooderator(){
	//trace("scrollMooderator running");

	
	distance+=(dragPosA.x-dragPosB.x);
		
	//trace("distance="+distance");
	drawMooderator();
}

function zoomChangeTouch(scale){
	//trace('zoomChangeTouch running; scale='+scale);	
	
	touchZoom=scale;
		
	//trace('mooderatorZoomLevel='+mooderatorZoomLevel);
	
	
	/*var tempPercentage=parseInt(mooderatorZoomLevel)*1.5;
	
	
	if (tempPercentage<1){
		tempPercentage=1;
	}
	if (tempPercentage>98){
	 	tempPercentage=100;
	}
	
	if (document.getElementById('mooderatorZoomPercentage')){
		document.getElementById('mooderatorZoomPercentage').innerHTML=Math.floor(tempPercentage)+'&#37;';
	}*/
	
	if (distance!=0){
		
		var newTimeScale=customScale[parseInt(mooderatorZoomLevel)]*(1/touchZoom);
		
		var oldTimeScale=customScale[parseInt(oldZoomLevel)];
		
		if (newTimeScale!=oldTimeScale){
			var ratio=(newTimeScale/oldTimeScale);
			
			if (newTimeScale<oldTimeScale){
				var newDistance=((distance-30)/ratio);
			}
			else {
				var newDistance=((distance+30)/ratio);
			}
			
		
			distance=newDistance;
		}
	}
	
	
	drawMooderator();
}


function zoomChange(){
		
	//work out where to centre the graph horizontally; work out ratio between new and old zoom levels, and adjust distance from end respectively
	
	oldZoomLevel=mooderatorZoomLevel;
	//trace('oldZoomLevel='+oldZoomLevel');
	mooderatorZoomLevel=parseInt(document.getElementById("mooderator_slider").value);
	
	//trace('mooderatorZoomLevel='+mooderatorZoomLevel);
	
	
	var tempPercentage=parseInt(mooderatorZoomLevel)*1.5;
	
	
	if (tempPercentage<1){
		tempPercentage=0;
	}
	if (tempPercentage>98){
	 	tempPercentage=100;
	}
	
	if (document.getElementById('mooderatorZoomPercentage')){
		document.getElementById('mooderatorZoomPercentage').innerHTML=Math.floor(tempPercentage)+'&#37;';
	}
	
	if (distance!=0){
		
		var newTimeScale=customScale[parseInt(mooderatorZoomLevel)];
		
		var oldTimeScale=customScale[parseInt(oldZoomLevel)];
		if (newTimeScale!=oldTimeScale){
			var ratio=(newTimeScale/oldTimeScale);
			if (newTimeScale<oldTimeScale){
				var newDistance=((distance-30)/ratio);
			}
			else {
				var newDistance=((distance+30)/ratio);
			}
		
			distance=newDistance;
		}
	}
	
	
	drawMooderator();
}


function mooderatorZoomIn(){
	//distance=0;
	
	//trace('zoomIn; distance='+distance);
	oldZoomLevel=mooderatorZoomLevel;
	mooderatorZoomLevel--;
	if (mooderatorZoomLevel<0){
		//trace('mooderator zoomLevel is less than zero!');
		mooderatorZoomLevel=0;
		document.getElementById('zoomInButton').innerHTML="<img src='images/zoomInDisabled.png'/>";


		
	}
	else {
		document.getElementById('zoomInButton').innerHTML="<a class='zoomInButton' href='javascript:mooderatorZoomIn()'></a>";
	
		document.getElementById('zoomOutButton').innerHTML="<a class='zoomOutButton' href='javascript:mooderatorZoomOut()'></a>";
	}
	
	var tempPercentage=parseInt(mooderatorZoomLevel)*1.5;
	if (tempPercentage<1){
		tempPercentage=0;
	}
	if (tempPercentage>98){
	 	tempPercentage=100;
	}
	
	if (document.getElementById('mooderatorZoomPercentage')){
		document.getElementById('mooderatorZoomPercentage').innerHTML=Math.floor(tempPercentage)+'&#37;';
	}
	
	if (distance!=0){
		
		var newTimeScale=customScale[parseInt(mooderatorZoomLevel)];
		var oldTimeScale=customScale[parseInt(oldZoomLevel)];
		if (newTimeScale!=oldTimeScale){
			var ratio=(newTimeScale/oldTimeScale);
			if (newTimeScale<oldTimeScale){
				var newDistance=((distance-30)/ratio);
			}
			else {
				var newDistance=((distance+30)/ratio);
			}
		
			distance=newDistance;
		}
	}

	
	
	
	drawMooderator();
	
	
	
}

function mooderatorZoomOut(){
	//trace('zoomOut; distance='+distance);
	//distance=0;
	oldZoomLevel=mooderatorZoomLevel;
	mooderatorZoomLevel++;
	if (mooderatorZoomLevel>66){
		mooderatorZoomLevel=66;
		document.getElementById('zoomOutButton').innerHTML="<img src='images/zoomOutDisabled.png'/>";

	}
	else {
		
		document.getElementById('zoomInButton').innerHTML="<a class='zoomInButton' href='javascript:mooderatorZoomIn()'></a>";
	
		document.getElementById('zoomOutButton').innerHTML="<a class='zoomOutButton' href='javascript:mooderatorZoomOut()'></a>";
	}
	
	var tempPercentage=parseInt(mooderatorZoomLevel)*1.5;
	if (tempPercentage<1){
		tempPercentage=0;
	}
	if (tempPercentage>98){
	 	tempPercentage=100;
	}
	
	if (document.getElementById('mooderatorZoomPercentage')){
		document.getElementById('mooderatorZoomPercentage').innerHTML=Math.floor(tempPercentage)+'&#37;';
	
	}
	
	if (distance!=0){
		
		var newTimeScale=customScale[parseInt(mooderatorZoomLevel)];
		
		var oldTimeScale=customScale[parseInt(oldZoomLevel)];
		
		if (newTimeScale!=oldTimeScale){
			var ratio=(newTimeScale/oldTimeScale);
			
			if (newTimeScale<oldTimeScale){
				var newDistance=((distance-30)/ratio);
			}
			else {
				var newDistance=((distance+30)/ratio);
			}
		
			distance=newDistance;
		}
	}

	
	
	drawMooderator();
}



function createMoodPie(){
	//trace('createMoodPie running');	

	noOfUpdates=me.data.length;
	//trace('noOfUpdates='+noOfUpdates);	
	var moodFrequency=new Array(0,0,0,0,0,0,0,0,0,0);
	
	var pieSlicePercentages=new Array();
	
	for (var z=0; z<me.data.length; z++){
		var thisMood=parseInt(me.data[z].mood);
		moodFrequency[thisMood]+=1;
		
		
		
	}
	//trace('moodFrequency='+moodFrequency);	
	
	
	
	for (var p in moodFrequency){
		if (moodFrequency[p]>0){
			var tempPercentage=parseInt(moodFrequency[p])/noOfUpdates;
			//trace('pushing new pieSlicePercentage: number='+tempPercentage+'; colour='+colourArray[p]);
			pieSlicePercentages.push(new Object({number:tempPercentage, colour:colourArray[p]}));
		}
	}
	//trace('pieSlicePercentages='+pieSlicePercentages);
	var pieDivWidth;
	if (document.defaultView && document.defaultView.getComputedStyle){
		pieDivWidth = document.defaultView.getComputedStyle(document.getElementById('moodPie_graph'), "").getPropertyValue('width');
	}
	else {
		pieDivWidth=document.getElementById('moodPie_graph').offsetWidth;
	}
	
	
	
	document.getElementById('moodPie_graph').style.display='block';
	trace('pieDivWidth='+pieDivWidth);
	var pieWidth=parseInt(pieDivWidth);
	trace('pieWidth='+pieWidth);
	document.getElementById('moodPie_graph').setAttribute('height', pieWidth);
	document.getElementById('moodPie_graph').setAttribute('width', pieWidth);

	
	drawPie(pieSlicePercentages, (pieWidth/2));
}

function drawPie(percentages, theRadius){
	//trace('drawPie running');
	var pieCanvas=document.getElementById('moodPie_graph');


	
	if (pieCanvas.getContext){
		var pieContext = pieCanvas.getContext("2d");
	}
	
	pieContext.lineWidth=1;
	pieContext.lineCap='round';
	pieContext.lineJoin='round';
	   
	    
	   
	
	
	var lastAngle=0;
	for (var g=0; g<percentages.length; g++){
		//trace('lastAngle='+lastAngle);
		
		pieContext.beginPath();
		pieContext.moveTo(theRadius, theRadius);
		
		
		//trace('percentages[g].colour='+percentages[g].colour);
		//trace('percentages[g].number='+percentages[g].number);
		
		var pieGrad = pieContext.createLinearGradient(0,0,0,300);
		
		pieGrad.addColorStop(0, percentages[g].colour);
		
		
		pieGrad.addColorStop(1, "#000000");
		
		if (!isIE){	
			pieContext.fillStyle=pieGrad;
		}
		else {
			pieContext.fillStyle=percentages[g].colour;
		}
		var angle=(Math.PI*2)*percentages[g].number;
		//trace('angle='+angle);
		pieContext.arc(theRadius, theRadius, theRadius, lastAngle-0.01, lastAngle+angle+0.01, false);
		pieContext.closePath();
		pieContext.fill();
		lastAngle+=angle;
	}
	
	
	
}


function replaceMooderatorSlider() {
	document.getElementById("zoomButtonsWrapper").innerHTML='<span id="zoomInButton"><a class="zoomInButton" href="javascript:mooderatorZoomIn()"></a></span><span id="mooderatorZoomPercentage">100&#37;</span><span id="zoomOutButton"><img src="images/zoomOutDisabled.png"/></span>';
	hidediv("slider_wrapper");

}