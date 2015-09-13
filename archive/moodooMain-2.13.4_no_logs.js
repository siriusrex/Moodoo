//Moodoo 2.0
//moodooMain.js
//Created 18 Dec 2013
//Copyright 2010-2013 John Galea



///////////////////////////////////
//GLOBAL VARS
//////////////////////////////////


var baseURL='https://www.moodoo.net/dev/test';

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

//GET Url var
var token=null;


//update status vars
var updateMoodTimer;
var socialPublishFinished=false;
var dataRefreshed=false;


/////////////////
//APP INITIALIZATION
///////////////////


//init function called from body element of index.html
function init() {
	//console.log('init running');
	
	token=getParameterByName('token');
	
	//console.log('token='+token);
	
	$('.section').each(function (){
		$(this).css('visibility', 'hidden');
		$(this).css('display', 'none');
		$(this).css('opacity', 0);
		$(this).data('myHeight', $(this).css('height'));
		$(this).css('height', 0);
		$(this).data('hidden', true);
	});
	
	
	
	
	//console.log('checking for cookie');
	if (validateNumeric($.cookie('moodooID'))){
		//console.log('cookie ID is numeric');
		if ($.cookie('moodooID')!='null'){
			hideDiv('auth');
			$('#results').append('<p>Caught cookie. User id is '+$.cookie('moodooID'));
			//console.log('<p>Caught cookie. User id is '+$.cookie('moodooID'));
			//console.log('sending cookie id to server');
			loadUser($.cookie('moodooID'), null);
		}

	}
	else if (token) {
		//had to add this hack for mobile ios 7+. Janrain only wants to redirect to URL, uses janrain_redirect.php to send the janrain token into the Get vars
		//get vars pu into 'token' var, fire script if this token exists. SHould log user in.
		$.ajax({
                type: "POST",
                url: "janrain_auth.php",
                data: "token=" + token,
                success: function(res, status, xhr) {
                    //console.log('res='+res+', status='+status+', xhr='+xhr);

                    for (var key in res){
                    	//console.log('res['+key+']='+res[key]);
                    }
					//console.log('identifier: '+res.profile.identifier);
                    //console.log('displayName: '+res.profile.displayName);
					//console.log('primaryKey: '+res.profile.primaryKey);
                   
                    //console.log('sending social info to server');
                    //console.log('trying to close janrain window');
                    janrain.engage.signin.modal.close();
                    loadUser(null, res.profile);
                },
                error: function(data, status, xhr){
                	//console.log('error when sending token to janrain');
                	/*//console.log ('data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	//console.log(c+'='+data[c]);
	                	
                	}*/
                }
        });
	}
	
	else {
		//console.log('cookie ID is invalid, reverting to janrain. janrainReady='+janrainReady);
		hideDiv('communication', 'auth');
		//showDiv('auth');
	}
	
	//setup fancy dynamic sizing of input field for mood status
	$('#status').focus(function(){
		$('#status').animate({
			width:100
		}, 100, function() {
			//animation complete
		});
	});
	$('#status').keypress(function(){
		//console.log('#status just received keypress');
		
		var statusValue=$('#status').val();
		var newWidth=statusValue.length*12;
		if (newWidth<100){
			newWidth=100;
		}
		$('#status').animate({
			width:newWidth
		}, 100, function() {
	   		 	//animation complete
	   	});

		
		
	});
	
	//change css styling of janrain social sign-on widget
	restyleJanrain();
	
	//add mouse handlers to mooderatorGraph
	$('#mooderatorGraph').mouseover(function(e){
		//console.log('mouseover on mooderator event');
		onMouseOverGraph(e);
	});
	
	$('#mooderatorGraph').mouseout(function(e){
		//console.log('mouseoout mooderator event');
		
		onMouseOutGraph(e);
	});
	
	
	$(window).resize(function(e){
		onViewportResize();
	});
	//add event listeners for touch events
	
	
	
	
	
    
	
	
	//console.log('init finished');
}


////////////////////////////////////////////////////////////
//JANRAIN AUTH - requires mooodoo_auth_main.php in same dir
///////////////////////////////////////////////////////////

//restyle janrain login box - this is a hack until I can pay Janrain enough for widget customization!

var janrainReady=false;
var restyleInterval;

function restyleJanrain() {
	//console.log('restyleJanrain running');
	$('#janrainEngageEmbed').css('visibility', 'hidden');
	$('#janrainEngageEmbed').css('margin-bottom', '50px');
	$('#janrainEngageEmbed').find('div').each(function(){
		$(this).attr('style', 'width: 100% !important;');
		$(this).css('text-align', 'center');
		$(this).css('font-family', '"Raleway", sans-serif;');
		$(this).css('font-size', '1em');
		$(this).css('color', '#fff');
		$(this).css('border', 'none');
		$(this).css('font-weight', '100');

		$(this).css('display', 'block');
		$(this).css('clear', 'both');
		
		$(this).css('background-color', 'transparent');
	});
	
	$('#janrainEngageEmbed').find('ul').attr('style', 'display: inline-block; margin:0px; padding:0px; list-style-type:none; width:190px !important; float:left');
	
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
	
	$('#janrainEngageEmbed').find('a').click(function (){
		$('#janrainEngageEmbed').css('visibility', 'hidden');
	
		//restyleInterval=window.setInterval(refreshTransparency, 10);


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
	
	$('.janrainHeader div').html('Sign in via your favourite social media service:');
	
	
	$('#janrainProviderPages').css('margin', '20px auto 20px auto');
	$('#janrainProviderPages').css('width', '380px');
	$('#janrainProviderPages').css('height', '400px');

	$('.janrainSwitchAccountLink').attr('style', 'display:none !important');
	
	/*
	
	$('#auth').css('background-color', 'yellow');
	$('#janrainEngageEmbed').css('background-color', 'red');
	$('#janrainEngageEmbed').find('div').attr('style', 'background-color: blue !important');
	$('#janrainEngageEmbed').find('div').width('100');
	
		*/
	janrainReady=true;
	
	//console.log('finished restyleJanrain code');
	$('#janrainEngageEmbed').css('visibility', 'visible');
}





//Janrain proprietary code to embed Social Network sign-on widget


(function() {
    if (typeof window.janrain !== 'object') window.janrain = {};
    if (typeof window.janrain.settings !== 'object') window.janrain.settings = {};
    
    janrain.settings.tokenUrl = baseURL+'/janrain_redirect.php';
	janrain.settings.type='embed';
	janrain.settings.tokenAction='hybrid';
	janrain.settings.poup='false';
	
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
   
    //console.log('widget loaded');
    
    
   
    
     
   janrain.events.onProviderLoginStart.addHandler(function(response) {
		//console.log("Login Started");
		
	});
    
    
   janrain.events.onProviderLoginCancel.addHandler(function(response) {
		//console.log("Login Cancelled!");
		//console.log('trying to close janrain window');
                    
		janrain.engage.signin.modal.close();
		signUserOut();
	});
    
    
    janrain.events.onProviderLoginComplete.addHandler(function(response) {
    	//console.log("Login complete - either successful or unsuccessful");
		//console.log('trying to close janrain window');
                    
		janrain.engage.signin.modal.close();
    });

    
    janrain.events.onProviderLoginToken.addHandler(function(response) {
        clearInterval(restyleInterval);
        //console.log('got response: '+response.token);
        $.ajax({
                type: "POST",
                url: "janrain_auth.php",
                data: "token=" + response.token,
                success: function(res, status, xhr) {
                    //console.log('res='+res+', status='+status+', xhr='+xhr);

                    for (var key in res){
                    	//console.log('res['+key+']='+res[key]);
                    }
					//console.log('identifier: '+res.profile.identifier);
                    //console.log('displayName: '+res.profile.displayName);
					//console.log('primaryKey: '+res.profile.primaryKey);
                    
                    //console.log('sending social info to server');
                    //console.log('trying to close janrain window');
                    janrain.engage.signin.modal.close();
                    loadUser(null, res.profile);
                },
                error: function(data, status, xhr){
                	//console.log('error when sending token to janrain');
                	/*//console.log ('data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	//console.log(c+'='+data[c]);
	                	
                	}*/
                }
        });
	});
		
}	


//timer to close jainrain popup window if it stalls
//not currently used as modal.close() is not working. See get vars solution in init() function for redirect on mobile

/*
var timeSinceJanrainTimerStart=0;

//sets timer for async location check
function janrainWindowTimerCheck(){
	timeSinceJanrainTimerStart+=100;
	//console.log('janrainWindowTimerCheck tick, timeSinceJanrainTimerStart='+timeSinceJanrainTimerStart);
	
	if (timeSinceJanrainTimerStart>5000){
		stopJanrainWindowTimer();
		
		
	}	else {
		jainrainWindowTimer=setTimeout("janrainWindowTimerCheck()", 100);
	}
}
//stops  timer set in janrainWindowTimerCheck()
function stopJanrainWindowTimer(){
	//console.log('stopJanrainWindowTimer running');
	clearTimeout(jainrainWindowTimer);
	
	timeSinceJanrainTimerStart=0;
	
	//console.log('trying to close janrain window');
                    
		janrain.engage.signin.modal.close();

}*/


////////////////////////////////////////
//GETTING USER DATA
///////////////////////////////////////

//function loadUser
//takes either userID from cookie or socialProfile ID from Janrain social sign-on and 
//queries Moodoo database to retrieve personal data including mood updates


function loadUser(userID, socialProfile) {
	  //console.log('loadUser running; userID='+userID+', socialProfile='+socialProfile);
	   $('#communication').html('<h1>Loading your data...</h1>');
	  
	  
	  showDiv('communication');
	  if (userID){
	 
	  
	  //console.log('sending userID from cookie to server, userID='+userID);
	  
	  $.ajax({
                type: "POST",
                url: "moodoo_auth_main.php",
                data: {
                	"userID": userID
            	},
                success: function(res, status, xhr) {
                    //console.log('cookie data send success! server says: res='+res+', status='+status+', xhr='+xhr);
					
					
					//console.log('php log:' +res.log);
					//console.log('submitted query:' +res.query);
                    //console.log('create user query:' +res.createQuery);
                    //console.log('new user ID:' +res.newuserID);
                    
                    //console.log('query success:' +res.success);
                    //console.log('social ID:' +res.socialID);
                    //console.log('user ID:' +res.userID);
                    
                    //console.log('firstName:'+ res.firstName);
                   	//console.log('lastName:'+ res.lastName);
                    //console.log('email:'+ res.email);
                    //console.log('publishSocial:'+ res.publishSocial);
                    //console.log('publishToMoodoo:'+ res.publishToMoodoo);
                    //console.log('allowLocation:'+ res.allowLocation);
                    //console.log('reminder:'+ res.reminder);
                   	//console.log('updates:'+ res.updates); 
                    
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
	                	////console.log('updates['+k+'].seconds='+res.updates[k].seconds);
	                	
                	}
                	
                	onDataRefreshed();
                	
                	
                    
                },
                error: function(data, status, xhr){
                	//console.log ('ERROR! while trying to send cookie ID to server. data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	//console.log(c+'='+data[c]);
	                	
                	}
                }
        });			
	  
	  }
	  
	  else if (socialProfile) {
	   
	   
		//console.log('sending socialProfile from janrain to moodoo server, socialProfile.identifier='+socialProfile.identifier);
		if (socialProfile.name){
		  
		  me.firstName=socialProfile.name.givenName;
		
					
		  me.lastName=socialProfile.name.familyName;
						
		}
	  
	   
	   $.ajax({
                type: "POST",
                url: "moodoo_auth_main.php",
                data: {
                	"userID": userID,
                	"firstName":me.firstName,
                	"lastName":me.lastName,
                	"socialID": socialProfile.identifier,
                	"email": socialProfile.email
                },
                success: function(res, status, xhr) {
                    //console.log('socialProfile send success! server says: res='+res+', status='+status+', xhr='+xhr);
					
					for (var key in res){
						//console.log('looking at data; res['+key+']='+res[key]);
					}
					
					//console.log('submitted query:' +res.query);
                    //console.log('query success:' +res.success);
                   // //console.log('create user query:' +res.createQuery);
                    //console.log('new user ID:' +res.newuserID);
                    
                    //console.log('user ID:' +res.userID);
                   
                    //console.log('social ID:' +res.socialID);
                    //console.log('name:'+ res.name);
                    //console.log('firstName:'+ res.firstName);
                   
                   	//console.log('lastName:'+ res.lastName);
                    //console.log('email:'+ res.email);
                    //console.log('publishSocial:'+ res.publishSocial);
                    //console.log('publishToMoodoo:'+ res.publishToMoodoo);
                    //console.log('allowLocation:'+ res.allowLocation);
                    //console.log('reminder:'+ res.reminder); 
                    //console.log('php log:'+ res.log); 
                    //console.log('updates:'+ res.updates); 
                    
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
	                	////console.log('updates[k]='+res.updates[k]);
	                	
                	}
                    
                     //put returned ID in cookie
                     
                     $.cookie('moodooID', res.userID);
                     //console.log('trying to access cookie:' +$.cookie('moodooID') );
                    
                     onDataRefreshed();
                },
                error: function(data, status, xhr){
                	//console.log ('ERROR! while trying to send social ID to server. data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	//console.log(c+'='+data[c]);
	                	
                	}
                }
        });	
        
        }
        
        else {
        
        	//console.log('ERROR: neither cookie id nor socialProfile passed to loadUser function');
        }		
        
}


function onDataRefreshed() {
	//$('#moodQuestion').html('Hey '+me.firstName+'! How are you feeling right now?');
    
	
	//signal that data has been reloaded for when updateMood calls this function
    
    dataRefreshed=true;
    
    
    
    showDiv('moodInput');
    //initiate data visualization code
	createDisplay();
}


function signUserOut(){
	$.cookie('moodooID', null);
	token=null;
	window.open(baseURL, '_self');
}


////////////////////////////
//UPDATES
///////////////////////////

//function to set mood for update

function setMood(mood){
	//console.log('setMood running');
	
	
	

	//$('#communication').html('<p>Setting Mood</p>');
	
	
	
	//console.log('theMoods[mood]='+theMoods[mood]);
	
	
	
	me.moodNum=mood;
	getLocation();
	$('#statusLabel').html('Why are you feeling '+theMoods[mood]+'?');
	hideDiv('moodInput', 'statusBox');
	
	

}


//function to send mood data, including location and status msg to server


function updateMood(){
	
	//console.log('updateMood running');
	
	
	$('#communication').html('<h1>Updating your mood...</h1>');
	
	hideDiv('statusBox', 'communication');
		
	//reset update status vars
	socialPublishFinished=false;
	dataRefreshed=false;
	//start update timer
	checkUpdateStatus();
	
	
	
	me.status=escape($('#status').val());
	//console.log('about to update status, me.status='+me.status);
	
	//console.log('updating mood, me.publishSocial='+me.publishSocial);
	
	$.ajax({
                type: "POST",
                url: "updateMood.php",
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
                    //console.log ('updateMood data sent successfully');
                    updateMoodResponse(res);
                    
                },
                error: function(data, status, xhr){
                	//console.log ('ERROR! updateMood failed');
                	
                	$('#communication').html('<h1>Oops! Something went wrong.</h1><p>We couldn\'t talk to the Moodoo server. <br/>Please check your connection and try again in a few minutes.<br/> Your mood has not been updated.</p>');
                	showDiv('communication');
                	//console.log ('data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	//console.log(c+'='+data[c]);
	                	
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
	
	//console.log("updateMoodResponse running");
	//console.log("res="+res);
		
	if (res){
		
		for (var keyname in res){
			//console.log("res["+keyname+"]="+res[keyname]);
		
		}
		if (res["moodUpdated"]==true){
			
			//console.log("Mood updated, refreshing data. me.ID="+me.ID);
			dataRefreshed=false;
			//refresh my data
			
			loadUser(me.ID, null);
			

		}
		
		else {
			
			//console.log("ERROR: Something wrong with the MySQL query, mood not updated in database!");
		}
		
	} else {
		
		//console.log("ERROR: no data returned from updateMood script!");
	}
	


	
} 

var checkUpdateStatusTick=0;

function checkUpdateStatus(){
	//console.log('checkUpdateStatus running');
		
	checkUpdateStatusTick++;
	
	updateMoodTimer=setTimeout("checkUpdateStatus()", 100);
	//if all update processes are done, stop animating logo, stop updateMoodTimer, remove wait div and refresh page with createDisplay
	
	
	
	if (socialPublishFinished && dataRefreshed){
		//console.log('all processes complete');
		clearTimeout(updateMoodTimer);
		
		//createDisplay(me.rawData);
	}
	else if (checkUpdateStatusTick>50) {
		clearTimeout(updateMoodTimer);
	}
	else {
		//console.log ('chaeckUpdateStatus tick:'+checkUpdateStatusTick+', socialPublishFinished='+socialPublishFinished+', dataRefreshed='+dataRefreshed);
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
var ctxMini;

var mooderatorHeight=300;
var viewportWidth=$(window).width()-110;
var mooderatorWidth=viewportWidth;

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

//dragging minigraph slider
var dragOffset;
var rightMargin;


//init custom cursor
$('#mooderatorGraph').addClass('grab');

//from timeline - span of viewport in seconds - variable. I.e. how many seconds does the current viewport width represent?
var windowSpan;

//from timeline - width of the whole main timeline in pixels - default is window width
var pixelWidth;

//left scroll value - default is 0
var baseX=0;
var miniBaseX=0;
var baseXRatio=0;

var canvasPoints;

//these values store the current slider width and position relative to the viewport size, so that when viewport is resized the slider can be accurately resized
var sliderWidthRatio=0.9;
var sliderPosRatio=0;
var mooderatorZoomRatio=1;

function drawMooderator() {  
	
	//check current width of the graph viewport (area covered by graph)
	viewportWidth=$(window).width()-110;
	//mooderatorWidth=viewportWidth;
	
	//console.log('drawMooderator running');
	var moodData=me.updates;
	
	$('#mooderatorGraph').attr('width', $(window).width()-100);
	$('#mooderatorGraph').attr('height', mooderatorHeight);
	$('#mooderatorGraph').css('display', 'block');
	$('#mooderatorGraph').css('width', $(window).width()-100+'px');
	$('#mooderatorGraph').css('margin', '0px auto 0px auto');

	
	////console.log('at drawmooderator, moodData='+moodData);
	
	////console.log('mooderatorWidth='+mooderatorWidth);
	
	
	//get no of seconds between first update and last update (timespan)
	
	var tempStartTime=moodData[0]["seconds"];
	var tempEndTime=moodData[moodData.length-1]["seconds"];
	
	
	
	var endTime;
	var tempTimespan=tempEndTime-tempStartTime;
	
	////console.log('tempStartTime='+tempStartTime+', tempEndTime='+tempEndTime+', tempTimespan='+tempTimespan);
	
	
	
	timespan=tempTimespan;
	startTime=tempStartTime;
	
	
	
	
	
	
	
	//DO DRAWING ON CANVAS
	
	
	
	//register canvas
	canvas=document.getElementById('mooderatorGraph');
  	
  	if (canvas){
  		////console.log('canvas exists');
  		if (canvas.getContext) {  
  			////console.log('canvas.getContext exists');
	    	//new canvas context
	   		ctx = canvas.getContext("2d"); 
	   		drawGraph(moodData);
	    }
	    else {
		    
		   //console.log('drawmooderator - ERROR - no getContext method on canvas element');
	    }
  	}
  	else {
  		//console.log('drawmooderator - ERROR -canvas isnt registered!');
  	}
  	
  		
	
	
}
	
function drawGraph(moodData){	   
    //console.log('drawGraph running');
    //array of each point on the graph
	var graphPoints=new Array();
	
	for (var k=0; k<moodData.length; k++){
		//get no of Seconds between this update and the first update
		var mySeconds=(moodData[k]["seconds"])-startTime;
		////console.log('graphPoint '+k+': mySeconds='+mySeconds);
		//convert to ratio for drawing line graph
		graphPoints[k]=(mySeconds/timespan);
		
		////console.log('graphPoints['+k+']='+graphPoints[k]);
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
    
    ctx.moveTo(baseX, (graphInnerHeight-(moodData[0]["mood"]*heightRatio)));
    ctx.beginPath();
    ////console.log('moodData.length='+moodData.length);
  	canvasPoints=new Array();
  
    //draw mood line graph
    for (var i=0; i<moodData.length; i++){
    	
		var graphX=(graphPoints[i]*mooderatorWidth+baseX+5);
		var nextGraphX=(graphPoints[i+1]*mooderatorWidth+baseX+5);
		
		var graphY=(10+graphInnerHeight-(moodData[i]["mood"]*heightRatio));
		
		
		
		

		//check to see if next point will be in visible zone; if so, draw from this point (so that the height of the line is correct at x=0px)
		if (!(nextGraphX<0)){
			
			//draw line to point
			ctx.lineTo(graphX, graphY);
			
			
			
			
			
			//store point in array
			
			canvasPoints.push({x:graphX, y:graphY, number:i, mood:moodData[i]["mood"]});
			////console.log("canvasPoints["+i+"].x="+graphX+", y="+graphY);
	
		}
		
    	
    }
    
    
    ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    
	ctx.stroke();
	////console.log('drawing mood Icons onto mooderator graph');
	
	//draw coloured circle points onto mooderator graph
	ctx.lineWidth = 0;
	
	for (var u=0; u<canvasPoints.length; u++){
    	var tempMoodNum=parseInt(canvasPoints[u].mood);
    	
		var tempMood=parseInt(canvasPoints[u].mood);
		ctx.fillStyle=colourArray[tempMoodNum];
		
		ctx.strokeStyle='#47709E';	
		
		ctx.lineWidth=2;
		
		var radius=4;
		
		////console.log('drawing mooderator circles; canvasPoints[u].x='+canvasPoints[u].x+', canvasPoints[u].y='+canvasPoints[u].y);
		drawSolidCircle(ctx, canvasPoints[u].x, canvasPoints[u].y, radius);
    }
	
	
	
	showDiv('mooderator');
	
	
	

}

function drawMooderatorControl(){
	//console.log('drawMooderatorControl running');
	
	
	$('#miniGraph').attr('width', viewportWidth);
	$('#miniGraph').attr('height', 80);
	$('#miniGraph').width(viewportWidth);
	if($('#miniGraphSlider').width()>viewportWidth){
		$('#miniGraphSlider').width(viewportWidth);
	}
	$('#miniGraphSlider').css('margin-left', 'auto');
	$('#miniGraphSlider').css('margin-right', 'auto');
	
	
	$('#miniGraph').css('display', 'block');
	$('#miniGraph').css('margin', '0px auto 100px auto');

	
	//register canvas
	 canvasMini=document.getElementById('miniGraph');
  	
  	
  	if (canvasMini){
  		////console.log('canvasMini exists');
  		if (canvasMini.getContext) {  
  			////console.log('canvasMini.getContext exists');
	    	//new canvas context
	   		ctxMini = canvasMini.getContext("2d"); 
	   		drawMiniGraph(me.updates);
	    }
	    else {
		    
		   //console.log('drawmooderator - ERROR - no getContext method on canvasMini element');
	    }
  	}
  	else {
  		//console.log('drawmooderator - ERROR -canvasMini isnt registered!');
  	}

}


function drawMiniGraph(moodData){	   
    //console.log('drawMiniGraph running');
    
   
    
    //array of each point on the graph
	var graphMiniPoints=new Array();
	
	for (var k=0; k<moodData.length; k++){
		//get no of Seconds between this update and the first update
		var mySeconds=(moodData[k]["seconds"])-startTime;
		////console.log('graphPoint '+k+': mySeconds='+mySeconds);
		//convert to ratio for drawing line graph
		graphMiniPoints[k]=(mySeconds/timespan);
		
		////console.log('graphPoints['+k+']='+graphMiniPoints[k]);
	}
    
    //clear canvas
    ctxMini.clearRect (0, 0, 450, 150);
	////console.log('clearing mini canvas');
		     
	//set variable for min/max height for actual graph line
	var graphMiniInnerHeight=50;
	
	//vertical distance fraction btwn each point on the gradient
	
	var gradientGap=(1/10);
		
	
	ctxMini.lineWidth=0.5;
	
		
	ctxMini.lineCap='round';
	ctxMini.lineJoin='round';
   
    
   
    
    
    var heightRatio=graphMiniInnerHeight/10;
    
    ctxMini.moveTo(miniBaseX, (graphMiniInnerHeight-(moodData[0]["mood"]*heightRatio)));
    ctxMini.beginPath();
   // //console.log('moodData.length='+moodData.length);
  	canvasMiniPoints=new Array();
  
    //draw mood line graph
    for (var i=0; i<moodData.length; i++){
    	
		var graphX=(graphMiniPoints[i]*viewportWidth+miniBaseX+5);
		var nextGraphX=(graphMiniPoints[i+1]*viewportWidth+miniBaseX+5);
		
		var graphY=(10+graphMiniInnerHeight-(moodData[i]["mood"]*heightRatio));
		
		
		
		

		//check to see if next point will be in visible zone; if so, draw from this point (so that the height of the line is correct at x=0px)
		if (!(nextGraphX<0)){
			
			//draw line to point
			ctxMini.lineTo(graphX, graphY);
			
			
			
			
			
			//store point in array
			
			canvasMiniPoints.push({x:graphX, y:graphY, number:i, mood:moodData[i]["mood"]});
			////console.log("canvasMiniPoints["+i+"].x="+graphX+", y="+graphY);
	
		}
		
    	
    }
    
    
    ctxMini.strokeStyle = "rgba(255, 255, 255, 1)";
    
	ctxMini.stroke();
		
	
	
	 
	
	

}



function setMiniGraphSlider(){
	//console.log('setMiniGraphSlider running');
	
	//set margin and offset for slider
	
	$('#miniGraphSlider').css('margin', '0px 0px');
	
	$('#miniGraphSlider').offset({top: $('#miniGraphSlider').offset().top, left: 55});
	

	
	
	
	//set mouse event handlers for slider	
	
	$('#sliderHandleRight').mousedown(function(e){
		onMouseDownSliderRight(e);
	});
	$('#sliderHandleLeft').mousedown(function(e){
		//console.log('mousedown on slider left handle');
		onMouseDownSliderLeft(e);
	});
	
	$('#miniGraphSlider').mousedown(function(e){
		//console.log('mousedown on slider body');
		onMouseDownSliderBody(e);
	});
	
	$(document).mouseup(function(e){
		onMouseUpSlider(e);
	});
	
	
	
	
	
	//set touch event handlers for slider
	
	$('#sliderHandleRight').on('touchstart', function(e){
		//console.log('touch on slider right handle');
		onTouchStartSliderRight(e);
	});
	
	$('#sliderHandleLeft').on('touchstart',function(e){
		//console.log('touch on slider left handle');
		onTouchStartSliderLeft(e);
	});
	
	$('#miniGraphSlider').on('touchstart', function(e){
		onTouchStartSliderBody(e);
	});
	
	//if touch is detected anywhere on page, remove mouse event listeners as they conflict with touch events
	$(document).on('touchstart', function(e){
		removeSliderMouseEvents();
	});
	
	
	$(document).on('touchend', function(e){
		onTouchEndSlider(e);
	});
	
	$(document).on("touchcancel", function(e){
		onTouchEndSlider(e);
	});

}

//removes mouse event listeners from minigraph slider and mouseup listener from document
function removeSliderMouseEvents() {
	$('#miniGraphSlider').off('mousedown');
	$('#miniGraphSlider').off('mousemove');
	$('#sliderHandleRight').off('mousedown');
	$('#sliderHandleLeft').off('mousedown');
	//$(document).off('mouseup');
}

//scrolling/zooming functions for line graph

function zoomIn(){
	//console.log('zoomIn running, mooderatorWidth='+mooderatorWidth);
	//store old pixel width in a temp var - this is so we can work out how much to pan left to compensate for stretching & make a smooth zoom
  	var oldMooderatorWidth=mooderatorWidth;
  	var oldCentre=Math.abs(baseX)+(($('#mooderatorGraph').width()-10)/2);
  	
  	mooderatorWidth=mooderatorWidth*1.25;
  	
  	var newCentre=(oldCentre/oldMooderatorWidth)*mooderatorWidth;
  	
  	
  	var scrollAmount=0;
  	
  	
  	
  	//conditional stops zoom from pushing timespans beyond 'now' point
  	//console.log('baseX='+baseX);
  	//if (baseX<startX) {
  		scrollAmount=newCentre-oldCentre;
  	
  	//}
  	
  	//console.log('baseX='+baseX);
  	//console.log('oldMooderatorWidth='+oldMooderatorWidth);
  	//console.log('mooderatorWidth='+mooderatorWidth);
 	//console.log('oldCentre='+oldCentre);
 	//console.log('newCentre='+newCentre);
 	//console.log('scrollAmount='+scrollAmount);
  	
  	scrollRight(scrollAmount);
}


function zoomOut(){
	//console.log('zoomOut running, mooderatorWidth='+mooderatorWidth);
	
	var oldMooderatorWidth=mooderatorWidth;
  	var oldCentre=Math.abs(baseX)+(($('#mooderatorGraph').width()-10)/2);
  	
	
	mooderatorWidth=mooderatorWidth*0.80;
	
	if (mooderatorWidth<($('#mooderatorGraph').width()-10)){
		
		mooderatorWidth=($('#mooderatorGraph').width()-10);
	}
	
	var newCentre=(oldCentre/oldMooderatorWidth)*mooderatorWidth;
  	

	var scrollAmount=oldCentre-newCentre;

	scrollLeft(scrollAmount);
}



//scrolling/zooming functions for line graph

function zoomTo(sliceWidth, slicePos){
	////console.log('zoomTo running, mooderatorWidth='+mooderatorWidth+', sliceWidth='+sliceWidth+', slicePos='+slicePos);
	//store old pixel width in a temp var - this is so we can work out how much to pan left to compensate for stretching & make a smooth zoom
  	var oldMooderatorWidth=mooderatorWidth;
  	var oldCentre=Math.abs(baseX)+(($('#mooderatorGraph').width()-10)/2);
  	
  	////console.log('viewportWidth='+viewportWidth);
  	
  	////console.log('sliceWidth='+sliceWidth);
  	
  	
  	mooderatorWidth=viewportWidth*viewportWidth/sliceWidth;
  	
  	
  	
  	
  	
  	var scrollAmount=0;
  	
  	//new way of calculating scroll amount: get x pos of slider & multiply by ratio of slider to mooderatorWidth to work out x pos of big graph
  	
  	var smallToBigRatio=mooderatorWidth/viewportWidth;
  	scrollAmount=slicePos*smallToBigRatio;
  	
  	
  	
  	
  
  	
  	////console.log('baseX='+baseX);
  	////console.log('oldMooderatorWidth='+oldMooderatorWidth);
  	////console.log('mooderatorWidth='+mooderatorWidth);
 	////console.log('smallToBigRatio='+smallToBigRatio);
 	
 	
 	////console.log('scrollAmount='+scrollAmount);
  	
  	
  	baseX=-scrollAmount;
	
	//store scrollAmount as percentage of window width for window rezize handler
	baseXRatio=scrollAmount/$(window).width();
	
	
	
	drawMooderator();
}




function scrollLeft(amount){
	if (!amount){
	
		amount=10;
	}
	baseX+=amount;
	if (baseX>=0){
		baseX=0;
	}
	drawMooderator();
}

function scrollRight(amount){
	if (!amount){
		amount=10;
	}
	
	baseX-=amount;
	
	drawMooderator();
}



function createMoodPie(){
	//console.log('createMoodPie running');	

	noOfUpdates=me.updates.length;
	//console.log('noOfUpdates='+noOfUpdates);	
	var moodFrequency=new Array(0,0,0,0,0,0,0,0,0,0);
	
	var pieSlicePercentages=new Array();
	
	for (var z=0; z<me.updates.length; z++){
		var thisMood=parseInt(me.updates[z].mood);
		moodFrequency[thisMood]+=1;
		
		
		
	}
	//console.log('moodFrequency='+moodFrequency);	
	
	
	
	for (var p in moodFrequency){
		if (moodFrequency[p]>0){
			var tempPercentage=parseInt(moodFrequency[p])/noOfUpdates;
			////console.log('pushing new pieSlicePercentage: number='+tempPercentage+'; colour='+colourArray[p]);
			pieSlicePercentages.push(new Object({number:tempPercentage, colour:colourArray[p]}));
		}
	}
	//console.log('pieSlicePercentages='+pieSlicePercentages);
	
	
	var pieWidth=viewportWidth/2;
	$('#moodPie').data('myHeight', pieWidth+200);
	
	$('#moodPieGraph').attr('width', pieWidth);
	$('#moodPieGraph').attr('height', pieWidth);
	$('#moodPieGraph').css('margin-left', 'auto');
	$('#moodPieGraph').css('margin-right', 'auto');
	
	//console.log('pieWidth='+pieWidth);
		
	drawPie(pieSlicePercentages, (pieWidth/2));
}

function drawPie(percentages, theRadius){
	//console.log('drawPie running');
	var pieCanvas=document.getElementById('moodPieGraph');


	
	if (pieCanvas.getContext){
		var pieContext = pieCanvas.getContext("2d");
	}
	
	pieContext.lineWidth=1;
	pieContext.lineCap='round';
	pieContext.lineJoin='round';
	   
	    
	   
	
	
	var lastAngle=0;
	for (var g=0; g<percentages.length; g++){
		////console.log('lastAngle='+lastAngle);
		
		pieContext.beginPath();
		pieContext.moveTo(theRadius, theRadius);
		
		
		////console.log('percentages[g].colour='+percentages[g].colour);
		////console.log('percentages[g].number='+percentages[g].number);
		
		var pieGrad = pieContext.createLinearGradient(0,0,0,300);
		
		pieGrad.addColorStop(0, percentages[g].colour);
		
		
		pieGrad.addColorStop(1, "#000000");
		
		
		pieContext.fillStyle=percentages[g].colour;
		
		var angle=(Math.PI*2)*percentages[g].number;
		////console.log('angle='+angle);
		pieContext.arc(theRadius, theRadius, theRadius, lastAngle-0.01, lastAngle+angle+0.01, false);
		pieContext.closePath();
		pieContext.fill();
		lastAngle+=angle;
	}
	
	
	showDiv('moodPie');
}


function createDisplay(value){
	//console.log('createDisplay running; me.updates='+me.updates);
	if (me.updates){
		if (me.updates.length>1){
			
			$('#communication').html("<h1>Hey, "+me.firstName+", how are you feeling right now?</h1>");
			showDiv('communication');
			drawMooderator();
	
			drawMooderatorControl();
			createMoodPie();
		}
		else {
			$('#communication').html("<h1>Less than 2 Mood Updates</h1><p>Hey, "+me.firstName+", it looks like you've updated your mood less than twice so far. To really see what Moodoo can do, let us know how you're feeling now!</p>");
			showDiv('communication');
		}
	}
	
	else {
		$('#communication').html("<h1>No Mood Updates</h1><p>Hey, "+me.firstName+", it looks like you haven't done any mood updates yet. To get started with Moodoo, let us know how you're feeling now!</p>");
		showDiv('communication');
	}
	
	
	setMiniGraphSlider();
	
	showDiv('moodInput');
	showDiv('signOut');
	hideDiv('auth');
}


function onViewportResize(){
	//console.log('onViewportResize running');
	
	
	
	
	var newViewportWidth=$(window).width()-110;
	
	var newSliderWidth=$(window).width()*sliderWidthRatio;
	
	var newSliderPos=newViewportWidth*sliderPosRatio;
	
	var newMooderatorWidth=newViewportWidth*mooderatorZoomRatio;
	
	var newBaseX=newViewportWidth*baseXRatio;
	//console.log('newSliderWidth='+newSliderWidth+', newSliderPos='+newSliderPos+', mooderatorZoomRatio='+mooderatorZoomRatio);
	
	
	$('#miniGraphSlider').css('width', newSliderWidth+'px');
	
	
	
	$('#miniGraphSlider').offset({top:$('#miniGraphSlider').offset().top, left: newSliderPos});
	
	mooderatorWidth=newMooderatorWidth;
	viewportWidth=newViewportWidth;
	baseX=-newBaseX;
	if (me.updates){
		if (me.updates.length>1){
			drawMooderator();
			drawMooderatorControl();
			
		}
	}
}



//////////////////////////////////////////
//MOUSE EVENT HANDLERS
////////////////////////////////////////

function onMouseOverGraph(e){
	//console.log('mouseover on graph');
	$('#mooderatorGraph').mousemove(function(e2){
		
		onMouseMoveGraph(e2);
	});
	//changeClass('mooderator_graph', 'grab');
	
}

function onMouseOutGraph(e){
	//console.log('mouseout graph');
	
	$('#mooderatorGraph').off('mousemove', $('#mooderatorGraph'), onMouseMoveGraph);
	hideToolTip();
	
		
}

function onMouseMoveGraph(e){
	//console.log("onMouseMoveGraph");
	var graphOffset = $('#mooderatorGraph').offset();
	var mousePos={x: e.pageX-graphOffset.left, y: e.pageY-graphOffset.top};
	var hit=false;
	////console.log("mousePos.x="+mousePos.x);
	////console.log("mousePos.y="+mousePos.y);
	
	
	for (var i=0; i<canvasPoints.length; i++){	
		var testX=Math.round(canvasPoints[i].x);
		var testY=Math.round(canvasPoints[i].y);
		
		////console.log("testX="+testX);
		////console.log("testY="+testY);
		
		
		if ((testX>(mousePos.x-20) && testX<(mousePos.x+20)) && ((testY>(mousePos.y-20)) && (testY<(mousePos.y+20)))){
			//console.log("hit");
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

function onMouseDownSliderLeft(e){
	//console.log('mousedown on slider left handle');
	if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}
	
	if (e.stopPropagation) { 
		e.stopPropagation();
	} 
	
	rightMargin=$(window).width()-$('#miniGraphSlider').offset().left-$('#miniGraphSlider').width()-50;
	
	$(document).mousemove(function(e2){
		
		onMouseMoveSlider(e2, 'left');
	});
	
	

}

function onMouseDownSliderRight(e){
	//console.log('mousedown on slider right handle');
	if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}
	if (e.stopPropagation) { 
		e.stopPropagation();
	} 
	rightMargin=$(window).width()-$('#miniGraphSlider').offset().left-$('#miniGraphSlider').width()-50;
		
	$(document).mousemove(function(e2){
		
		onMouseMoveSlider(e2, 'right');
	});
	
	$(document).on('touchMove', function(e3){
		
		onTouchMoveSlider(e3, 'right');
	});


}

function onMouseDownSliderBody(e){
	//console.log('mousedown on slider body');
	if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}
	var xpos;
	if (e.originalEvent.touches){
		xpos=e.originalEvent.touches[0].pageX-$('#miniGraph').offset().left;
	} else {
		xpos=e.pageX-$('#miniGraph').offset().left;
	}
	$('#miniGraphSlider').css('cursor', ' -webkit-grabbing');
	dragOffset=xpos-$('#miniGraphSlider').offset().left;
		
	$(document).mousemove(function(e2){
		
		onMouseMoveSlider(e2, null);
	});
	
	$(document).on('touchMove', function(e4){
		
		onTouchMoveSlider(e4, null);
	});

}


function onMouseMoveSlider(e, leftOrRight){
	if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}
	var xpos;
	if (e.originalEvent.touches){
		xpos=e.originalEvent.touches[0].pageX-$('#miniGraph').offset().left;
	} else {
		xpos=e.pageX-$('#miniGraph').offset().left;
	}
	//console.log('onMouseMoveSlider, e.pageX='+e.pageX+', e.pageY='+e.pageY);
	if (leftOrRight=='left'){
		//user is dragging left handle of the graph slider
		
		if (xpos>-5){
			$('#miniGraphSlider').css('margin', '0px');
			$('#miniGraphSlider').offset({top: $('#miniGraphSlider').offset().top, left: xpos+$('#miniGraph').offset().left} );
			//console.log('mousemove left handle, rightMargin='+rightMargin);
			$('#miniGraphSlider').css('width', $('#miniGraph').width()-xpos-rightMargin+'px');
		}
	
	}
	else if (leftOrRight=='right'){
		//user is dragging right handle of the graph slider
		//the new minigraphslider width has to be the whole minigraph width - original margin left - endoffset
		//console.log('mousemove; over halfway');
		if (xpos<$('#miniGraph').width()+10){
			var originalMargin=parseInt($('#miniGraphSlider').offset().left);
			var endOffset=$('#miniGraph').width()-xpos;
			var newWidth=xpos-originalMargin+$('#miniGraph').offset().left;
			//console.log('minigraph width='+$('#miniGraph').width()+', originalMargin='+originalMargin+', endOffset='+endOffset+', newWidth='+newWidth);
			$('#miniGraphSlider').css('width', newWidth+'px');
			$('#miniGraphSlider').offset({top:$('#miniGraphSlider').offset().top , left:originalMargin });
		}
	}
	
	else {
		//user is dragging the whole bar
		//console.log('dragging whole bar; xpos='+xpos+' ,dragOffset='+dragOffset);
		var newMargin=xpos-dragOffset+$('#miniGraph').offset().left;
		//console.log('newMargin='+newMargin);
		var leftBarrier=$('#miniGraph').offset().left-5;
		var rightBarrier=$('#miniGraph').width()+$('#miniGraph').offset().left+10;
		if (newMargin>leftBarrier && ($('#miniGraphSlider').width()+newMargin<rightBarrier)){
			$('#miniGraphSlider').offset({top: $('#miniGraphSlider').offset().top , left: newMargin});
			
		}
				
	}

	//console.log('mousemove on slider, xpos='+xpos);
}


function onTouchStartSliderLeft(e){
	//console.log('touchstart on slider left handle');
	if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}
	
	if (e.stopPropagation) { 
		e.stopPropagation();
	} 
	
	rightMargin=$(window).width()-$('#miniGraphSlider').offset().left-$('#miniGraphSlider').width()-50;
	
	
	$('#miniGraphSlider').on('touchmove', function(e3){
		
		onTouchMoveSlider(e3, 'left');
	});

}

function onTouchStartSliderRight(e){
	//console.log('touchstart on slider right handle');
	if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}
	if (e.stopPropagation) { 
		e.stopPropagation();
	} 
	rightMargin=$(window).width()-$('#miniGraphSlider').offset().left-$('#miniGraphSlider').width()-50;
		
	
	
	$('#miniGraphSlider').on('touchmove', function(e3){
		
		onTouchMoveSlider(e3, 'right');
	});


}

function onTouchStartSliderBody(e){
	//console.log('touchstart on slider body');
	/*if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}*/
	var xpos;
	if (e.originalEvent.touches){
		xpos=e.originalEvent.touches[0].pageX-$('#miniGraph').offset().left;
	} else {
		xpos=e.pageX-$('#miniGraph').offset().left;
	}
	
	dragOffset=xpos-$('#miniGraphSlider').offset().left;
		
	
	
	$('#miniGraphSlider').on('touchmove', function(e4){
		//console.log('touchMove event')
		onTouchMoveSlider(e4, null);
	});

}


function onTouchMoveSlider(e, leftOrRight){
	//console.log('onTouchMoveSlider running, leftOrRight='+leftOrRight);
	
	if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}
	var xpos;
	if (e.originalEvent.touches){
		xpos=e.originalEvent.touches[0].pageX-$('#miniGraph').offset().left;
	} else {
		xpos=e.pageX-$('#miniGraph').offset().left;
	}
	//console.log('onTouchMoveSlider, e.originalEvent.touches[0].pageX='+e.originalEvent.touches[0].pageX);
	if (leftOrRight=='left'){
		//user is dragging left handle of the graph slider
		
		//console.log('dragging left handle; xpos='+xpos+' ,dragOffset='+dragOffset);
		
		
		if (xpos>-5){
			$('#miniGraphSlider').css('margin', '0px');
			$('#miniGraphSlider').offset({top: $('#miniGraphSlider').offset().top, left: xpos+$('#miniGraph').offset().left} );
			//console.log('mousemove left handle, rightMargin='+rightMargin);
			$('#miniGraphSlider').css('width', $('#miniGraph').width()-xpos-rightMargin+'px');
		}
	
	}
	else if (leftOrRight=='right'){
		//user is dragging right handle of the graph slider
		//the new minigraphslider width has to be the whole minigraph width - original margin left - endoffset
		
		//console.log('dragging right handle; xpos='+xpos+' ,dragOffset='+dragOffset);
		
		if (xpos<$('#miniGraph').width()+10){
			var originalMargin=parseInt($('#miniGraphSlider').offset().left);
			var endOffset=$('#miniGraph').width()-xpos;
			var newWidth=xpos-originalMargin+$('#miniGraph').offset().left;
			//console.log('minigraph width='+$('#miniGraph').width()+', originalMargin='+originalMargin+', endOffset='+endOffset+', newWidth='+newWidth);
			$('#miniGraphSlider').css('width', newWidth+'px');
			$('#miniGraphSlider').offset({top:$('#miniGraphSlider').offset().top , left:originalMargin });
		}
	}
	
	else {
		//user is dragging the whole bar
		//console.log('dragging whole bar; xpos='+xpos+' ,dragOffset='+dragOffset);
		var newMargin=xpos-dragOffset+$('#miniGraph').offset().left;
		//console.log('newMargin='+newMargin);
		var leftBarrier=$('#miniGraph').offset().left-5;
		var rightBarrier=$('#miniGraph').width()+$('#miniGraph').offset().left+10;
		if (newMargin>leftBarrier && ($('#miniGraphSlider').width()+newMargin<rightBarrier)){
			$('#miniGraphSlider').offset({top: $('#miniGraphSlider').offset().top , left: newMargin});
			
		}
				
	}

	//console.log('touchmove on slider, xpos='+xpos);
}


function onTouchEndSlider(e){
	//console.log('onTouchEndSlider running');
	$(document).off('mousemove');
	$(document).off('touchmove');
	$('#miniGraphSlider').off('mousemove');
	$('#miniGraphSlider').off('touchmove');
	
	
	
	if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}
	
	
	
	
	sliderWidthRatio=$('#miniGraphSlider').width()/($(window).width());
	sliderPosRatio=$('#miniGraphSlider').offset().left/($(window).width()-110);
	mooderatorZoomRatio=mooderatorWidth/($(window).width()-110);
	
	//console.log('at touchend, sliderWidthRatio='+sliderWidthRatio+', miniGraphSlider.offset().left='+$('#miniGraphSlider').offset().left+', sliderPosRatio='+sliderPosRatio);
	
	zoomTo($('#miniGraphSlider').innerWidth(), $('#miniGraphSlider').offset().left-$('#miniGraph').offset().left);
		
	
	
}

function onMouseUpSlider(e){
	//console.log('mouseup');
	if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}
	
	$(document).off('mousemove');
	$(document).off('touchmove');
	$('#miniGraphSlider').off('mousemove');
	$('#miniGraphSlider').off('touchmove');
	
	//$(document).off('touchmove', '**');
	//$(document).off('mousemove', '**');
	$('#miniGraphSlider').css('cursor', ' -webkit-grab');
	
	sliderWidthRatio=$('#miniGraphSlider').width()/($(window).width());
	sliderPosRatio=$('#miniGraphSlider').offset().left/($(window).width()-110);
	mooderatorZoomRatio=mooderatorWidth/($(window).width()-110);
	
	//console.log('at mouseup, sliderWidthRatio='+sliderWidthRatio+', miniGraphSlider.offset().left='+$('#miniGraphSlider').offset().left+', sliderPosRatio='+sliderPosRatio);
	
	zoomTo($('#miniGraphSlider').innerWidth(), $('#miniGraphSlider').offset().left-$('#miniGraph').offset().left);
		
}



function showToolTip(posX, posY, number){
	//console.log("showToolTip running; $('#mooderatorGraph').offset().left="+$('#mooderatorGraph').offset().left+"; posX="+posX+"; posY="+posY);
	$('#mooderatorPopUpLabel').css('visibility', 'visible');
			
	var arrayIndex=parseInt(number);
	
	//console.log('arrayIndex='+arrayIndex);
	//console.log("me.updates[arrayIndex].status="+me.updates[arrayIndex].status);
	
	var tempMoodNum=me.updates[arrayIndex].mood;
	
	
	
	$('#mooderatorPopUpLabel').html("<span style='font-size: 0.7em; color: #fff; margin:0px; padding:0px'>"+me.updates[arrayIndex].time+"</span> <br/> <span id='labelRoundBox' style='background-color:"+colourArray[me.updates[arrayIndex].mood]+"'>"+theMoods[me.updates[arrayIndex].mood]+"</span> "+unescape(me.updates[arrayIndex].status));
	
	$('#mooderatorPopUpLabel').css('height', posY+'px');
	$('#mooderatorPopUpLabel').css('top', $('#mooderatorGraph').offset().top+posY-$('#mooderatorPopUpLabel').height()-10+'px');
	
	
	if (posX>$(window).width()/2){
		//console.log('popUpLabel overlaps window');
		
		$('#mooderatorPopUpLabel').css('border-left', '0px');
		$('#mooderatorPopUpLabel').css('border-right', '1px #fff solid');
		
		$('#mooderatorPopUpLabel').css('text-align', 'right');
		$('#mooderatorPopUpLabel').css('margin-left', $('#mooderatorGraph').offset().left+posX-$('#mooderatorPopUpLabel').width()-18+'px');
	}
	
	else {
		
		$('#mooderatorPopUpLabel').css('border-right', '0px');
		$('#mooderatorPopUpLabel').css('border-left', '1px #fff solid');
		
		$('#mooderatorPopUpLabel').css('text-align', 'left');
		$('#mooderatorPopUpLabel').css('margin-left', $('#mooderatorGraph').offset().left+posX-1+'px');
	
	}
	
	if (tempMoodNum>3 && tempMoodNum <6){
		$('#labelRoundBox').css('color', '#000');
	}
	
	$('#mooderatorPopUpLabel').css('visibility', 'visible');
	
	
}

function hideToolTip(){
	$('#mooderatorPopUpLabel').css('visibility', 'hidden');
	
	
}

////////////////////////////////////////////////////////
//TOUCH EVENT HANDLERS
//////////////////////////////////////////////////////




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
	//console.log('locationTimeoutCheck tick');
	timeSinceLocationQuery+=100;
	if (timeSinceLocationQuery>10000){
		stopLocationTimer();
		//manualLocate();
		
	}	else {
		locationTimer=setTimeout("locationTimeoutCheck()", 100);
	}
}
//stops location timer set in locationTimeoutCheck()
function stopLocationTimer(){
	//console.log('stopLocationTimer running');
	clearTimeout(locationTimer);
	timeSinceLocationQuery=0;

}



//find the user's current location
function getLocation(){
	//console.log('getLocation running');
	//$('#communication').append('<p>Attempting to retrieve your location, please wait...</p>');
	locationTimeoutCheck();
	if (Modernizr.geolocation) {
	  // let's find out where you are!
	 	//console.log('Modernizr.geolocation=true');
	    gl = navigator.geolocation;
		
	
	  	
	  	
	  	gl.getCurrentPosition(
        recordPosition,
        function errorCallback(error) {
            //do error handling
            //console.log('geolocation error! error='+error);
            //manualLocate();
            stopLocationTimer();
        },
        {
            maximumAge:Infinity,
            timeout:6000 
        }
        
    );
	  	
	  	
	  	
	} else {
	  //console.log("cant get geolocation");
	  // no native geolocation support available :(
	  // maybe try Gears or another third-party solution
	  //manualLocate();
	  stopLocationTimer();
	} 
	
	  
}


function manualLocate(){
	//console.log("manualLocate running");
	showDiv('manualLocation');	
	 
}

function findMe(){
	//console.log("findMe running");
	 
	
	
	var theAddress=$("#address").value;
	//console.log('theAddress='+theAddress);
	encodeAddress(theAddress);
	
	
}


function encodeAddress(address) {
	//console.log('encodeAddress running');
	$('#communication').html('Attempting to get your location from your address, please wait...<br/>');
	geocoder= new google.maps.Geocoder();
	geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
       
        var myPosition=results[0].geometry.location;
        //console.log("geocoding successful; lat="+myPosition.lat()+", lng="+myPosition.lng());
        me.lat=myPosition.lat();
        me.lng=myPosition.lng();
        
        var addressLatLng=new google.maps.LatLng(me.lat, me.lng);
        //console.log('calling getAddress from encodeAddress');
        getAddress(addressLatLng);
      	
       	stopLocationTimer();
        
      } else {
        //console.log("Geocode was not successful for the following reason: " + status);
        
        
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
  
  //console.log("recordPosition running");
    me.lat=position.coords.latitude;
  me.lng=position.coords.longitude;
  var addressLatLng=new google.maps.LatLng(me.lat, me.lng);
        
  
  
 stopLocationTimer();
    //console.log('calling getAddress from recordPosition');
  getAddress(addressLatLng);
}
 
function getAddress(latlng) {
	//console.log('getAddress running; latlng='+latlng);
    
    var returnedAddress=' ';
   	
    
	geocoder2= new google.maps.Geocoder();
	   
 	if (latlng) {
        
        
       geocoder2.geocode({'latLng': latlng}, function(results, status){
	        if (status == google.maps.GeocoderStatus.OK){
	        	 var statusAddition='';
	            if (results[0]){    
	                returnedAddress=results[2].formatted_address;
	                
	                //console.log('returnedAddress='+returnedAddress);
	                
				   	
				   statusAddition='in '+returnedAddress+'?';   	
	            }
	            else
	            {
	                //console.log('reverse geocode: No results found');
	                statusAddition='<span style="font-size:3em">?</span>';
	            }
	            
	            
	            //$('#statusLabel').append(statusAddition+'<br/>');
	            $('#changeLocationButton').css('display', 'block');
	        }
	        else
	        {
	             //console.log('Geocoder failed due to: '+ status);
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
	
	/*var myAttachment = { 'name': 'name', 'href': ' <a href="https://www.moodoo.net" rel="nofollow">httsp://www.moodoo.net</a>', 'caption': 'Moodoo is a tool with which you can monitor your moods, share what you are feeling, get access to support in tough times and see mood patterns around the world.', 'description': body, 'media': [{ 'type': 'image', 'src': 'https://www.moodoo.net/images/'+me.mood+'.png', 'href': 'https://www.moodoo.net'}] }; */

	
	//var wallPost = {message : "is feeling "+me.mood.capitalize()+": "+me.status, picture: "https://www.moodoo.net/images/"+me.mood+".png"};
	
	
	
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
		//console.log('showing div '+divname);
		$('#'+divname).css('display', 'block');
		//console.log('$(#'+divname+').css("display")='+$('#'+divname).css('display'));
		
		
		//$('#'+divname).css('position', 'relative');
			
		//console.log('$(#'+divname+').data("myHeight")='+$('#'+divname).data('myHeight'));
		$('#'+divname).animate({
			
			height: $('#'+divname).data('myHeight')
			
			
		}, 500, function(){
			$('#'+divname).css('visibility', 'visible');
			
			if ($('#'+divname).css('height')=='0px'){
				$('#'+divname).css('height', 'auto');
			}
			$('#'+divname).animate({
				top: '0px',
				
				opacity: 1
				
			}, 500, function(){
				//console.log('$(#'+divname+').css("display")='+$('#'+divname).css('display'));
				
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
		//console.log('hiding div '+divname+', swapper='+swapper);
		
		
		//store height to return to on reshow
		if ($('#'+divname).outerHeight()>0){
			$('#'+divname).data('myHeight', $('#'+divname).height());
		
			
		}
		
		//console.log('$(#'+divname+').data("myHeight")='+$('#'+divname).data('myHeight'));
			
		//detach from the css flow
		//$('#'+divname).css('position', 'relative');
		//move up and fade out
		$('#'+divname).animate({
			top: '-150',
			opacity: 0
			
		}, 500, function(){
			//main animation finished
			//console.log('hideDiv animation finished. swapper= '+divToShow);
		
			
			$('#'+divname).css('visibility', 'hidden');
			//animate reduction in height for smooth transition for elements that are below hidden element
			$('#'+divname).animate({
				height: '0'
			
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


//retrieves GET parameters from URL 
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}