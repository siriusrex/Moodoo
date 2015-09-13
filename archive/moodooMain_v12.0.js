//Moodoo 2.0
//moodooMain.js
//Created 18 Dec 2013
//Copyright 2010-2013 John Galea



///////////////////////////////////
//GLOBAL VARS
//////////////////////////////////


var baseURL='http://www.moodoo.net/dev/auth';

//array of mood labels
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


//array of mood colours used in Moodoo
var colourArray= new Array('#000000', '#DD1F26', '#DF6B28', '#F7971E', '#FED020', '#F9ED32', '#AAD037', '#3AA141', '#007482','#1C75BC');

//user data object
var me=new Object();
//me.rawData=null;
//me.data=null;
me.updates=null;
me.firstName='';
me.lastName='';
me.email='';
me.ID='';
me.userID='';

me.moodNum=0;
me.mood='';
me.status='';
me.lat='';
me.lng='';
me.currentAddress='';
me.publishToFacebook='';
me.publishToMoodoo='';
me.publishToMap='';
me.reminder='';
me.code='';


//update status vars
var updateMoodTimer;
var socialPublishFinished=false;
var dataRefreshed=false;


/////////////////
//APP INITIALIZATION
///////////////////


//init function called from body element of index.html
function init() {
	
	$('.section').each(function (){
		$(this).css('visibility', 'hidden');
		$(this).css('display', 'none');
		$(this).css('opacity', 0);
		$(this).data('myHeight', $(this).css('height'));
		$(this).css('height', 0);
		$(this).data('hidden', true);
	});
	
	
	
	
	console.log('checking for cookie');
	if (validateNumeric($.cookie('moodooID'))){
		console.log('cookie ID is numeric');
		if ($.cookie('moodooID')!='null'){
			hideDiv('auth');
			$('#results').append('<p>Caught cookie. User id is '+$.cookie('moodooID'));
			console.log('sending cookie id to server');
			loadUser($.cookie('moodooID'), null);
		}

	}
	else {
		console.log('cookie ID is invalid, reverting to janrain');
		hideDiv('communication', 'auth');
		
	}
	
	//setup fancy dynamic sizing of input field for mood status
	$('#status').focus(function(){
		$('#status').animate({
			width:100,
		}, 100, function() {
			//animation complete
		});
	});
	$('#status').keypress(function(){
		console.log('#status just received keypress');
		
		var statusValue=$('#status').val();
		var newWidth=statusValue.length*12;
		if (newWidth<100){
			newWidth=100;
		}
		$('#status').animate({
			width:newWidth,
		}, 100, function() {
	   		 	//animation complete
	   	});

		
		
	});
	
	//change css styling of janrain social sign-on widget
	restyleJanrain();
	
	//add mouse handlers to mooderatorGraph
	$('#mooderatorGraph').mouseover(function(e){
		onMouseOverGraph(e);
	});
	
	$('#mooderatorGraph').mouseout(function(e){
		onMouseOutGraph(e);
	});
	console.log('init finished');
}


////////////////////////////////////////////////////////////
//JANRAIN AUTH - requires mooodoo_auth_main.php in same dir
///////////////////////////////////////////////////////////

//restyle janrain login box - this is a hack until I can pay Janrain enough for widget customization!

function restyleJanrain() {
	console.log('restyleJanrain running');
	$('#janrainEngageEmbed').css('margin-bottom', '50px');
	$('#janrainEngageEmbed').find('div').each(function(){
		$(this).attr('style', 'width: 100% !important');
		$(this).css('text-align', 'center');
		$(this).css('font-family', '"Raleway", sans-serif');
		$(this).css('font-size', '1em');
		$(this).css('color', '#fff');
		$(this).css('border', 'none');
		$(this).css('font-weight', '100');

		$(this).css('display', 'block');
		$(this).css('clear', 'both');
		
		$(this).css('background-color', 'transparent');
	});
	
	$('#janrainEngageEmbed').find('ul').attr('style', 'display: block; margin:0px; padding:0px; list-style-type:none; width:190px !important; float:left');
	
	$('.janrainPage').find('li').attr('style', '');
	
	$('.janrainPage').find('li').each(function(){
		$(this).attr('style', 'width: 160px');
		$(this).css('height', '30px');
		$(this).css('font-family', '"Raleway", sans-serif;');
		$(this).css('font-weight', '100');
		$(this).css('background-color', 'transparent');
		$(this).css('background-image', 'none');
		$(this).css('padding', '3px');
	});
	
	
	$('#janrainProviderPages').attr('style', 'width: 400px !important');	
		
	$('#janrainEngageEmbed').find('a').attr('style', 'margin: 20px; display: block; height: 30px; font-size: 1em; background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none;  font-weight: 100; font-family: "Raleway", sans-serif;');
	
	$('#janrainEngageEmbed').find('a').hover(function(){

   			$(this).attr('style', 'margin: 20px; display: block; height: 30px; font-size: 1em; background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none;  font-weight: 100; font-family: "Raleway", sans-serif;');
   			$(this).find('span').attr('style', 'font-size: 1em; font-family: "Raleway", sans-serif; font-weight: 100; color: rgba(255, 255, 255, 0.2) !important; margin: 3px');
   			$(this).find('span').find('span').attr('style', 'font-size: 1em; font-family: "Raleway", sans-serif; font-weight: 100; color: rgba(255, 255, 255, 0.2) !important; margin: 3px');
	

   		}, function() 
   		{	
	  	 	$(this).attr('style', 'margin: 20px; display: block; height: 30px; font-size: 1em; background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none;  font-weight: 100; font-family: "Raleway", sans-serif;');
	  	 	$(this).find('span').attr('style', 'font-size: 1em; font-family: "Raleway", sans-serif; font-weight: 100; color: rgba(255, 255, 255, 1) !important; margin: 3px');
	  	 	$(this).find('span').find('span').attr('style', 'font-size: 1em; font-family: "Raleway", sans-serif; font-weight: 100; color: rgba(255, 255, 255, 1) !important; margin: 3px');
	
	  	 	
	 
	 
	 });
	
	
	$('#janrainEngageEmbed').find('li').attr('style', 'background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none; font-weight: 100; font-family: "Raleway", sans-serif;');
	  	 		
	$('#janrainEngageEmbed').find('li').hover(function(){

   			$(this).attr('style', 'background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none;  font-weight: 100; font-family: "Raleway", sans-serif;');
   			$(this).find('span').attr('style', 'font-family: "Raleway", sans-serif; font-weight: 100; color: rgba(255, 255, 255, 0.2) !important; margin: 3px');
	

   		}, function()
   		{	
	  	 	$(this).attr('style', 'background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none; font-weight: 100; font-family: "Raleway", sans-serif;');
	  	 	$(this).find('span').attr('style', 'font-family: "Raleway", sans-serif; font-weight: 100; color: rgba(255, 255, 255, 1) !important; margin: 3px');
	
	  	 	
	 
	 
	 });
	 
	$('#janrainEngageEmbed').find('li').find('span').attr('style', 'font-family: "Raleway", sans-serif; font-weight: 100; color: #fff !important; margin: 3px');
	
	$('.janrainContent').css('height', '250px');
	$('.janrainContent').css('margin', '0px');
	
	$('.janrainHeader').css('width', '300px');
	$('.janrainHeader').css('margin', '0px auto 0px auto');
	$('.janrainHeader').css('text-align', 'center');
	$('.janrainHeader').css('padding-top', '20px');
	
	
	
	
	$('#janrainProviderPages').css('margin', '20px auto 20px auto');
	$('#janrainProviderPages').css('width', '300px');

	$('.janrainSwitchAccountLink').attr('style', 'display:none !important');
	
	/*
	
	$('#auth').css('background-color', 'yellow');
	$('#janrainEngageEmbed').css('background-color', 'red');
	$('#janrainEngageEmbed').find('div').attr('style', 'background-color: blue !important');
	$('#janrainEngageEmbed').find('div').width('100');
	
		*/
		
	console.log('finished restyleJanrain code');
}





//Janrain proprietary code to embed Social Network sign-on widget


(function() {
    if (typeof window.janrain !== 'object') window.janrain = {};
    if (typeof window.janrain.settings !== 'object') window.janrain.settings = {};
    
    janrain.settings.tokenUrl = 'http://www.moodoo.net';
	janrain.settings.tokenAction='event';
	
	
	
    function isReady() { janrain.ready = true; };
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", isReady, false);
    } else {
      window.attachEvent('onload', isReady);
    }

    var e = document.createElement('script');
    e.type = 'text/javascript';
    e.id = 'janrainAuthWidget';

   

	if (document.location.protocol === 'https:') {
      e.src = 'https://rpxnow.com/js/lib/moodoo/engage.js';
    } else {
      e.src = 'http://widget-cdn.rpxnow.com/js/lib/moodoo/engage.js';
    }

	
	
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(e, s);
})();


//function called when Janrain widget loads
function janrainWidgetOnload() {
    console.log('widget loaded');
    
    janrain.events.onProviderLoginToken.addHandler(function(response) {
        console.log('got response: '+response.token);
        $.ajax({
                type: "POST",
                url: "janrain_auth.php",
                data: "token=" + response.token,
                success: function(res, status, xhr) {
                    console.log('res='+res+', status='+status+', xhr='+xhr);

                    for (var key in res){
                    	console.log('res['+key+']='+res[key]);
                    }
                    console.log('identifier: '+res.profile.identifier);
                    console.log('displayName: '+res.profile.displayName);
                    console.log('primaryKey: '+res.profile.primaryKey);
                    if (res.profile.name){
                    	console.log('givenName: '+res.profile.name.givenName);
                    }
                    console.log('sending social info to server');
                    loadUser(null, res.profile);
                },
                error: function(data, status, xhr){
                	console.log ('data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	console.log(c+'='+data[c]);
	                	
                	}
                }
        });
});
	
}	


////////////////////////////////////////
//GETTING USER DATA
///////////////////////////////////////

//function loadUser
//takes either userID from cookie or socialProfile ID from Janrain social sign-on and 
//queries Moodoo database to retrieve personal data including mood updates


function loadUser(userID, socialProfile) {
	  console.log('loadUser running');
	   $('#communication').html('<h1>Loading your data...</h1>');
	  
	  showDiv('communication');
	  if (userID){
	 
	  
	  console.log('sending userID from cookie to server, userID='+userID);
	  
	  $.ajax({
                type: "POST",
                url: "moodoo_auth_main.php",
                data: {
                	"userID": userID
            	},
                success: function(res, status, xhr) {
                    console.log('message send success! server says: res='+res+', status='+status+', xhr='+xhr);
					
					
					console.log('php log:' +res.log);
					console.log('submitted query:' +res.query);
                    console.log('create user query:' +res.createQuery);
                    console.log('new user ID:' +res.newuserID);
                    
                    console.log('query success:' +res.success);
                    console.log('social ID:' +res.socialID);
                    console.log('user ID:' +res.userID);
                    console.log('firstName:'+ res.firstName);
                   	console.log('lastName:'+ res.lastName);
                    console.log('email:'+ res.email);
                    console.log('publishSocial:'+ res.publishSocial);
                    console.log('publishToMoodoo:'+ res.publishToMoodoo);
                    console.log('allowLocation:'+ res.allowLocation);
                    console.log('reminder:'+ res.reminder);
                   	console.log('updates:'+ res.updates); 
                    
                    me.ID=res.userID;
                    me.socialID=res.socialID;
                    me.firstName=res.firstName;
                    me.lastName=res.lastName;
                    me.email=res.email;
                    me.publishSocial=res.publishSocial;
                    me.publishToMoodoo=me.publishToMoodoo;
                    me.allowLocation=res.allowLocation;
                    me.reminder=res.reminder;
                    me.updates=res.updates;
                    
                    
                   for (var k in res.updates){
	                	console.log('updates['+k+'].seconds='+res.updates[k].seconds);
	                	
                	}
                	
                	onDataRefreshed();
                	
                	
                    
                },
                error: function(data, status, xhr){
                	console.log ('ERROR! while trying to send cookie ID to server. data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	console.log(c+'='+data[c]);
	                	
                	}
                }
        });			
	  
	  }
	  
	  else if (socialProfile) {
	   console.log('sending socialProfile from janrain to moodoo server, socialProfile.identifier='+socialProfile.identifier);
	  
	   
	   $.ajax({
                type: "POST",
                url: "moodoo_auth_main.php",
                data: {
                	"userID": userID,
                	"socialID": socialProfile.identifier,
                	"email": socialProfile.email
                },
                success: function(res, status, xhr) {
                    console.log('message send success! server says: res='+res+', status='+status+', xhr='+xhr);
					
					//for (var key in xhr){
					//	console.log('encryptTest; xhr['+key+']='+xhr[key]);
					//}
					
					console.log('submitted query:' +res.query);
                    console.log('query success:' +res.success);
                    console.log('create user query:' +res.createQuery);
                    console.log('new user ID:' +res.newuserID);
                    
                    console.log('user ID:' +res.userID);
                   
                    console.log('social ID:' +res.socialID);
                    console.log('firstName:'+ res.firstName);
                   	console.log('lastName:'+ res.lastName);
                    console.log('email:'+ res.email);
                    console.log('publishSocial:'+ res.publishSocial);
                    console.log('publishToMoodoo:'+ res.publishToMoodoo);
                    console.log('allowLocation:'+ res.allowLocation);
                    console.log('reminder:'+ res.reminder); 
                    console.log('php log:'+ res.log); 
                    console.log('updates:'+ res.updates); 
                    
                    me.ID=res.userID;
                    me.socialID=res.socialID;
                    me.firstName=res.firstName;
                    me.lastName=res.lastName;
                    me.email=res.email;
                    me.publishSocial=res.publishSocial;
                    me.publishToMoodoo=me.publishToMoodoo;
                    me.allowLocation=res.allowLocation;
                    me.reminder=res.reminder;
                    me.updates=res.updates;

                    
                    for (var k in res.updates){
	                	console.log('updates[k]='+res.updates[k]);
	                	
                	}
                    
                     //put returned ID in cookie
                     
                     $.cookie('moodooID', res.userID);
                     console.log('trying to access cookie:' +$.cookie('moodooID') );
                    
                     onDataRefreshed();
                },
                error: function(data, status, xhr){
                	console.log ('ERROR! while trying to send social ID to server. data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	console.log(c+'='+data[c]);
	                	
                	}
                }
        });	
        
        }
        
        else {
        
        	console.log('ERROR: neither cookie id nor socialProfile passed to loadUser function');
        }		
        
}


function onDataRefreshed() {
	$('#moodQuestion').html('Hey '+me.firstName+'! How are you feeling right now?');
    
	
	//signal that data has been reloaded for when updateMood calls this function
    
    dataRefreshed=true;
    
    
    hideDiv('communication', 'moodInput');
    
    //initiate data visualization code
	createDisplay();
}


////////////////////////////
//UPDATES
///////////////////////////

//function to set mood for update

function setMood(mood){
	console.log('setMood running');
	
	
	

	$('#communication').append('Setting Mood'+'<br/>');
	
	
	
	console.log('theMoods[mood]='+theMoods[mood]);
	
	
	
	me.moodNum=mood;
	getLocation();
	$('#statusLabel').html('Why are you feeling '+theMoods[mood]+'?');
	hideDiv('moodInput', 'statusBox');
	
	

}


//function to send mood data, including location and status msg to server


function updateMood(){
	
	console.log('updateMood running');
	
	
	$('#communication').html('<h1>Updating your mood...</h1>');
	
	hideDiv('statusBox', 'communication');
		
	//reset update status vars
	socialPublishFinished=false;
	dataRefreshed=false;
	//start update timer
	checkUpdateStatus();
	
	
	
	me.status=$('#status').val();
	console.log('updating mood, me.publishSocial='+me.publishSocial);
	
	$.ajax({
                type: "POST",
                url: baseURL+"/updateMood.php",
                data: {
                	"socialID": me.socialID,
                	"userID": me.ID,
                	"mood": me.moodNum,
                	"lat": me.lat,
                	"lng": me.lng,
                	"status": me.status,
                	"code": me.code
                	
                },
                success: function(res, status, xhr) {
                    updateMoodResponse(res);
                },
                error: function(data, status, xhr){
                	console.log ('ERROR! updateMood failed');
                	
                	$('#communication').html('<h1>Oops! Something went wrong.</h1><p>We couldn\'t talk to the Moodoo server. <br/>Please check your connection and try again in a few minutes.<br/> Your mood has not been updated.</p>');
                	showDiv('communication');
                	console.log ('data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	console.log(c+'='+data[c]);
	                	
                	}
                }
     });
	
	
	
	if (me.publishSocial==1){
		publishToSocial();
	} else {
		socialPublishFinished=true;
	}
	$('#status').val('');
}


//server updates mood and responds, handler:
function updateMoodResponse(res){
	
	console.log("updateMoodResponse running");
	console.log("res="+res);
		
	if (res){
		
		for (var keyname in res){
			console.log("res["+keyname+"]="+res[keyname]);
		
		}
		if (res["moodUpdated"]==true){
			
			console.log("Mood updated, refreshing data. me.ID="+me.ID);
			dataRefreshed=false;
			//refresh my data
			
			loadUser(me.ID, null);
			

		}
		
		else {
			
			console.log("ERROR: Something wrong with the MySQL query, mood not updated in database!");
		}
		
	} else {
		
		console.log("ERROR: no data returned from updateMood script!");
	}
	


	
} 

var checkUpdateStatusTick=0;

function checkUpdateStatus(){
	
	checkUpdateStatusTick++;
	
	updateMoodTimer=setTimeout("checkUpdateStatus()", 100);
	//if all update processes are done, stop animating logo, stop updateMoodTimer, remove wait div and refresh page with createDisplay
	
	
	
	if (socialPublishFinished && dataRefreshed){
		console.log('all processes complete');
		clearTimeout(updateMoodTimer);
		
		//createDisplay(me.rawData);
	}
	else if (checkUpdateStatusTick>50) {
		clearTimeout(updateMoodTimer);
	}
	else {
		console.log ('chaeckUpdateStatus tick:'+checkUpdateStatusTick+', socialPublishFinished='+socialPublishFinished+', dataRefreshed='+dataRefreshed);
	}	
}

//if user wants to change their mind about a mood before they update
function cancelUpdateAtStatus(){
	$('#status').val('');
	hideDiv('statusBox', 'moodInput');
}

////////////////////////////////////////
//DATA VISUALIZATION
//////////////////////////////////////

//canvas for the main mooderator graph
var canvas; 

//canvas context variable

var ctx;

var mooderatorHeight=300;
var mooderatorWidth=1000;

//normal background
var backgroundColour1="#47709E";
var backgroundColour2="#FFFFFF";

//background whilst dragging
var backgroundColour3="#3A5D7C";
var backgroundColour4="#FFFFFF";

//background when maximum drag left or right
var backgroundColour5="#FFFFFF";
var backgroundColour6="#47709E";


var startTime;
var timeSpan;
//border
var borderColour="#666666";

//is the user dragging the graph or not?
var dragging;

//init custom cursor
$('#mooderatorGraph').addClass('grab');

//from timeline - span of viewport in seconds - variable. I.e. how many seconds does the current viewport width represent?
var windowSpan;

//from timeline - width of the whole main timeline in pixels - default is window width
var pixelWidth;

//left scroll value - default is 0
var baseX=0;

var canvasPoints;

function drawMooderator() {  
	console.log('drawMooderator running');
	var moodData=me.updates;
	mooderatorWidth=$(window).width()-110;
	$('#mooderatorGraph').attr('width', $(window).width()-100);
	$('#mooderatorGraph').attr('height', mooderatorHeight);
	$('#mooderatorGraph').css('display', 'block');
	$('#mooderatorGraph').css('width', $(window).width()-100+'px');
	$('#mooderatorGraph').css('margin', '0px auto 0px auto');
	
	console.log('mooderatorWidth='+mooderatorWidth);
	
	
	//get no of seconds between first update and last update (timespan)
	
	var tempStartTime=moodData[0]["seconds"];
	var tempEndTime=moodData[moodData.length-1]["seconds"];
	
	
	
	var endTime;
	var tempTimespan=tempEndTime-tempStartTime;
	
	console.log('tempStartTime='+tempStartTime+', tempEndTime='+tempEndTime+', tempTimespan='+tempTimespan);
	
	
	
	timespan=tempTimespan;
	startTime=tempStartTime;
	
	
	
	
	
	
	
	//DO DRAWING ON CANVAS
	
	
	
	//register canvas
	canvas=document.getElementById('mooderatorGraph');
  	
  	if (canvas){
  		console.log('canvas exists');
  		if (canvas.getContext) {  
  			console.log('canvas.getContext exists');
	    	//new canvas context
	   		ctx = canvas.getContext("2d"); 
	   		drawOnCanvas(moodData);
	    }
	    else {
		    
		   console.log('drawmooderator - ERROR - no getContext method on canvas element');
	    }
  	}
  	else {
  		console.log('drawmooderator - ERROR -canvas isnt registered!');
  	}
	
	$('#mooderatorPopUpLabel').css('visibility', 'visible');
	
}
	
function drawOnCanvas(moodData){	   
    console.log('drawOnCanvas running');
    //array of each point on the graph
	var graphPoints=new Array();
	
	for (var k=0; k<moodData.length; k++){
		//get no of Seconds between this update and the first update
		var mySeconds=(moodData[k]["seconds"])-startTime;
		console.log('graphPoint '+k+': mySeconds='+mySeconds);
		//convert to ratio for drawing line graph
		graphPoints[k]=(mySeconds/timespan);
		
		console.log('graphPoints['+k+']='+graphPoints[k]);
	}
    
    //clear canvas
    ctx.clearRect (0, 0, 450, 150);
	
		     
	//set variable for min/max height for actual graph line
	var graphInnerHeight=mooderatorHeight-30;
	
	//vertical distance fraction btwn each point on the gradient
	
	var gradientGap=(1/10);
		
	
	ctx.lineWidth=0.5;
	
		
	ctx.lineCap='round';
	ctx.lineJoin='round';
   
    
   
    
    
    var heightRatio=graphInnerHeight/10;
    
    ctx.moveTo(5, (graphInnerHeight-(moodData[0]["mood"]*heightRatio)));
    ctx.beginPath();
    console.log('moodData.length='+moodData.length);
  	canvasPoints=new Array();
  
    //draw mood line graph
    for (var i=1; i<moodData.length; i++){
    	
		var graphX=(graphPoints[i]*mooderatorWidth+5);
		var nextGraphX=(graphPoints[i+1]*mooderatorWidth+5);
		
		var graphY=(10+graphInnerHeight-(moodData[i]["mood"]*heightRatio));
		
		
		
		

		//check to see if next point will be in visible zone; if so, draw from this point (so that the height of the line is correct at x=0px)
		if (!(nextGraphX<0)){
			
			//draw line to point
			ctx.lineTo(graphX, graphY);
			
			
			
			
			
			//store point in array
			
			canvasPoints.push({x:graphX, y:graphY, number:i, mood:moodData[i]["mood"]});
			console.log("canvasPoints["+i+"].x="+graphX+", y="+graphY);
	
		}
		
    	
    }
    
    
    ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    
	ctx.stroke();
	console.log('drawing mood Icons onto mooderator graph');
	
	//draw coloured circle points onto mooderator graph
	ctx.lineWidth = 0;
	
	for (var u=0; u<canvasPoints.length; u++){
    	var tempMoodNum=parseInt(canvasPoints[u].mood);
    	//trace('tempMoodNum='+tempMoodNum);
    	//trace('canvasPoints[u].x='+ canvasPoints[u].x);
		var tempMood=parseInt(canvasPoints[u].mood);
		ctx.fillStyle=colourArray[tempMoodNum];
		
		ctx.strokeStyle='#47709E';	
		
		ctx.lineWidth=2;
		
		var radius=4;
		
		console.log('drawing mooderator circles; canvasPoints[u].x='+canvasPoints[u].x+', canvasPoints[u].y='+canvasPoints[u].y);
		drawSolidCircle(ctx, canvasPoints[u].x, canvasPoints[u].y, radius);
    }
	
	
	
	
	
	
	

}


function createDisplay(value){
	drawMooderator();
	showDiv('mooderator');
	showDiv('moodInput');
	hideDiv('auth');
}


//scrolling/zooming functions for line graph

function zoomIn(){
	//store old pixel width in a temp var - this is so we can work out how much to pan left to compensate for stretching & make a smooth zoom
  	var oldMooderatorWidth=mooderatorWidth;
  	var oldCentre=Math.abs(baseX)+($('#mooderatorGraph').width()/2);
  	
  	mooderatorWidth=mooderatorWidth*1.25;
  	
  	var newCentre=(oldCentre/oldMooderatorWidth)*mooderatorWidth;
  	
  	
  	var scrollAmount=0;
  	
  	
  	
  	//conditional stops zoom from pushing timespans beyond 'now' point
  	console.log('baseX='+baseX);
  	if (baseX<startX) {
  		scrollAmount=newCentre-oldCentre;
  	
  	}
  	
  	console.log('baseX='+baseX);
  	console.log('oldMooderatorWidth='+oldMooderatorWidth);
  	console.log('mooderatorWidth='+mooderatorWidth);
 	console.log('oldCentre='+oldCentre);
 	console.log('newCentre='+newCentre);
 	console.log('scrollAmount='+scrollAmount);
  	
  	scrollRight(scrollAmount);
}


function zoomOut(){
	var oldMooderatorWidth=moooderatorWidth;
  	var oldCentre=Math.abs(baseX)+($('#mooderatorGraph').width()/2);
  	
	
	mooderatorWidth=mooderatorWidth*0.80;
	
	var newCentre=(oldCentre/oldMooderatorWidth)*mooderatorWidth;
  	

	var scrollAmount=oldCentre-newCentre;

	scrollLeft(scrollAmount);
}

function scrollLeft(amount){
	baseX+=amount;
	if (baseX>=startX){
		baseX=startX;
	}
	drawMooderator();
}

function scrollRight(amount){
	baseX-=amount;
	
	drawMooderator();
}



//////////////////////////////////////////
//MOUSE EVENT HANDLERS
////////////////////////////////////////

function onMouseOverGraph(e){
	console.log('mouseover on graph');
	$('#mooderatorGraph').mousemove(function(e2){
		
		onMouseMoveGraph(e2);
	});
	//changeClass('mooderator_graph', 'grab');
	
}

function onMouseOutGraph(e){
	console.log('mouseout graph');
	
	$('#mooderatorGraph').off('mousemove', $('#mooderatorGraph'), onMouseMoveGraph);
	hideToolTip();
	
		
}

function onMouseMoveGraph(e){
	console.log("onMouseMoveGraph");
	var graphOffset = $('#mooderatorGraph').offset();
	var mousePos={x: e.pageX-graphOffset.left, y: e.pageY-graphOffset.top};
	var hit=false;
	console.log("mousePos.x="+mousePos.x);
	console.log("mousePos.y="+mousePos.y);
	
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
		//dragPosA=dragPosB;
		//dragPosB=getCursorPosition(e, canvas);
		
		
		
		//scrollMooderator();
	}
	
}

function showToolTip(posX, posY, number){
	console.log("showToolTip running; $('#mooderatorGraph').offset().left="+$('#mooderatorGraph').offset().left+"; posX="+posX+"; posY="+posY);
	
			
	var arrayIndex=parseInt(number);
	
	console.log('arrayIndex='+arrayIndex);
	console.log("me.updates[arrayIndex].status="+me.updates[arrayIndex].status);
	
	var tempMoodNum=me.updates[arrayIndex].mood;
	
	
	
	$('#mooderatorPopUpLabel').html("<span style='font-size: 0.7em; color: #fff; margin:0px; padding:0px'>"+me.updates[arrayIndex].time+"</span> <br/> <span style='background-color:"+colourArray[me.updates[arrayIndex].mood]+"'>"+theMoods[me.updates[arrayIndex].mood]+"</span> "+me.updates[arrayIndex].status);
	
	$('#mooderatorPopUpLabel').css('height', posY+'px');
	$('#mooderatorPopUpLabel').css('top', $('#mooderatorGraph').offset().top+posY-$('#mooderatorPopUpLabel').height()+'px');
	
	
	var furthestX=$('#mooderatorPopUpLabel').offset().left+($('#mooderatorPopUpLabel').html().length*5);
	if (furthestX>$(window).width()){
		console.log('popUpLabel overlaps window');
		
		$('#mooderatorPopUpLabel').css('border-left', '0px');
		$('#mooderatorPopUpLabel').css('border-right', '1px #fff solid');
		
		$('#mooderatorPopUpLabel').css('text-align', 'right');
		$('#mooderatorPopUpLabel').css('margin-left', $('#mooderatorGraph').offset().left+posX-$('#mooderatorPopUpLabel').width()-20+'px');
	}
	
	else {
		
		$('#mooderatorPopUpLabel').css('border-right', '0px');
		$('#mooderatorPopUpLabel').css('border-left', '1px #fff solid');
		
		$('#mooderatorPopUpLabel').css('text-align', 'left');
		$('#mooderatorPopUpLabel').css('margin-left', $('#mooderatorGraph').offset().left+posX-1+'px');
	
	}
	
	$('#mooderatorPopUpLabel').css('visibility', 'visible');
	
	
}

function hideToolTip(){
	$('#mooderatorPopUpLabel').css('visibility', 'hidden');
	
	
}





///////////////////////////////
//LOCATION - Functions related to maps and geolocation APIs
///////////////////////////

//global vars for location services

var gl;

var geocoder; 
var geocoder2;

var locationTimer;

var timeSinceLocationQuery=0;

//sets timer for async location check
function locationTimeoutCheck(){
	console.log('locationTimeoutCheck tick');
	timeSinceLocationQuery+=100;
	if (timeSinceLocationQuery>10000){
		stopLocationTimer();
		manualLocate();
		
	}	else {
		locationTimer=setTimeout("locationTimeoutCheck()", 100);
	}
}
//stops location timer set in locationTimeoutCheck()
function stopLocationTimer(){
	console.log('stopLocationTimer running');
	clearTimeout(locationTimer);
	timeSinceLocationQuery=0;

}



//find the user's current location
function getLocation(){
	console.log('getLocation running');
	$('#communication').append('Attempting to retrieve your location, please wait...<br/>');
	locationTimeoutCheck();
	if (Modernizr.geolocation) {
	  // let's find out where you are!
	 	console.log('Modernizr.geolocation=true');
	    gl = navigator.geolocation;
		
	
	  	
	  	
	  	gl.getCurrentPosition(
        recordPosition,
        function errorCallback(error) {
            //do error handling
            console.log('geolocation error! error='+error);
            manualLocate();
            stopLocationTimer();
        },
        {
            maximumAge:Infinity,
            timeout:6000 
        }
        
    );
	  	
	  	
	  	
	} else {
	  //trace("cant get geolocation");
	  // no native geolocation support available :(
	  // maybe try Gears or another third-party solution
	  manualLocate();
	  stopLocationTimer();
	} 
	
	  
}


function manualLocate(){
	//trace("manualLocate running");
	$('#manualLocation').css('display', 'block');	
	 
}

function findMe(){
	//trace("findMe running");
	 
	
	
	var theAddress=$("#address").value;
	//trace('theAddress='+theAddress);
	encodeAddress(theAddress);
	
	
}


function encodeAddress(address) {
	console.log('encodeAddress running');
	$('#communication').innerHTML='Attempting to get your location from your address, please wait...<br/>';
	geocoder= new google.maps.Geocoder();
	geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
       
        var myPosition=results[0].geometry.location;
        console.log("geocoding successful; lat="+myPosition.lat()+", lng="+myPosition.lng());
        me.lat=myPosition.lat();
        me.lng=myPosition.lng();
        
        var addressLatLng=new google.maps.LatLng(me.lat, me.lng);
        console.log('calling getAddress from encodeAddress');
        getAddress(addressLatLng);
      	
       	stopLocationTimer();
        
      } else {
        console.log("Geocode was not successful for the following reason: " + status);
        
        
        stopLocationTimer();
      }
    });
}

function cancelUpdateAtGeocode(){
	$('#locationBox').css('display', 'none');
	
}

function updateWithoutLocation(){
	$('#changeLocationButton').css('display', 'none');
	
   
}

function recordPosition(position) {
  
  console.log("recordPosition running");
    me.lat=position.coords.latitude;
  me.lng=position.coords.longitude;
  var addressLatLng=new google.maps.LatLng(me.lat, me.lng);
        
  
  
 stopLocationTimer();
    console.log('calling getAddress from recordPosition');
  getAddress(addressLatLng);
}
 
function getAddress(latlng) {
	console.log('getAddress running; latlng='+latlng);
    
    var returnedAddress=' ';
   	
    
	geocoder2= new google.maps.Geocoder();
	   
 	if (latlng) {
        
        
       geocoder2.geocode({'latLng': latlng}, function(results, status){
	        if (status == google.maps.GeocoderStatus.OK){
	        	 var statusAddition='';
	            if (results[0]){    
	                returnedAddress=results[2].formatted_address;
	                
	                console.log('returnedAddress='+returnedAddress);
	                
				   	
				   statusAddition='in '+returnedAddress+'?';   	
	            }
	            else
	            {
	                console.log('reverse geocode: No results found');
	                statusAddition='<span style="font-size:3em">?</span>';
	            }
	            
	            
	            //$('#statusLabel').append(statusAddition+'<br/>');
	            $('#changeLocationButton').css('display', 'block');
	        }
	        else
	        {
	             console.log('Geocoder failed due to: '+ status);
	        }
	    });
         
     }

  	
}

////////////////////////////////
//SOCIAL MEDIA COMMUNICATION
//////////////////////////////

function publishToSocial(){
	//console.log("publishToSocial running");
	//console.log("me.moodNum="+me.moodNum);
	//console.log("me.mood="+me.mood);
	
	//var body = "is feeling "+me.mood.capitalize()+": "+me.status;
	
	/*var myAttachment = { 'name': 'name', 'href': ' <a href="http://www.moodoo.net" rel="nofollow">http://www.moodoo.net</a>', 'caption': 'Moodoo is a tool with which you can monitor your moods, share what you are feeling, get access to support in tough times and see mood patterns around the world.', 'description': body, 'media': [{ 'type': 'image', 'src': 'http://www.moodoo.net/images/'+me.mood+'.png', 'href': 'http://www.moodoo.net'}] }; */

	
	//var wallPost = {message : "is feeling "+me.mood.capitalize()+": "+me.status, picture: "http://www.moodoo.net/images/"+me.mood+".png"};
	
	
	
	/*FB.api('/me/feed', 'post', wallPost, function(response) {
	  if (!response || response.error) {
	    //alert('Error occured');
	  } else {
	    //alert('Post ID: ' + response);
	    facebookPublishFinished=true;
	    
	  }
	});*/
	

	socialPublishFinished=true;
	
}



/////////////////////////
//GENERAL UTILITIES
/////////////////////////


//validate that a textfield is not empty and contains only numeric characters

function validateNumeric(passedVar){
	var valid=true;
	var numericExpression = /^[0-9 +]+$/;
	
	if (passedVar){
		if (!passedVar.match(numericExpression)){
		
			valid=false;
		}
	}
	else {
		valid=false;
	}
	
	return valid;
}


//shows a div with fade & jump effect
function showDiv(divname){
	if ($('#'+divname).data('hidden')) {
		$('#'+divname).data('hidden', false);
		console.log('showing div '+divname);
		$('#'+divname).css('display', 'block');
		console.log('$(#'+divname+').css("display")='+$('#'+divname).css('display'));
		
		
		//$('#'+divname).css('position', 'relative');
			
		console.log('$(#'+divname+').data("myHeight")='+$('#'+divname).data('myHeight'));
		$('#'+divname).animate({
			
			height: $('#'+divname).data('myHeight'),
			
			
		}, 500, function(){
			$('#'+divname).css('visibility', 'visible');
			$('#'+divname).animate({
				top: '0px',
				opacity: 1,
				
			}, 500, function(){
				console.log('$(#'+divname+').css("display")='+$('#'+divname).css('display'));
				
			});
		});

	
	}//end if
	
}


var divToShow;
//hides a div with a fade & jump effect, shows another div if second parameter is passed
function hideDiv(divname, swapper){
	if (swapper){
			divToShow=swapper;
			
	}
	else {
			
			divToShow=null;
	}
	if ($('#'+divname).data('hidden')==false){
		$('#'+divname).data('hidden', true);
		console.log('hiding div '+divname+', swapper='+swapper);
		
		
		//store height to return to on reshow
		if ($('#'+divname).height()>0){
			$('#'+divname).data('myHeight', $('#'+divname).height());
		
			
		}
		
		console.log('$(#'+divname+').data("myHeight")='+$('#'+divname).data('myHeight'));
			
		//detach from the css flow
		//$('#'+divname).css('position', 'relative');
		//move up and fade out
		$('#'+divname).animate({
			top: '-150',
			opacity: 0,
			
		}, 500, function(){
			//main animation finished
			console.log('hideDiv animation finished. swapper= '+divToShow);
		
			
			$('#'+divname).css('visibility', 'hidden');
			//animate reduction in height for smooth transition for elements that are below hidden element
			$('#'+divname).animate({
				height: '0',
			
			}, 500, function(){
				//secondary animation finished.
				$('#'+divname).css('display', 'none');
				
				if (divToShow){
				
				showDiv(divToShow);
			}
			});
			
		});

	}//end if
	else {
		
		showDiv(divToShow);
	}
	
	
}


/////////////////////////
//GRAPHICS UTILITIES
/////////////////////////




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

function drawSolidCircle(context, centreX, centreY, radius){
	//trace('drawCircle running');
	
	context.beginPath(); 
	context.arc(centreX, centreY, radius, 0, Math.PI * 2, false); 
	context.closePath();
	
	context.stroke();
	context.fill();
}

