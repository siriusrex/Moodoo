
//global vars

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

//array of divs which I want to be able to hide and show
var panels= new Array('header', 'blurbBox', 'moodInput', 'average_mood', 'current_mood', 'settingsBox', 'updateErrorBox', 'statusBox', 'locationBox',  'mapWrapper', 'footer', 'mySettings', 'updateMoodButton'); 

var visiblePanels=new Array();

var invisiblePanels=new Array();

//programming output
var console.logDiv='';

//main notices to user
var blurbBox='';

//URL get variables
var getVars=new Array();
var usedGetVars=false;

//user data
var me=new Object();
me.rawData=null;
me.data=null;
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

//mooderator
var canvas;
var pieCanvas;

var mooderatorWidth;
var mooderatorHeight;
var canvasPoints=new Array();
var toolTip;
//mooderator dragging
var dragPosA;
var dragPosB;
var distance=0;
var dragging=false;
var mooderatorZoomLevel=66;
var oldZoomLevel='';

/*
var fbLogOutString='<a class="fb_button fb_button_medium"><span class="fb_button_text">Log Out</span></a>';
var fbLogInString='<a class="fb_button fb_button_medium"><span class="fb_button_text">Log In With Facebook</span></a>';
*/

var fbLogOutString='Log Out';
var fbLogInString='Log In With Facebook';

//main config function  - needs init to have registered divs as vars

function createDisplay(value){

	
	console.log('createDisplay running');
	console.log('value='+value);
	console.log('me='+me);
	hideAll();
	if (document.getElementById('wait').style.display=='block'){
		unHighlightDiv('wait');
		hidediv('wait');
	}
	
	if (value){
	
		
		
		
		if (value['firstName']){
			me.firstName=value['firstName'];
		}
		
		if (value.updates){
			me.data=value.updates;
			
			//set last updated mood
			me.moodNum=me.data[me.data.length-1].mood;
			me.mood=theMoods[me.moodNum];
		}
		
		
		
		if (value['timeSinceLastUpdate']!=null){
			
			
			
			if (parseInt(value['secondsSinceLastUpdate'])<2){
				blurbBox.innerHTML="<p>Thanks "+me.firstName+", your mood has been updated.</p>";
			}
			else {
				blurbBox.innerHTML="<h1>Welcome back, "+me.firstName+"<h1>";
				blurbBox.innerHTML+="<p>It has been "+value['timeSinceLastUpdate']+" since your last Moodoo update.<br/> Are you still feeling <img style='position: relative; top:5px; width:1.5em; height:1.5em; margin: 0.5em 0.5em 0em 0.5em' src='images/"+me.mood+"_face.png'/>"+me.mood+"?</p>";
				
				
			}
		}
		
		else {
			blurbBox.innerHTML="<h1>Welcome, "+me.firstName+"</h1>";
			blurbBox.innerHTML+="<p>It looks like you haven't yet updated your mood with Moodoo.</p><p>Before you do, take a moment to look at your <a class='innerButton' style='display:inline' href='javascript:changeSettings()'>settings</a>.</p><p> Here you can decide whether you want to receive reminders from Moodoo to update your mood, and whether you would like to publish your mood updates to your Facebook wall.</p>";
		}
		
		blurbBox.innerHTML+="<p>You can update your mood by using the 'Update My Mood' button.</p>";
		
		
		console.log('adding update mood button to fadein panels');
		visiblePanels.push('updateMoodButton');
		
		visiblePanels.push('mySettings');
		
		//if user has any mood updates
		if (value.updates){
			
			
			//console.log('me.data='+me.data);
			if (value.updates.length<3){
				blurbBox.innerHTML+="<p>When you have more than three mood updates, you will see a graph of your moods, as well as your average mood. The more updates you do, the more accurate the graphs and averages will be!</p>";
		
			}
			else {
				//draw mooderator and show current and average moods
				
				console.log('attempting to draw Mooderator');
				drawMooderator();
				console.log('createDisplay BREAK');
				visiblePanels.push('mooderator');
				
				
				showAverageMood();
				showCurrentMood();
				createMoodPie();
				visiblePanels.push('moodPie');
				if (map!=null){
					deleteOverlays();
					drawMoodsToMap();
				
				}else {
					initializeMoodMap();
				}
			}
		}
		else {
			blurbBox.innerHTML+="<p>So what are you waiting for? Dive in and Moodoo!</p>";
		
		}
		
	
	}
	console.log(' createDisplay end of if');
	
	
	hidediv('preloader');
	hidediv('black');
	
	
	
	fadeInAll();
	
	
	
	
	if (getVars.mood && !usedGetVars){
		
		console.log('at createDisplay, getVars.mood='+getVars.mood);
		
		for (d=0; d<me.data.length; d++){
			if (me.data[d].code==getVars.code){
				usedGetVars=true;

			}
		}
		
		if (usedGetVars==false){
			startUpdate();
			setMood(getVars.mood);
			usedGetVars=true;
			me.code=getVars.code;	
		}
		else {
			blurbBox.innerHTML+='You have already updated your mood from this email link. To update again, use the Update Mood button.';
		}
				
	}
	
}




//gets moodInput ready and hides update button
function startUpdate(){
	hidediv('updateMoodButton');
	
	highlightDiv('moodInput');
	
}

function cancelMoodInput(){
	unHighlightDiv('moodInput');
	hidediv('moodInput');
	showdiv('updateMoodButton');
	
}

function cancelUpdateAtStatus(){
	unHighlightDiv('statusBox');
	hidediv('statusBox');
	showdiv('updateMoodButton');
	
}





//function to set mood for update

function setMood(mood){
	console.log('setMood running');
	
	
	

	$('#communication').append('Setting Mood');
	
	
	
	console.log('theMoods[mood]='+theMoods[mood]);
	//removeAllChildNodes('statusTitle');
	$('#statusTitle').append('Why are you feeling <br/><br/><img style="text-align:center" alt="'+theMoods[mood]+'" src="images/'+theMoods[mood]+'.png"/>');
	
	me.moodNum=mood;
	getLocation();
	//test to see if moodInput div is visible/highlighted
		
}


//each time mood is updated, these vars are reset so that the independent timer can check if all asynchronous functions have completed.
var updateMoodTimer;
var facebookPublishFinished=false;
var dataRefreshed=false;


function checkUpdateStatus(){
	console.log('checkUpdateStatus running');
	console.log('facebookPublishFinished='+facebookPublishFinished);
	console.log('dataRefreshed='+dataRefreshed);
	
	updateMoodTimer=setTimeout("checkUpdateStatus()", 100);
	//if all update processes are done, stop animating logo, stop updateMoodTimer, remove wait div and refresh page with createDisplay
	
	if (facebookPublishFinished && dataRefreshed){
		console.log('all processes complete, hiding wait');
		clearTimeout(updateMoodTimer);
		unHighlightDiv('wait');
		hidediv('wait');
		stopAnimatingLogo();
		createDisplay(me.rawData);
	}	
}


function killUpdate(error){
	console.log("killUpdate running");
	clearTimeout(updateMoodTimer);
	unHighlightDiv('wait');
	hidediv('wait');
	stopAnimatingLogo();
	
	if (error!="null"){
		document.getElementById('updateErrorBox').innerHTML='<h1>Sorry!</h1><p>There has been a communication error, and your update has not gone through to Moodoo. Please try again.</p><a class="innerButton" href="javascript:closeError()">Close</a>';
		highlightDiv('updateErrorBox');
		
	}
}

//function to send mood data, including location and status msg to server


function updateMood(){
	
	console.log('updateMood running');
	
	
	$('#communication').append('Sending your data to Moodoo, please wait...');
	
	
	
	animateWaitLogo();
	highlightDiv('wait');
	showdiv('wait');
	
	
	//reset update status vars
	facebookPublishFinished=false;
	dataRefreshed=false;
	//start update timer
	checkUpdateStatus();
	
	
	var updateMoodRequest=new Object();
	updateMoodRequest.facebookID=me.ID;
	updateMoodRequest.userID=me.userID;
	updateMoodRequest.mood=me.moodNum;
	
	updateMoodRequest.lat=me.lat;
	updateMoodRequest.lng=me.lng;
	me.status=document.getElementById("status").value;
	updateMoodRequest.status=me.status;
	updateMoodRequest.code=me.code;
	console.log('updateMoodRequest.status='+updateMoodRequest.status);
	
	
			
	try {
		JSONRequest.post("http://www.moodoo.net/updateMood.php?"+new Date().getTime(), updateMoodRequest, updateMoodResponse, 10000);
		
	}
	catch(e) {
		alert(e);
	}
	me.mood=theMoods[parseInt(me.moodNum)];
	console.log('updating mood, me.publishToFacebook='+me.publishToFacebook);

	if (me.publishToFacebook==1){
		publishToFacebook();
	}else {
		facebookPublishFinished=true;
	}
	
}


function showAverageMood(){
	console.log('showAverageMood running');
	
	var averageMood=0;
	var moodsSum=0;
	for (var i=0; i<me.data.length; i++){
		moodsSum+=parseInt(me.data[i].mood);
		
	}
	
	console.log("moodsSum="+moodsSum);
	console.log("me.data.length="+me.data.length);
	
	var tempAverageMood=(parseFloat(moodsSum)/parseFloat(me.data.length));
	
	console.log("tempAverageMood="+tempAverageMood);
	
	averageMood=Math.floor(parseFloat(tempAverageMood));
	
	console.log("averageMood="+averageMood);
	console.log("Your average mood is:<br/> "+theMoods[averageMood]);
	document.getElementById('average_mood').innerHTML="<p>Your average mood is:<br/> <br/><img src='images/"+theMoods[averageMood]+".png'/></p>";
	visiblePanels.push('average_mood');
}

function showCurrentMood(){
	var currentMood=me.data[me.data.length-1].mood;
	document.getElementById('current_mood').innerHTML="<p>Your current mood is:<br/> <br/><img src='images/"+theMoods[currentMood]+".png'/></p>";
	visiblePanels.push('current_mood');
}





//publishes the user's new mood to their Facebook news feed
function publishToFacebook(){
	console.log("publishToFacebook running");
	console.log("me.moodNum="+me.moodNum);
	console.log("me.mood="+me.mood);
	
	var body = "is feeling "+me.mood.capitalize()+": "+me.status;
	
	/*var myAttachment = { 'name': 'name', 'href': ' <a href="http://www.moodoo.net" rel="nofollow">http://www.moodoo.net</a>', 'caption': 'Moodoo is a tool with which you can monitor your moods, share what you are feeling, get access to support in tough times and see mood patterns around the world.', 'description': body, 'media': [{ 'type': 'image', 'src': 'http://www.moodoo.net/images/'+me.mood+'.png', 'href': 'http://www.moodoo.net'}] }; */

	
	var wallPost = {message : "is feeling "+me.mood.capitalize()+": "+me.status, picture: "http://www.moodoo.net/images/"+me.mood+".png"};
	
	
	
	FB.api('/me/feed', 'post', wallPost, function(response) {
	  if (!response || response.error) {
	    //alert('Error occured');
	  } else {
	    //alert('Post ID: ' + response);
	    facebookPublishFinished=true;
	    
	  }
	});
	

}



//gets moodInput ready and hides update button
function changeSettings(){
	hidediv('mySettings');
	highlightDiv('settingsBox');

}

function cancelSettings() {
	unHighlightDiv('settingsBox');
	hidediv('settingsBox');
	showdiv('mySettings');
	
}


//submits feedback form
function sendFeedback() {
	console.log('sendFeedback running <br/>');
	
	var feedbackRequest=new Object();
	console.log('document.feedback.name.value='+document.feedback.name.value);
	
	feedbackRequest.name=document.feedback.name.value;
	feedbackRequest.email=document.feedback.email.value;
	feedbackRequest.message=document.feedback.message.value;
	
	try {
		JSONRequest.post("feedback.php?"+new Date().getTime(), feedbackRequest, feedbackResponse);
		
	}
	catch(e) {
		alert(e);
	}
	
	
	
	
	
}

function feedbackResponse(requestNumber, value, exception){
	closeFeedback();
}

function closeFeedback(){
	document.feedback.name.value='';
	document.feedback.email.value='';
	document.feedback.message.value='';
	hidediv('feedbackBox');



}

function closeError(){
	console.log('closeError running');
	unHighlightDiv('updateErrorBox');
	showdiv('updateMoodButton');
}


