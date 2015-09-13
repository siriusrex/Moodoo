
//Moodoo 2.0
//moodooMain.js
//Created 18 Dec 2013
//Copyright 2010-2015 John Galea
//version 2.13.10

///////////////////////////////////
//GLOBAL VARS
//////////////////////////////////
var baseURL = 'https://www.moodoo.net/dev/test';
var logsOn = true;


//array of mood labels
var theMoods = new Array();

theMoods[0] = 'gloomy';
theMoods[1] = 'grouchy';
theMoods[2] = 'narky';
theMoods[3] = 'grumpy';
theMoods[4] = 'fuzzy';
theMoods[5] = 'happy';
theMoods[6] = 'boppy';
theMoods[7] = 'bouncy';
theMoods[8] = 'snappy';
theMoods[9] = 'zappy';


//array of mood colours used in Moodoo
var colourArray = new Array('#000000', '#dd1f26', '#df6b28', '#f7971e', '#fed020', '#f9ed32', '#aad037', '#3aa141', '#007482', '#1c75bc');
var highlightArray = new Array('#333333', '#e44c51', '#e58953', '#f9ac4b', '#fed94d', '#faf15b', '#bbd95f', '#61b467', '#33909b', '#4491c9');

//user data object
var me = new Object();
//me.rawData=null;
//me.data=null;
me.updates = null;
me.firstName = '';
me.lastName = '';
me.email = '';
me.ID = '';
me.userID = '';

me.moodNum = 0;
me.mood = '';
me.status = '';
me.lat = '';
me.lng = '';
me.currentAddress = '';
me.publishToFacebook = '';
me.publishToMoodoo = '';
me.publishToMap = '';
me.reminder = '';
me.code = '';

//GET Url var
var token = null;


//update status vars
var updateMoodTimer;
var socialPublishFinished = false;
var dataRefreshed = false;

//globals to store mooderator (line-graph) parameters
var canvasPoints;
var graphPoints;
var pointGroups;
var dotRadius;

//global for MoodPie canvas graphic context
var pieContext;
//toggle tools open status
var tools = {
    open: false
};

//screen size vars

var screenWidth;
var screenHeight;
var mobileSize = false;

//background images
var backgroundClear = 'cloud-background_moodoo2.png';
var backgroundBlur = 'cloud-background_moodoo_blurry.png';
var backgroundMobile = 'cloud-background_moodoo_mobile.jpg';

/////////////////
//APP INITIALIZATION
///////////////////


//init function called from body element of index.html
function init() {

    logIt('init running');

    //checking for cookie

    token = getParameterByName('token');

    logIt('token=' + token);

    //check screen size - is this a device that requires mobile-style layout?

    screenWidth = $(window).width();
    screenHeight = $(window).height();
    logIt('screenWidth=' + screenWidth);

    if (screenWidth < 1024) {
        logIt('mobile or tablet sized screen detected');
        mobileSize = true;
        $(document).width(screenWidth * 0.8);
        //$(document).css('overflow', 'hidden');
    } else {
        logIt('screen is larger than mobile size');
    }

    //hiding base content from index.html

    $('.section').each(function() {
        $(this).css('visibility', 'hidden');
        $(this).css('display', 'none');
        $(this).css('opacity', 0);
        $(this).data('myHeight', $(this).css('height'));
        $(this).css('height', 0);
        $(this).data('hidden', true);
    });




    logIt('checking for cookie');
    //we don't do this any more - storing user ID in cookie is BAD - janrain does auth for us, if user clicks on google and they are logged in to google they will auto log in to moodoo. if not, they have to type google password in. same for fb, etc.
    
    /*if (validateNumeric($.cookie('moodooID'))) {
        logIt('cookie ID is numeric');
        if ($.cookie('moodooID') != 'null') {
            hideDiv('auth');
            $('#results').append('<p>Caught cookie. User id is ' + $.cookie('moodooID'));
            logIt('<p>Caught cookie. User id is ' + $.cookie('moodooID'));
            logIt('sending cookie id to server');
            loadUser($.cookie('moodooID'), null);
        }

    } */
    if (token) {
        //had to add this hack for mobile ios 7+. Janrain only wants to redirect to URL, uses janrain_redirect.php to send the janrain token into the Get vars
        //get vars put into 'token' var, fire script if this token exists. SHould log user in.

        logIt('sending token to janrain_auth.php via ajax. token=' + token);
        $.ajax({
            type: "POST",
            url: "janrain_auth.php",
            data: "token=" + token,
            success: function(res, status, xhr) {
                logIt('res=' + res + ', status=' + status + ', xhr=' + xhr);

                for (var key in xhr) {
                    logIt('res[' + key + ']=' + res[key]);
                }
				if (res.profile){
					
					logIt('identifier: ' + res.profile.identifier);
	                logIt('displayName: ' + res.profile.displayName);
	                logIt('primaryKey: ' + res.profile.primaryKey);
	                if (res.profile.name) {
	                    logIt('givenName: ' + res.profile.name.givenName);
	                }
	                logIt('sending social info to server');
	                logIt('trying to close janrain window');
	                if (janrain.engage.signin) {
	                    janrain.engage.signin.modal.close();
	                }
	                loadUser(null, res.profile);
				}
				else {
					
					logIt('error - no profile returned, bad token');
                
					window.location.href = baseURL;
				}
                
                
            },
            error: function(data, status, xhr) {
                logIt('error when sending token to janrain_auth');
                
                window.location.href = baseURL;
                
                /*logIt ('data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	logIt(c+'='+data[c]);
	                	
                	}*/
            }
        });
    } else {
        logIt('cookie ID is invalid, reverting to janrain. janrainReady=' + janrainReady);
        hideDiv('communication', 'auth');
        //showDiv('auth');
    }



    //setup fancy dynamic sizing of input field for mood status

    //first, make sure touch events on the input shift focus to it:
    $('#status').on('touchstart', function(e) {
		logIt('status input touchstart event');
        $(this).focus();
    });

    //focus handler

    $('#status').focus(function() {
        logIt('status input field focus event');
       /* $('#status').animate({
            width: 100
        }, 100, function() {
            //animation complete
        });*/
    });

    //keypress handler
    $('#status').keypress(function() {
        logIt('#status just received keypress');

        var statusValue = $('#status').val();
        var newWidth = statusValue.length * 12;
        if (mobileSize){
	        newWidth= statusValue.length * 40;
        }
        if (newWidth < 100) {
            newWidth = 100;
        }
        $('#status').animate({
            width: newWidth
        }, 100, function() {
            //animation complete
        });



    });



    //add mouse handlers to mooderatorGraph
    $('#mooderatorGraph').mouseover(function(e) {
        logIt('mouseover on mooderator event');
        onMouseOverGraph(e);
    });

    $('#mooderatorGraph').mouseout(function(e) {
        logIt('mouseoout mooderator event');

        onMouseOutGraph(e);
    });
    
    //touch gestures for pinch zooming graph
    $('#mooderatorGraph').on('gesturestart', onGestureStartGraph);
	 $('#mooderatorGraph').on('gestureend', onGestureEndGraph);
	 $('#mooderatorGraph').on('gesturechange', onGestureChangeGraph);

	 //simple touch events for graph
	 $('#mooderatorGraph').on('touchstart', onTouchStartGraph);
	 $('#mooderatorGraph').on('touchmove', onTouchMoveGraph); 
	 $('#mooderatorGraph').on('touchend', onTouchEndGraph);
	 $('#mooderatorGraph').on('touchcancel', onTouchCancelGraph);
	 
	 
	 
	 
    //add mouse handlers to moodPie

    $('#moodPieGraph').mouseover(function(e) {
        logIt('mouseover on moodPie');
        onMouseOverPie(e);
    });

    $('#moodPieGraph').mouseout(function(e) {
        logIt('mouseout on moodPie');
        onMouseOutPie(e);
    });


    //add event listeners for buttons

   


    $('#moodInput a').click(function(e) {

        logIt('clicked mood button:' + $(this).attr('mood'));
        setMood($(this).attr('mood'));
    });

    /*$('#moodInput a').on('touchstart', function(e) {
        logIt('clicked mood button:' + $(this).attr('mood'));
        setMood($(this).attr('mood'));

    });*/

    $('a#updateMoodButton').click(function(e) {
        updateMood();
    });

    $('a#cancelUpdateButton').click(function(e) {
        logIt('cancelUpdateButton click');
        cancelUpdateAtStatus();
    });
    /*$('#updateMoodButton').on('touchstart', function(e) {
        updateMood();
    });*/

    /*$('#cancelUpdateButton').on('touchstart', function(e) {

        cancelUpdateAtStatus();
    });*/


    $('#toolButton').click(function(e) {
        showTools();
    });

    /*$('#toolButton').on('touchstart', function(e) {

        showTools();
    });*/


    $('#signOutButton').click(function(e) {
        signUserOut();
    });

    $('#signOutButton').on('touchstart', function(e) {

        signUserOut();
    });


    $('#showRecentUpdatesButton').click(function(e) {
        showRecentUpdates(3);
    });

   /* $('#showRecentUpdatesButton').on('touchstart', function(e) {

        showRecentUpdates(3);
    });*/

    $('#showMoreUpdatesButton').click(function(e) {
        showRecentUpdates(6);
    });

    /*$('#showMoreUpdatesButton').on('touchstart', function(e) {

        showRecentUpdates(6);
    });*/

    $('#showAllUpdatesButton').click(function(e) {
        showRecentUpdates(parseInt(me.updates.length));
    });

    //$('#showAllUpdatesButton').on('touchstart', function(e) {

      //  showRecentUpdates(parseInt(me.updates.length));
    //});



    //change css styling of janrain social sign-on widget
    //restyleJanrain();

    //init graph array
    canvasPoints = new Array();


    //init window resize listener
    $(window).resize(function(e) {
        onViewportResize();
    });
    //set size of dots for line graph
    dotRadius=4;
	if (mobileSize) {
		dotRadius=12;
	}

    logIt('init finished');
}


////////////////////////////////////////////////////////////
//JANRAIN AUTH - requires mooodoo_auth_main.php in same dir
///////////////////////////////////////////////////////////

//restyle janrain login box - this is a hack until I can pay Janrain enough for widget customization!

var janrainReady = false;
var restyleInterval;

function restyleJanrain() {

    logIt('restyleJanrain running');



    /*ALternative Method using janrain api*/



    /*end of alternative method*/




    $('#janrainEngageEmbed').css('visibility', 'hidden');
    $('#janrainEngageEmbed').css('margin-bottom', '50px');

    $('#janrainEngageEmbed').css('min-height', '400px');
    $('#janrainEngageEmbed').find('div').each(function() {
        $(this).attr('style', 'width: 100% !important;');
        $(this).css('text-align', 'center');
        $(this).css('font-family', '"Raleway", sans-serif;');
        $(this).css('font-size', '1em');
        $(this).css('color', '#fff');
        $(this).css('border', 'none');
        $(this).css('font-weight', '400');

        $(this).css('display', 'block');
        $(this).css('clear', 'both');

        $(this).css('background-color', 'transparent');
    });

    $('#janrainEngageEmbed').find('ul').attr('style', 'display: inline-block; margin:0px; padding:0px; list-style-type:none; width:190px !important; float:left');

    $('.janrainPage').find('li').attr('style', '');

    $('.janrainPage').find('li').each(function() {
        $(this).attr('style', 'width: 160px');
        $(this).css('height', '30px');
        $(this).css('font-family', '"Raleway", sans-serif;');
        $(this).css('font-weight', '400');
        $(this).css('background-color', 'transparent');
        $(this).css('background-image', 'none');
        $(this).css('padding', '3px');
    });

    if (mobileSize) {
        $('#janrainProviderPages').attr('style', 'width: 100% !important');

    } else {

        $('#janrainProviderPages').attr('style', 'width: 400px !important');
    }


    $('#janrainEngageEmbed').find('a').attr('style', 'margin: 20px; display: block; height: 30px; font-size: 1em; background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none;  font-weight: 400; font-family: "Raleway", sans-serif;');

    $('#janrainEngageEmbed').find('a').hover(function() {

        $(this).attr('style', 'margin: 20px; display: block; height: 30px; font-size: 1em; background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none;  font-weight: 400; font-family: "Raleway", sans-serif;');
        $(this).find('span').attr('style', 'font-size: 1em; font-family: "Raleway", sans-serif; font-weight: 400; color: rgba(255, 255, 255, 0.2) !important; margin: 3px');
        $(this).find('span').find('span').attr('style', 'font-size: 1em; font-family: "Raleway", sans-serif; font-weight: 400; color: rgba(255, 255, 255, 0.2) !important; margin: 3px');


    }, function() {
        $(this).attr('style', 'margin: 20px; display: block; height: 30px; font-size: 1em; background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none;  font-weight: 400; font-family: "Raleway", sans-serif;');
        $(this).find('span').attr('style', 'font-size: 1em; font-family: "Raleway", sans-serif; font-weight: 400; color: rgba(255, 255, 255, 1) !important; margin: 3px');
        $(this).find('span').find('span').attr('style', 'font-size: 1em; font-family: "Raleway", sans-serif; font-weight: 400; color: rgba(255, 255, 255, 1) !important; margin: 3px');




    });

    $('#janrainEngageEmbed').find('a').click(function() {
        $('#janrainEngageEmbed').css('visibility', 'hidden');

        //restyleInterval=window.setInterval(refreshTransparency, 10);


    });


    $('#janrainEngageEmbed').find('li').attr('style', 'background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none; font-weight: 400; font-family: "Raleway", sans-serif;');

    $('#janrainEngageEmbed').find('li').hover(function() {

        $(this).attr('style', 'background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none;  font-weight: 400; font-family: "Raleway", sans-serif;');
        $(this).find('span').attr('style', 'font-family: "Raleway", sans-serif; font-weight: 400; color: rgba(255, 255, 255, 0.2) !important; margin: 3px');


    }, function() {
        $(this).attr('style', 'background-color: transparent !important; color: rgba(255, 255, 255, 0.2); background-image:none; font-weight: 400; font-family: "Raleway", sans-serif;');
        $(this).find('span').attr('style', 'font-family: "Raleway", sans-serif; font-weight: 400; color: rgba(255, 255, 255, 1) !important; margin: 3px');




    });

    $('#janrainEngageEmbed').find('li').find('span').attr('style', 'font-family: "Raleway", sans-serif; font-weight: 400; color: #fff !important; margin: 3px');

    $('.janrainContent').css('height', '250px');
    $('.janrainContent').css('margin', '0px');

    $('.janrainHeader').css('width', '300px');
    $('.janrainHeader').css('margin', '0px auto 0px auto');
    $('.janrainHeader').css('text-align', 'center');
    $('.janrainHeader').css('padding-top', '20px');

    $('.janrainHeader div').html('Sign in or sign up via your favourite social media service:');



    if (mobileSize) {
        $('#janrainProviderPages').css('height', '1000px');
        $('#janrainProviderPages').css('width', '100%');

        $('#janrainProviders_0').attr('style', '');
        $('#janrainProviders_1').attr('style', '');

        $('.providers').css('width', '35% !important');
        $('.providers').css('display', 'inline-block');
        $('.providers').css('list-style-type', 'none');
        $('.providers').css('float', 'left');
        $('.providers').css('margin-left', '8%');

    } else {

        $('#janrainProviderPages').css('height', '400px');
        $('#janrainProviderPages').css('width', '380px');
        $('#janrainProviderPages').css('margin', '20px auto 20px auto');


    }



    $('.janrainSwitchAccountLink').attr('style', 'display:none !important');


    janrainReady = true;

    logIt('finished restyleJanrain code');
    $('#janrainEngageEmbed').css('visibility', 'visible');
}




//Janrain proprietary code to embed Social Network sign-on widget


(function() {

    if (typeof window.janrain !== 'object') window.janrain = {};
    if (typeof window.janrain.settings !== 'object') window.janrain.settings = {};

    janrain.settings.tokenUrl = baseURL + '/janrain_redirect.php';
    janrain.settings.type = 'embed';
    janrain.settings.tokenAction = 'hybrid';
    janrain.settings.poup = 'false';

    function isReady() {
        janrain.ready = true;
    };
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", isReady, false);
    } else {
        window.attachEvent('onload', isReady);
    }

    var e = document.createElement('script');
    e.type = 'text/javascript';
    e.id = 'janrainAuthWidget';

    if (document.location.protocol === 'https:') {
        e.src = baseURL + '/engage.js';
    } else {
        e.src = 'http://widget-cdn.rpxnow.com/js/lib/moodoo/engage.js';
    }

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(e, s);
})();


//function called when Janrain widget loads
function janrainWidgetOnload() {

    logIt('widget loaded');

    //restyleJanrain();



    janrain.events.onProviderLoginStart.addHandler(function(response) {
        logIt("Login Started");

    });


    janrain.events.onProviderLoginCancel.addHandler(function(response) {
        logIt("Login Cancelled!");
        logIt('trying to close janrain window');

        janrain.engage.signin.modal.close();
        signUserOut();
    });


    janrain.events.onProviderLoginComplete.addHandler(function(response) {
        logIt("Login complete - either successful or unsuccessful");
        logIt('trying to close janrain window');

        janrain.engage.signin.modal.close();
    });


    janrain.events.onProviderLoginToken.addHandler(function(response) {
        clearInterval(restyleInterval);
        logIt('got response: ' + response.token);
        $.ajax({
            type: "POST",
            url: "janrain_auth.php",
            data: "token=" + response.token,
            success: function(res, status, xhr) {
                logIt('res=' + res + ', status=' + status + ', xhr=' + xhr);

                for (var key in res) {
                    logIt('res[' + key + ']=' + res[key]);
                }
                logIt('identifier: ' + res.profile.identifier);
                logIt('displayName: ' + res.profile.displayName);
                logIt('primaryKey: ' + res.profile.primaryKey);
                if (res.profile.name) {
                    logIt('givenName: ' + res.profile.name.givenName);
                }
                logIt('sending social info to server');
                logIt('trying to close janrain window');
                janrain.engage.signin.modal.close();
                loadUser(null, res.profile);
            },
            error: function(data, status, xhr) {
                logIt('error when sending token to janrain');
                /*logIt ('data='+data+', status='+status+', xhr='+xhr);
                	for (var c in data){
	                	logIt(c+'='+data[c]);
	                	
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
	logIt('janrainWindowTimerCheck tick, timeSinceJanrainTimerStart='+timeSinceJanrainTimerStart);
	
	if (timeSinceJanrainTimerStart>5000){
		stopJanrainWindowTimer();
		
		
	}	else {
		jainrainWindowTimer=setTimeout("janrainWindowTimerCheck()", 100);
	}
}
//stops  timer set in janrainWindowTimerCheck()
function stopJanrainWindowTimer(){
	logIt('stopJanrainWindowTimer running');
	clearTimeout(jainrainWindowTimer);
	
	timeSinceJanrainTimerStart=0;
	
	logIt('trying to close janrain window');
                    
		janrain.engage.signin.modal.close();

}*/


////////////////////////////////////////
//GETTING USER DATA
///////////////////////////////////////

//function loadUser
//takes either userID from cookie or socialProfile ID from Janrain social sign-on and 
//queries Moodoo database to retrieve personal data including mood updates


function loadUser(userID, socialProfile) {
	
    logIt('loadUser running; userID=' + userID + ', socialProfile=' + socialProfile);
    $('#communication').html('<h1>Loading your data...</h1>');


    showDiv('communication');
    if (userID) {

		
        logIt('sending userID from browser to server, userID=' + userID);

        $.ajax({
            type: "POST",
            url: "moodoo_auth_main.php",
            data: {
                "userID": userID
            },
            success: function(res, status, xhr) {
                logIt('userID data send success! server says: res=' + res + ', status=' + status + ', xhr=' + xhr);


                logIt('php log:' + res.log);
                logIt('submitted query:' + res.query);
                logIt('create user query:' + res.createQuery);
                logIt('new user ID:' + res.newuserID);

                logIt('query success:' + res.success);
                logIt('social ID:' + res.socialID);
                logIt('user ID:' + res.userID);

                logIt('firstName:' + res.firstName);
                logIt('lastName:' + res.lastName);
                logIt('email:' + res.email);
                logIt('publishSocial:' + res.publishSocial);
                logIt('publishToMoodoo:' + res.publishToMoodoo);
                logIt('allowLocation:' + res.allowLocation);
                logIt('reminder:' + res.reminder);
                logIt('updates:' + res.updates);

                me.ID = res.userID;
                me.socialID = res.socialID;
                me.firstName = res.firstName;

                me.lastName = res.lastName;
                me.email = res.email;
                me.publishSocial = res.publishSocial;
                me.publishToMoodoo = me.publishToMoodoo;
                me.allowLocation = res.allowLocation;
                me.reminder = res.reminder;
                me.updates = res.updates;


                for (var k in res.updates) {
                    logIt('res.updates['+k+'].updateID='+res.updates[k].updateID);

                }


                if (res.newuserID) {
                    logIt('DETECTED NEW USER - CAN SEND TO GOOGLE FOR CONVERSION');
                }
                onDataRefreshed();



            },
            error: function(data, status, xhr) {
                logIt('ERROR! while trying to send cookie ID to server. data=' + data + ', status=' + status + ', xhr=' + xhr);
                for (var c in data) {
                    logIt(c + '=' + data[c]);

                }
            }
        });

    } else if (socialProfile) {


        logIt('sending socialProfile from janrain to moodoo server, socialProfile.identifier=' + socialProfile.identifier);
        if (socialProfile.name) {

            me.firstName = socialProfile.name.givenName;


            me.lastName = socialProfile.name.familyName;

        }


        $.ajax({
            type: "POST",
            url: "moodoo_auth_main.php",
            data: {
                "userID": userID,
                "firstName": me.firstName,
                "lastName": me.lastName,
                "socialID": socialProfile.identifier,
                "email": socialProfile.email
            },
            success: function(res, status, xhr) {
                logIt('socialProfile send success! server says: res=' + res + ', status=' + status + ', xhr=' + xhr);

                for (var key in res) {
                    logIt('looking at data; res[' + key + ']=' + res[key]);
                }

                logIt('submitted query:' + res.query);
                logIt('query success:' + res.success);
                // logIt('create user query:' +res.createQuery);
                logIt('new user ID:' + res.newuserID);

                logIt('user ID:' + res.userID);

                logIt('social ID:' + res.socialID);
                logIt('name:' + res.name);
                logIt('firstName:' + res.firstName);
                if (res.givenName) {
                    logIt('givenName:' + res.givenName);
                }
                logIt('lastName:' + res.lastName);
                logIt('email:' + res.email);
                logIt('publishSocial:' + res.publishSocial);
                logIt('publishToMoodoo:' + res.publishToMoodoo);
                logIt('allowLocation:' + res.allowLocation);
                logIt('reminder:' + res.reminder);

                logIt('updates:' + res.updates);
                logIt('newUser:' + res.newUser);

                me.ID = res.userID;
                me.socialID = res.socialID;
                me.firstName = res.firstName;

                me.lastName = res.lastName;
                me.email = res.email;
                me.publishSocial = res.publishSocial;
                me.publishToMoodoo = me.publishToMoodoo;
                me.allowLocation = res.allowLocation;
                me.reminder = res.reminder;
                me.updates = res.updates;


                for (var k in res.updates) {
                    //logIt('updates[k]='+res.updates[k]);

                }
                //google adwords conversion code -- doesn't work at this point
                if (res.newuserID) {
                    logIt('DETECTED NEW USER - CAN SEND TO GOOGLE FOR CONVERSION');
                    $(body).append('<div style="display:inline;"><img height="1" width="1" style="border-style:none;" alt="" src="//www.googleadservices.com/pagead/conversion/959257350/?label=tFlBCPyMslgQhra0yQM&amp;guid=ON&amp;script=0"/></div>');
                }

                //put returned ID in cookie - NO! how stupid!

                //$.cookie('moodooID', res.userID);
                //logIt('trying to access cookie:' + $.cookie('moodooID'));

                onDataRefreshed();
            },
            error: function(data, status, xhr) {
                logIt('ERROR! while trying to send social ID to server. data=' + data + ', status=' + status + ', xhr=' + xhr);
                for (var c in data) {
                    logIt(c + '=' + data[c]);

                }
            }
        });

    } else {

        logIt('ERROR: neither cookie id nor socialProfile passed to loadUser function');
    }

}


function onDataRefreshed() {

    //$('#moodQuestion').html('Hey '+me.firstName+'! How are you feeling right now?');


    //signal that data has been reloaded for when updateMood calls this function

    dataRefreshed = true;


    $('#tools').css('display', 'inline-block');
    showDiv('moodInput');
    //initiate data visualization code
    createDisplay();
}


function showTools() {

    logIt('showTools running');
    $('#signOutButton').animate({
        opacity: 1,
        width: '4em',
        padding: '0.5em 0.5em'
    }, 100, function() {
        tools.open = true;
        //on animation finished

    });


}

function hideTools() {

    logIt('hideTools running');
    $('#signOutButton').animate({
        opacity: 0,
        width: '0px',
        padding: '0px'
    }, 100, function() {
        tools.open = false;
        //on animation finished

    });
}

function signUserOut() {

    $('#tools').css('display', 'none');


    //$.cookie('moodooID', null);

    token = null;
    window.open(baseURL, '_self');
}


////////////////////////////
//UPDATES
///////////////////////////

//function to set mood for update

function setMood(mood) {

    logIt('setMood running');




    //$('#communication').html('<p>Setting Mood</p>');



    logIt('theMoods[mood]=' + theMoods[mood]);



    me.moodNum = mood;
    getLocation();
    $('#statusLabel').html('Why are you feeling ' + theMoods[mood] + '?');
    hideDiv('moodInput', 'statusBox');



}


//function to send mood data, including location and status msg to server


function updateMood() {

    logIt('updateMood running');


    $('#communication').html('<h1>Updating your mood...</h1>');

    hideDiv('statusBox', 'communication');

    //reset update status vars
    socialPublishFinished = false;
    dataRefreshed = false;
    //start update timer
    checkUpdateStatus();


	var tempStatus=escape($('#status').val());
    if (tempStatus){
	    me.status = tempStatus;
	} else {
		$('#status').val('Please enter a status to go with your mood.')
		hideDiv('communication', 'statusBox');
	}
    logIt('about to update status, me.status=' + me.status);

    logIt('updating mood, me.publishSocial=' + me.publishSocial);

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
            logIt('updateMood data sent successfully');
            updateMoodResponse(res);

        },
        error: function(data, status, xhr) {
            logIt('ERROR! updateMood failed');

            $('#communication').html('<h1>Oops! Something went wrong.</h1><p>We couldn\'t talk to the Moodoo server. <br/>Please check your connection and try again in a few minutes.<br/> Your mood has not been updated.</p>');
            showDiv('communication');
            logIt('data=' + data + ', status=' + status + ', xhr=' + xhr);
            for (var c in data) {
                logIt(c + '=' + data[c]);

            }
        }
    });



    if (me.publishSocial == 1) {
        publishToSocial();
    } else {
        socialPublishFinished = true;
    }
    $('#status').val('');
}


//server updates mood and responds, handler:
function updateMoodResponse(res) {

    logIt("updateMoodResponse running");
    logIt("res=" + res);

    if (res) {

        for (var keyname in res) {
            logIt("res[" + keyname + "]=" + res[keyname]);

        }
        if (res["moodUpdated"] == true) {

            logIt("Mood updated, refreshing data. me.ID=" + me.ID);
            dataRefreshed = false;
            //refresh my data

            loadUser(me.ID, null);


        } else {

            logIt("ERROR: Something wrong with the MySQL query, mood not updated in database!");
        }

    } else {

        logIt("ERROR: no data returned from updateMood script!");
    }




}

var checkUpdateStatusTick = 0;

function checkUpdateStatus() {

    logIt('checkUpdateStatus running');

    checkUpdateStatusTick++;

    updateMoodTimer = setTimeout("checkUpdateStatus()", 100);
    //if all update processes are done, stop animating logo, stop updateMoodTimer, remove wait div and refresh page with createDisplay



    if (socialPublishFinished && dataRefreshed) {
        logIt('all processes complete');
        clearTimeout(updateMoodTimer);

        //createDisplay(me.rawData);
    } else if (checkUpdateStatusTick > 50) {
        clearTimeout(updateMoodTimer);
    } else {
        logIt('chaeckUpdateStatus tick:' + checkUpdateStatusTick + ', socialPublishFinished=' + socialPublishFinished + ', dataRefreshed=' + dataRefreshed);
    }
}

//if user wants to change their mind about a mood before they update
function cancelUpdateAtStatus() {
	logIt('cancelUpdateAtStatus running');
    $('#status').val('');
    hideDiv('statusBox', 'moodInput');
}

function deleteUpdateConfirm(updateNo) {
    logIt('deleteUpdateConfirm running, updateNo=' + updateNo + ', updateID=' + me.updates[updateNo].updateID);
    $('#updateBox' + updateNo).toggleClass("transparent");

    $('#updateBox' + updateNo).html('<span class="confirmDeleteSpan">Are you sure you want to delete this update? <br/> <a href="javascript:deleteUpdate(' + parseInt(me.updates[updateNo].updateID) + ', ' + updateNo + ')" class="confirmDeleteButton">Delete</a><a href="javascript:cancelUpdateDelete(' + updateNo + ')" class="confirmDeleteButton">Cancel</a></span>');

}

function deleteUpdate(theUpdateID, updateNo) {
	
    logIt('deleting  update no:' + theUpdateID);

    $.ajax({
        type: "POST",
        url: "deleteMoodUpdate.php",
        data: {
            "updateID": theUpdateID

        },
        success: function(res, status, xhr) {
            logIt('deleteUpdate data sent successfully');
            deleteUpdateResponse(res, updateNo);

        },
        error: function(data, status, xhr) {
            logIt('ERROR! deleteUpdate failed');

            $('#updateBox' + updateNo).html('<span class="confirmDeleteSpan">Oops! Can\'t connect to Moodoo. Try again.<br/><a href="javascript:cancelUpdateDelete(' + updateNo + ')" class="confirmDeleteButton" style="margin-left: 50px">Cancel</a></span>');            logIt('data=' + data + ', status=' + status + ', xhr=' + xhr);
            for (var c in data) {
                logIt(c + '=' + data[c]);

            }
        }
    });
	
}

function deleteUpdateResponse(res, updateNo) {
    
    logIt("deleteUpdateResponse running");
    
    if (res.moodUpdateDeleted){
	    //update successfully deleted, reload data
	    logIt("update deleted, refreshing data. updateNo=" + updateNo);
    
	    
	    //fade out box
	    $('#updateBox' + updateNo).animate({
	
	        opacity: 0,
	        height: '0px'
	
	
	    }, 350, function() {
	        $('#updateBox' + updateNo).css('display', 'none');
	        //reload mood data after hiding box
	        dataRefreshed = false;
	        //refresh my data
	
	        loadUser(me.ID, null);
	    });

    }
    else {
	    
	    //unsuccessful - mood update not deleted
	    logIt('server returned an error:' + res.error);
	    
	    $('#updateBox' + updateNo).html('<span class="confirmDeleteSpan">Server can\'t find update! Moodoo gurus notified.<br/><a href="javascript:cancelUpdateDelete(' + updateNo + ')" class="confirmDeleteButton" style="margin-left:50px">Cancel</a></span>');
	    logError('Delete failed - update doesn\'t exist.', UserID, {'updateNo': updateNo});
    }
    


}

function cancelUpdateDelete(updateNo) {
    var updateBoxText=makeUpdateBox(updateNo);
    $('#updateBox' + updateNo).html(updateBoxText);
    $('#updateBox' + updateNo).toggleClass("transparent");

}

////////////////////////////////////////
//DATA VISUALIZATION
//////////////////////////////////////

//canvas for the main mooderator graph
var canvas;

//canvas context variables

var ctx;
var ctxMini;
//stores current graph as bitmap
var savedGraph;

var mooderatorHeight = 300;



var viewportWidth = $(window).width() - 110;
var mooderatorWidth = viewportWidth;

//normal background
var backgroundColour1 = "#47709E";
var backgroundColour2 = "#FFFFFF";

//background whilst dragging
var backgroundColour3 = "#3A5D7C";
var backgroundColour4 = "#FFFFFF";

//background when maximum drag left or right
var backgroundColour5 = "#FFFFFF";
var backgroundColour6 = "#47709E";


var startTime;
var timeSpan;
//border
var borderColour = "#666666";

//is the user dragging the graph or not?
var dragging;

//dragging minigraph slider
var dragOffset;
var rightMargin;

//touch zoom init size - what width is the graph at start of gesture?
var mooderatorWidthAtStartGesture=0;
//x pos of leftmost touch at start of gesture
var touchXAtStartGesture=0;

var baseXAtStartGesture=0;

var baseXAtTouchStart=0;

//init custom cursor
$('#mooderatorGraph').addClass('grab');

//from timeline - span of viewport in seconds - variable. I.e. how many seconds does the current viewport width represent?
var windowSpan;

//from timeline - width of the whole main timeline in pixels - default is window width
var pixelWidth;

//left scroll value - default is 0
var baseX = 0;
var miniBaseX = 0;
var baseXRatio = 0;

var canvasPoints;

//these values store the current slider width and position relative to the viewport size, so that when viewport is resized the slider can be accurately resized
var sliderWidthRatio = 0.9;
var sliderPosRatio = 0;
var mooderatorZoomRatio = 1;


var recentUpdatesHeight=600;
var recentUpdateTableHeight=360;
var columnHeight=360;
var recentUpdatesHeightMobile=1200;
var recentUpdateTableHeightMobile=700;

var columnHeightMobile=700;


function showRecentUpdates(noToShow) {
    logIt('showRecentUpdates running');
    var noOfUpdates = parseInt(me.updates.length);
    logIt('noOfUpdates=' + noOfUpdates + ', noToShow=' + noToShow);
	
	if (mobileSize) {
		recentUpdatesHeight=recentUpdatesHeightMobile;
		recentUpdateTableHeight=recentUpdateTableHeightMobile;
		columnHeight=columnHeightMobile
	}

    if (noToShow == 3) {
		 //showing only recent updates
		 logIt('showing 3 recents')
        
        
        $('#recentUpdates').animate({height: recentUpdatesHeight}, 500);
        	
        $('#recentUpdateTable').height(recentUpdateTableHeight);
        $('#updateCol1').height(columnHeight);
		
        $('#recentUpdateTable').html('');
        $('#showMoreUpdatesButton').css('display', 'block');
        $('#showRecentUpdatesButton').css('display', 'none');
        $('#showAllUpdatesButton').css('display', 'block');


        $('#recentUpdateTable').append('<div id="updateCol1" class="updatesColumn">');
       
        for (var v = 0; v < noToShow; v++) {
			
			var loopNo=parseInt(noOfUpdates-v-1);
			logIt('loopNo='+loopNo);

            var updateBoxText='<span id="updateBox' + loopNo.toString() + '" class="showUpdatesBox">'+makeUpdateBox(loopNo)+'</span>';   
				
            $('#updateCol1').append(updateBoxText);
            
            
            $('updateBox' + parseInt(noOfUpdates - v).toString()).data('boxNumber', loopNo);
            $('updateBox' + parseInt(noOfUpdates - v).toString()).data('updateID', me.updates[loopNo].updateID);
        }

        if (!mobileSize){
	        if ($('#recentUpdateTable').width() > 370) {
	            $('#recentUpdateTable').animate({
	
	                width: 370
	
	
	            }, 500);
	        }
        }



    } else if (noToShow == 6) {
        
        //showing 6 updates
        logIt('showing 6 updates')
        
        if (!mobileSize){
	        //create second column to the right
	        $('#recentUpdates').animate({
	            height: recentUpdatesHeight
	        }, 500, function() {});
	
	        $('#recentUpdateTable').animate({
	
	            width: 760
	
	
	        }, 500, function() {
	
	            $('#recentUpdateTable').append('<div id="updateCol2" style="opacity:0" class="updatesColumn">');
	            for (var v = 3; v < noToShow; v++) {
					var loopNo=parseInt(noOfUpdates-v-1);
					logIt('loopNo='+loopNo);
					var updateBoxText='<span id="updateBox' + loopNo.toString() + '" class="showUpdatesBox">'+makeUpdateBox(loopNo)+'</span>';
					
	                $('#updateCol2').append(updateBoxText);
	
	
	            }
	            $('#updateCol2').height(columnHeight);
	            $('#updateCol2').animate({
	                opacity: 1
	            }, 500, function() {});
	            $('#showRecentUpdatesButton').css('display', 'block');
	            $('#showAllUpdatesButton').css('display', 'block');
	            $('#showMoreUpdatesButton').css('display', 'none');
	
	
	        });
	        $('#showMoreUpdatesButton').css('display', 'none');
	        
        } else {
	        //extend single column
	        $('#recentUpdateTable').height(columnHeight*2.2)
	        $('#recentUpdates').animate({
	            height: columnHeight*2.8
	        }, 500, function() {});
	        
	        for (var v = 3; v < noToShow; v++) {
					var loopNo=parseInt(noOfUpdates-v-1);
					logIt('loopNo='+loopNo);
					var updateBoxText='<span id="updateBox' + loopNo.toString() + '" class="showUpdatesBox">'+makeUpdateBox(loopNo)+'</span>';   
					
	                $('#updateCol1').append(updateBoxText);
	
	
	        }
	        
	        $('#showRecentUpdatesButton').css('display', 'block');
	        $('#showAllUpdatesButton').css('display', 'block');
	        $('#showMoreUpdatesButton').css('display', 'none');

        }        
        
       

    } else {
	    logIt('showing all updates')
	    //showing all updates
		if (!mobileSize){
			var recentUpdateTableHeight= (noToShow / 2) * 112;
	       
		    
	        
	        $('#recentUpdates').animate({
	            height: recentUpdateTableHeight + 200
	        }, 500, function() {});
	         
	        
	        $('#recentUpdateTable').animate({
	
	            width: 760,
	            height: recentUpdateTableHeight
	
	        }, 500, function() {
	            console.log('test 3');
	            
	            $('#recentUpdateTable').append('<div id="updateCol2" style="opacity:0" class="updatesColumn">');
				
				logIt('finished recentUpdateTable resize animation');
				
	            for (var v = 3; v < noToShow; v++) {
	                var loopNo=parseInt(noOfUpdates-v-1);
	                
	                logIt('loopNo='+loopNo);
	
	                var updateBoxText='<span id="updateBox' + loopNo.toString() + '" class="showUpdatesBox">'+makeUpdateBox(loopNo)+'</span>';                   
	                console.log(' showing all updates; noToShow='+noToShow+', noToShow%2 ='+noToShow%2+', parseInt(noToShow/2 +2) ='+parseInt(noToShow/2 +2));
	                
	                if ((parseInt(noToShow) % 2 == 0) && (v<parseInt(noToShow/2))) {
	                    $('#updateCol1').append(updateBoxText);
	
	
	                } else if ((noToShow % 2 > 0) && (v<parseInt(noToShow/2+1))){
		                
		            	 $('#updateCol1').append(updateBoxText);
		            } else {
	                    $('#updateCol2').append(updateBoxText);
	
	                }
	            }
	
	            $('#updateCol1').height(recentUpdateTableHeight);
	
	            $('#updateCol2').height(recentUpdateTableHeight);
	            $('#updateCol2').animate({opacity: 1}, 500);
	            $('#showMoreUpdatesButton').css('display', 'none');
	            $('#showRecentUpdatesButton').css('display', 'block');
	            $('#showAllUpdatesButton').css('display', 'none');
			});
		} else {
				
				//extend single column 
				
				var recentUpdateTableHeight= noToShow * 255;
	       
		    
	        
		        $('#recentUpdates').animate({height: recentUpdateTableHeight + 500}, 500);
		        $('#recentUpdateTable').height(recentUpdateTableHeight);
		        $('#updateCol1').height(recentUpdateTableHeight);
		        
		        
		        for (var v = 3; v < noToShow; v++) {
	                var loopNo=parseInt(noOfUpdates-v-1);
	                
	                logIt('loopNo='+loopNo);
	
	                var updateBoxText='<span id="updateBox' + loopNo.toString() + '" class="showUpdatesBox">'+makeUpdateBox(loopNo)+'</span>';                
	                
	                
	                
		            
	                 $('#updateCol1').append(updateBoxText);
	
	                
	                
	            }
	            
	            $('#updateCol1').height(recentUpdateTableHeight);
	
	            $('#showMoreUpdatesButton').css('display', 'none');
	            $('#showRecentUpdatesButton').css('display', 'block');
	            $('#showAllUpdatesButton').css('display', 'none');
		        
		        
			}



       

    }

    showDiv('recentUpdates');
    
}


function makeUpdateBox(loopNo){
	var textForBox='<span class="updateIcon" style="background-image: url(images/' + theMoods[me.updates[loopNo].mood] + '_face.svg)"></span><span class="updateTitle" style="display:block; margin-top:10px">' + theMoods[me.updates[loopNo].mood] + '</span><span class="updateDate" style="font-size:0.7em; margin-top: 5px; display:block">' + convertDate(me.updates[loopNo].time) + '</span> <span class="recentUpdateBoxStatus">' + unescape(me.updates[loopNo].status) + '</span><a class="deleteButton" href="javascript:deleteUpdateConfirm(' + loopNo.toString() + ')">x</a></span>';

	return textForBox;
}

function drawMooderator() {
    //check current width of the graph viewport (area covered by graph)
    viewportWidth = $(window).width() - 110;
    //mooderatorWidth=viewportWidth;
	
	if (mobileSize){
		mooderatorHeight = 800;
	}
	
	
    //logIt('drawMooderator running');
    var moodData = me.updates;

	//logIt('drawMooderator: mooderatorHeight='+mooderatorHeight);
	//logIt('drawMooderator: mobileSize='+mobileSize);


    $('#mooderatorGraph').attr('width', $(window).width() - 100);
    $('#mooderatorGraph').attr('height', mooderatorHeight);
    $('#mooderatorGraph').css('display', 'block');
    $('#mooderatorGraph').css('width', $(window).width() - 100 + 'px');
    $('#mooderatorGraph').css('margin', '0px auto 0px auto');


    //logIt('at drawmooderator, moodData='+moodData);

    //logIt('mooderatorWidth='+mooderatorWidth);


    //get no of seconds between first update and last update (timespan)

    var tempStartTime = moodData[0]["seconds"];
    var tempEndTime = moodData[moodData.length - 1]["seconds"];



    var endTime;
    var tempTimespan = tempEndTime - tempStartTime;

    //logIt('tempStartTime='+tempStartTime+', tempEndTime='+tempEndTime+', tempTimespan='+tempTimespan);



    timespan = tempTimespan;
    startTime = tempStartTime;




    //DO DRAWING ON CANVAS


    //register canvas
    canvas = document.getElementById('mooderatorGraph');

    if (canvas) {
        logIt('canvas exists');
        if (canvas.getContext) {
            logIt('canvas.getContext exists');
            //new canvas context
            ctx = canvas.getContext("2d");
            //drawSimpleGraph(moodData);
            drawGraph(moodData);
        } else {

            logIt('drawmooderator - ERROR - no getContext method on canvas element');
        }
    } else {
        logIt('drawmooderator - ERROR -canvas isnt registered!');
    }




}

//=============================ORIGINAL LINE GRAPH CODE=================================================================//

function drawSimpleGraph(moodData) {
    logIt('drawSimpleGraph running');
    //array of each point on the graph
    var graphPoints = new Array();

    var pointGroup = 1;

    for (var k = 0; k < moodData.length; k++) {
        //get no of Seconds between this update and the first update
        var mySeconds = (moodData[k]["seconds"]) - startTime;
        //logIt('graphPoint '+k+': mySeconds='+mySeconds);
        //convert to ratio for drawing line graph
        graphPoints[k] = (mySeconds / timespan);

        //logIt('graphPoints['+k+']='+graphPoints[k]);
    }

    //clear canvas
    ctx.clearRect(0, 0, 450, 150);


    //set variable for min/max height for actual graph line
    var graphInnerHeight = mooderatorHeight - 30;

    //vertical distance fraction btwn each point on the gradient

    var gradientGap = (1 / 10);


    ctx.lineWidth = 0.5;


    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';




    var heightRatio = graphInnerHeight / 10;

    ctx.moveTo(baseX, (graphInnerHeight - (moodData[0]["mood"] * heightRatio)));
    ctx.beginPath();
    //logIt('moodData.length='+moodData.length);
    canvasPoints = new Array();

    //draw mood line graph
    for (var i = 0; i < moodData.length; i++) {

        var graphX = (graphPoints[i] * mooderatorWidth + baseX + 10);
        var nextGraphX = (graphPoints[i + 1] * mooderatorWidth + baseX + 10);



        var graphY = (10 + graphInnerHeight - (moodData[i]["mood"] * heightRatio));




        //check to see if next point will be in visible zone; if so, draw from this point (so that the height of the line is correct at x=0px)
        if (!(nextGraphX < 0)) {


            //check to see if next point is closer than one dot width - stops points crashing into each other

            if ((nextGraphX - graphX) > 2) {
                pointGroup++;
            } else {
                //logIt('drawGraph: points ' + i + ' and ' + (i + 1) + ' are closer than 2px');

            }


            //draw line to point
            ctx.lineTo(graphX, graphY);

            //store point in array

            canvasPoints.push({
                x: graphX,
                y: graphY,
                number: i,
                mood: moodData[i]["mood"],
                group: pointGroup
            });
            //logIt("canvasPoints["+i+"].x="+graphX+", y="+graphY);

        }


    }


    ctx.strokeStyle = "red";

    ctx.stroke();
    //logIt('drawing mood Icons onto mooderator graph');

    //draw coloured circle points onto mooderator graph
    ctx.lineWidth = 0;

    for (var u = 0; u < canvasPoints.length; u++) {
        var tempMoodNum = parseInt(canvasPoints[u].mood);

        var tempMood = parseInt(canvasPoints[u].mood);
        ctx.fillStyle = colourArray[tempMoodNum];

        ctx.strokeStyle = "rgba(255, 255, 255, 0)";	

        ctx.lineWidth = 0;

        var radius = 4;

        //logIt('drawing mooderator circles; canvasPoints[u].x='+canvasPoints[u].x+', canvasPoints[u].y='+canvasPoints[u].y);
        drawSolidCircle(ctx, canvasPoints[u].x, canvasPoints[u].y, radius);
    }

	
		
	

    showDiv('mooderator');




}

//=============================ENHANCED LINE GRAPH CODE=================================================================//



function drawGraph(moodData) {
    logsOn=false;
    logIt('drawGraph running');
    //array of each point on the graph
    graphPoints = new Array();
    //array to contain groups where points cluster in time
    pointGroups = new Array();
    //init array for first point group 
    pointGroups[0] = new Array();

    //set count of groups to 0
    var currentPointGroup = 0;

    //loop through all updates	
    for (var k = 0; k < moodData.length; k++) {
        //get no of Seconds between this update and the first update
        var mySeconds = (moodData[k]["seconds"]) - startTime;
        //logIt('graphPoint '+k+': mySeconds='+mySeconds);
        //convert to ratio for drawing line graph
        graphPoints[k] = (mySeconds / timespan);

        //logIt('graphPoints['+k+']='+graphPoints[k]);
    }
	
	
	
	var marginTolerance=dotRadius*3;
   	   

    //set variable for min/max height for actual graph line
    var graphInnerHeight = mooderatorHeight - 30;

    //vertical distance fraction btwn each point on the gradient

    var gradientGap = (1 / 10);

    //set line properties for line graph
    ctx.lineWidth = 0.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    //set height ratio to one tenth of whole graph height
    var heightRatio = graphInnerHeight / 10;

    //move context pen to first point location
    ctx.moveTo(baseX, (graphInnerHeight - (moodData[0]["mood"] * heightRatio)));
    ctx.beginPath();

    //clear global canvasPoints array
    while (canvasPoints.length > 0) {
        canvasPoints.pop();
    }

    //MAIN GRAPH DRAWING LOOP
    for (var i = 0; i < moodData.length; i++) {
        logIt('drawGraph: MAIN LOOP. i=' + i);
        //find x value for this point
        var graphX = (graphPoints[i] * mooderatorWidth + baseX + dotRadius);

        //find x of next point to compare for clustering detection

        var nextGraphX = (graphPoints[i + 1] * mooderatorWidth + baseX + dotRadius);
        //find x of previous point to compare for clustering detection
        if (graphPoints[i - 1]) {
            var prevGraphX = (graphPoints[i - 1] * mooderatorWidth + baseX + dotRadius);
        }




        var graphY = (10 + graphInnerHeight - (moodData[i]["mood"] * heightRatio));

        //check to see if next point will be in visible zone; if so, draw from this point (so that the height of the line is correct at x=0px)
        if (!(nextGraphX < 0)) {

			var leftMargin=0;
			var rightMargin=0;

			
			var group;
            //check to see if next point is closer than one dot width - stops points crashing into each other
            leftMargin = parseInt(graphX - prevGraphX);
            rightMargin = parseInt(nextGraphX - graphX);
            //logIt('drawGraph - point ' + i + ': leftMargin=' + leftMargin);
			//logIt('drawGraph - point ' + i + ': rightMargin=' + rightMargin);
            
            //should this point be placed in a group, or is it a standalone point?
            
            if (isNaN(leftMargin)){
				if (rightMargin<marginTolerance){
					group='first';
				}
				if (rightMargin>marginTolerance){
					group='none';
				}
			}
			
			if (leftMargin<marginTolerance){
				if (rightMargin<marginTolerance){
					group='current';
				}
				if (rightMargin>marginTolerance){
					group='current';
				}
			}
			
			if (leftMargin>marginTolerance){
				if (rightMargin<marginTolerance){
					group='next';
				}
				if (rightMargin>marginTolerance){
					group='none';
				}
				
			}
			
			if (isNaN(rightMargin)){
				if (leftMargin<marginTolerance){
					group='current';
				}
				if (leftMargin>marginTolerance){
					group='none';
				}
			}
			
			logIt('drawGraph-point '+i+': group type='+group);
			
			switch (group){
				
				
				case 'next':
					//code for next group
					
					
					//logIt('drawGraph - point ' + i + ' needs to group forward');
					var nextPointGroup=parseInt(currentPointGroup)+1;
	
	                logIt('drawGraph - placing  point ' + i + ' into group ' + nextPointGroup);
	                if (!pointGroups[nextPointGroup]) {
						pointGroups[nextPointGroup]=new Array();
					}
					
					
					if (!pointGroups[nextPointGroup]) {
						pointGroups[nextPointGroup]=new Array();
					}
					
	                pointGroups[nextPointGroup].push({
	                    x: graphX,
	                    y: graphY,
	                    number: null,
	                    mood: moodData[i]["mood"],
	                    time: moodData[i]["time"],
	                    inGroup: true,
	                    pointGroup: nextPointGroup
	                });
					
					//if (pointGroups[currentPointGroup].length>1){
						drawGroupPoint(currentPointGroup);
						currentPointGroup++;
					//}
					
					
	                

				break;
				
				case 'first':
				case 'current':
					//code for current group
					
					
					
					logIt('drawGraph - placing  point ' + i + ' into group ' + parseInt(currentPointGroup));
				
	                pointGroups[currentPointGroup].push({
	                    x: graphX,
	                    y: graphY,
	                    number: null,
	                    mood: moodData[i]["mood"],
	                    time: moodData[i]["time"],
	                    inGroup: true,
	                    pointGroup: parseInt(currentPointGroup)
	                });
	
	                //is this the last point? if so and it's in a group, render the whole group
	                if (i == moodData.length - 1) {
	                    drawGroupPoint(currentPointGroup);
	                    
	                }

					
					
				break;
				
				case 'none':
				default:
					//code for no group, independent point
					
					//first, render the last group point as average x and y
					//if (pointGroups[currentPointGroup].length>1){
	                	drawGroupPoint(currentPointGroup);
	                
	                	currentPointGroup++;
	                //}
	                //now, draw line to the clear point and add the clear point to canvasPoints
	                ctx.lineTo(graphX, graphY);
	
	                canvasPoints.push({
	                    x: graphX,
	                    y: graphY,
	                    updateNumber: i,
	                    mood: moodData[i]["mood"],
	                    group: false
	                });
	
	                currentPointGroup++;
	                if (!pointGroups[currentPointGroup]) {
						pointGroups[currentPointGroup]=new Array();
					}
	                pointGroups[currentPointGroup] = new Array();
				
									
			}
			
            //logIt('drawGraph - point ' + i + ': group=' + group);

        }


    }



    ctx.strokeStyle = "rgba(255, 255, 255, 1)";

    ctx.stroke();
    //logIt('drawing mood Icons onto mooderator graph');

    //draw coloured circle points onto mooderator graph
    //ctx.lineWidth = 0;
	var radius;
    for (var u = 0; u < canvasPoints.length; u++) {
        var tempMoodNum = parseInt(canvasPoints[u].mood);

        var tempMood = parseInt(canvasPoints[u].mood);
        ctx.fillStyle = colourArray[tempMoodNum];
		
         	
        //logIt('drawGraph: canvasPoints[u].group='+canvasPoints[u].group);
        
        
        
        
        if (canvasPoints[u].updateNumber) {
			//logIt('drawGraph: canvasPoints[' + u + '] has an update number; drawing ordinary point');      
            
             
			radius=dotRadius;
            
        } else {
            
			//logIt('drawGraph: canvasPoints[' + u + '] has no updateNumber; drawing a group point');
			//ctx.strokeStyle = "none"; //'#47709E';	
			
			//following code makes dot larger based on number of points in group
			var dotEnlargementRatio;
			if (!mobileSize){
				dotEnlargementRatio=4;
			}else {
				dotEnlargementRatio=8;
			}
			
			radius=dotRadius+((dotRadius/dotEnlargementRatio)*parseFloat(canvasPoints[u].pointsInGroup));
            //ctx.lineWidth = 0;//dotRadius/4;

			       
        }
		//logIt('drawing mooderator circles; canvasPoints[u].x='+canvasPoints[u].x+', canvasPoints[u].y='+canvasPoints[u].y);
        drawSolidCircle(ctx, canvasPoints[u].x, canvasPoints[u].y, radius);
    }

    logIt('drawGraph complete - no of updates=' + me.updates.length + ', no of pointGroups=' + pointGroups.length + ', no of canvasPoints=' + canvasPoints.length);
	if	(ctx){
		savedGraph = ctx.getImageData(0,0, mooderatorWidth+50, mooderatorHeight+50);
	}
    logIt('just saved graph state: savedGraph='+savedGraph);
	
    showDiv('mooderator');

	
   logsOn=true;

}

function drawGroupPoint(currentPointGroup) {
	logIt('drawGroupPoint - rendering group ' + currentPointGroup);
	
	//get averages & minmax for current group
	if (pointGroups[currentPointGroup].length > 0) {
		//init vars to push into pointgroup metadata array
	    var tempXTotal = 0;
	    var tempXAvg = 0;
	    var tempYTotal = 0;
	    var tempYAvg = 0;
	    var tempMoodTotal = 0;
	    var tempMoodAvg = 0;
	    var tempEarliestDate;
	    var tempLatestDate;
	    //find average X, Y and Mood of group:
	    var minMaxMoodArray = new Array();
	    for (z in pointGroups[currentPointGroup]) {
	        //logIt('drawGraph: pointGroups[currentPointGroup][z].x='+pointGroups[currentPointGroup][z].x);
	        tempXTotal += pointGroups[currentPointGroup][z].x;
	        tempYTotal += pointGroups[currentPointGroup][z].y;
	        tempMoodTotal += parseInt(pointGroups[currentPointGroup][z].mood);
	
	        minMaxMoodArray.push(pointGroups[currentPointGroup][z].mood);
	
	    }
	    logIt('drawGroupPoint: tempXTotal=' + tempXTotal);
	
	    tempXAvg = tempXTotal / parseInt(pointGroups[currentPointGroup].length);
	    logIt('drawGroupPoint: pointGroups[currentPointGroup].length=' + pointGroups[currentPointGroup].length);
	    logIt('drawGroupPoint: tempXAvg=' + tempXAvg);
	
	    tempYAvg = tempYTotal / parseInt(pointGroups[currentPointGroup].length);
	
	    logIt('drawGroupPoint: tempYAvg=' + tempYAvg);
	    
	    logIt('drawGroupPoint: tempYAvg=' + tempYAvg);
	    
	    
	    var pointGroupLength= parseInt(pointGroups[currentPointGroup].length);
	    
	    logIt('drawGroupPoint: pointGroupLength=' + pointGroupLength);
	    
	    logIt('drawGroupPoint: tempMoodTotal=' + tempMoodTotal);

	    
	    tempMoodAvg = Math.floor(tempMoodTotal / pointGroupLength);
		
	
	    tempMaxMood = Math.max.apply(Math, minMaxMoodArray);
	    tempMinMood = Math.min.apply(Math, minMaxMoodArray);
		
		
		//find the earliest and latest times in this group so span can be shown at showToolTip
		tempEarliestDate=convertDate(pointGroups[currentPointGroup][0].time);
		tempLatestDate=convertDate(pointGroups[currentPointGroup][pointGroupLength-1].time);
		
		
		logIt('drawGroupPoint: tempMoodAvg=' + tempMoodAvg);
	
	    logIt('drawGroupPoint: tempMaxMood' + tempMaxMood);
		
		logIt('drawGroupPoint: tempMinMood' + tempMinMood);

		
	    //draw line to group average x and y
	    ctx.lineTo(tempXAvg, tempYAvg);
	
	    //add single point reference for whole group
	    var tempNumber = parseInt(canvasPoints.length + 1);
	    canvasPoints.push({
	        x: tempXAvg,
	        y: tempYAvg,
	        updateNumber: null,
	        mood: tempMoodAvg,
	        maxMood: tempMaxMood,
	        minMood: tempMinMood,
	        avgMood: tempMoodAvg,
	        earliestDate: tempEarliestDate,
	        latestDate: tempLatestDate,
	        group: true,
	        pointsInGroup: pointGroups[currentPointGroup].length,
	        groupNo: currentPointGroup
	    });
	
	
	    
	}
	
}
        //=============================GRAPH ZOOM SLIDER BAR=================================================================//


function drawMooderatorControl() {
    logIt('drawMooderatorControl running');


    $('#miniGraph').attr('width', viewportWidth);
    $('#miniGraph').attr('height', 80);
    $('#miniGraph').width(viewportWidth);
    if ($('#miniGraphSlider').width() > viewportWidth) {
        $('#miniGraphSlider').width(viewportWidth);
    }
    $('#miniGraphSlider').css('margin-left', 'auto');
    $('#miniGraphSlider').css('margin-right', 'auto');


    $('#miniGraph').css('display', 'block');
    $('#miniGraph').css('margin', '0px auto 100px auto');


    //register canvas
    canvasMini = document.getElementById('miniGraph');


    if (canvasMini) {
        //logIt('canvasMini exists');
        if (canvasMini.getContext) {
            //logIt('canvasMini.getContext exists');
            //new canvas context
            ctxMini = canvasMini.getContext("2d");
            drawMiniGraph(me.updates);
        } else {

            logIt('drawmooderator - ERROR - no getContext method on canvasMini element');
        }
    } else {
        logIt('drawmooderator - ERROR -canvasMini isnt registered!');
    }

}


function drawMiniGraph(moodData) {
    logIt('drawMiniGraph running');



    //array of each point on the graph
    var graphMiniPoints = new Array();

    for (var k = 0; k < moodData.length; k++) {
        //get no of Seconds between this update and the first update
        var mySeconds = (moodData[k]["seconds"]) - startTime;
        //logIt('graphPoint '+k+': mySeconds='+mySeconds);
        //convert to ratio for drawing line graph
        graphMiniPoints[k] = (mySeconds / timespan);

        //logIt('graphPoints['+k+']='+graphMiniPoints[k]);
    }

    //clear canvas
    ctxMini.clearRect(0, 0, 450, 150);
    //logIt('clearing mini canvas');

    //set variable for min/max height for actual graph line
    var graphMiniInnerHeight = 50;

    //vertical distance fraction btwn each point on the gradient

    var gradientGap = (1 / 10);


    ctxMini.lineWidth = 0.5;


    ctxMini.lineCap = 'round';
    ctxMini.lineJoin = 'round';




    var heightRatio = graphMiniInnerHeight / 10;

    ctxMini.moveTo(miniBaseX, (graphMiniInnerHeight - (moodData[0]["mood"] * heightRatio)));
    ctxMini.beginPath();
    // logIt('moodData.length='+moodData.length);
    canvasMiniPoints = new Array();

    //draw mood line graph
    for (var i = 0; i < moodData.length; i++) {

        var graphX = (graphMiniPoints[i] * viewportWidth + miniBaseX + 5);
        var nextGraphX = (graphMiniPoints[i + 1] * viewportWidth + miniBaseX + 5);

        var graphY = (10 + graphMiniInnerHeight - (moodData[i]["mood"] * heightRatio));




        //check to see if next point will be in visible zone; if so, draw from this point (so that the height of the line is correct at x=0px)
        if (!(nextGraphX < 0)) {

            //draw line to point
            ctxMini.lineTo(graphX, graphY);




            //store point in array

            canvasMiniPoints.push({
                x: graphX,
                y: graphY,
                number: i,
                mood: moodData[i]["mood"]
            });
            //logIt("canvasMiniPoints["+i+"].x="+graphX+", y="+graphY);

        }


    }


    ctxMini.strokeStyle = "rgba(255, 255, 255, 1)";

    ctxMini.stroke();




}



function setMiniGraphSlider() {
    logIt('setMiniGraphSlider running');

    //set margin and offset for slider

    $('#miniGraphSlider').css('margin', '0px 0px');

    $('#miniGraphSlider').offset({
        top: $('#miniGraphSlider').offset().top,
        left: 55
    });




    //set mouse event handlers for slider	

    $('#sliderHandleRight').mousedown(function(e) {
        onMouseDownSliderRight(e);
    });
    $('#sliderHandleLeft').mousedown(function(e) {
        logIt('mousedown on slider left handle');
        onMouseDownSliderLeft(e);
    });

    $('#miniGraphSlider').mousedown(function(e) {
        logIt('mousedown on slider body');
        onMouseDownSliderBody(e);
    });

    $(document).mouseup(function(e) {
        onMouseUpDocument(e);
    });

    $(document).on('touchend', function(e) {
        onMouseUpDocument(e);
    });



    //set touch event handlers for slider - no longer necessary with pinch zoom
	/*
    $('#sliderHandleRight').on('touchstart', function(e) {
        logIt('touch on slider right handle');
        onTouchStartSliderRight(e);
    });

    $('#sliderHandleLeft').on('touchstart', function(e) {
        logIt('touch on slider left handle');
        onTouchStartSliderLeft(e);
    });

    $('#miniGraphSlider').on('touchstart', function(e) {
        onTouchStartSliderBody(e);
    });

    //if touch is detected anywhere on page, remove mouse event listeners as they conflict with touch events
    $(document).on('touchstart', function(e) {
        removeSliderMouseEvents();
    });


    $(document).on('touchend', function(e) {
        onTouchEndSlider(e);
    });

    $(document).on("touchcancel", function(e) {
        onTouchEndSlider(e);
    });
	*/
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

function zoomIn() {
    logIt('zoomIn running, mooderatorWidth=' + mooderatorWidth);
    //store old pixel width in a temp var - this is so we can work out how much to pan left to compensate for stretching & make a smooth zoom
    var oldMooderatorWidth = mooderatorWidth;
    var oldCentre = Math.abs(baseX) + (($('#mooderatorGraph').width() - 10) / 2);

    mooderatorWidth = mooderatorWidth * 1.25;

    var newCentre = (oldCentre / oldMooderatorWidth) * mooderatorWidth;


    var scrollAmount = 0;



    //conditional stops zoom from pushing timespans beyond 'now' point
    logIt('baseX=' + baseX);
    //if (baseX<startX) {
    scrollAmount = newCentre - oldCentre;

    //}

    logIt('baseX=' + baseX);
    logIt('oldMooderatorWidth=' + oldMooderatorWidth);
    logIt('mooderatorWidth=' + mooderatorWidth);
    logIt('oldCentre=' + oldCentre);
    logIt('newCentre=' + newCentre);
    logIt('scrollAmount=' + scrollAmount);

    scrollRight(scrollAmount);
}


function zoomOut() {
    logIt('zoomOut running, mooderatorWidth=' + mooderatorWidth);

    var oldMooderatorWidth = mooderatorWidth;
    var oldCentre = Math.abs(baseX) + (($('#mooderatorGraph').width() - 10) / 2);


    mooderatorWidth = mooderatorWidth * 0.80;

    if (mooderatorWidth < ($('#mooderatorGraph').width() - 10)) {

        mooderatorWidth = ($('#mooderatorGraph').width() - 10);
    }

    var newCentre = (oldCentre / oldMooderatorWidth) * mooderatorWidth;


    var scrollAmount = oldCentre - newCentre;

    scrollLeft(scrollAmount);
}



//scrolling/zooming functions for line graph

function zoomToSlice(sliceWidth, slicePos) {
    logIt('zoomTo running, mooderatorWidth='+mooderatorWidth+', sliceWidth='+sliceWidth+', slicePos='+slicePos);
    
    //store old pixel width in a temp var - this is so we can work out how much to pan left to compensate for stretching & make a smooth zoom
    var oldMooderatorWidth = mooderatorWidth;
    var oldCentre = Math.abs(baseX) + (($('#mooderatorGraph').width() - 10) / 2);

    //logIt('viewportWidth='+viewportWidth);

    //logIt('sliceWidth='+sliceWidth);


    mooderatorWidth = viewportWidth * viewportWidth / sliceWidth;




    var scrollAmount = 0;

    //new way of calculating scroll amount: get x pos of slider & multiply by ratio of slider to mooderatorWidth to work out x pos of big graph

    var smallToBigRatio = mooderatorWidth / viewportWidth;
    scrollAmount = slicePos * smallToBigRatio;




    //logIt('baseX='+baseX);
    //logIt('oldMooderatorWidth='+oldMooderatorWidth);
    //logIt('mooderatorWidth='+mooderatorWidth);
    //logIt('smallToBigRatio='+smallToBigRatio);


    //logIt('scrollAmount='+scrollAmount);


    baseX = -scrollAmount;

    //store scrollAmount as percentage of window width for window rezize handler
    baseXRatio = scrollAmount / $(window).width();



    drawMooderator();
}

function zoomChangeTouch(gestureScale, gestureX){
    logIt('zoomChangeTouch running, gestureScale='+gestureScale+', gestureX='+gestureX)
    logIt('gestureScale*mooderatorWidth='+gestureScale*mooderatorWidth);
    
    var zoomRatio=gestureScale;
	var scrollAmount = 0;
	
	logIt('zoomChangeTouch: baseXAtTouchStart='+baseXAtTouchStart);
	
	logIt('zoomChangeTouch: mooderatorWidthAtStartGesture='+mooderatorWidthAtStartGesture);
	logIt('zoomChangeTouch: touchMidPointAtStartGesture='+touchMidPointAtStartGesture);


    mooderatorWidth = mooderatorWidthAtStartGesture*zoomRatio;
   
   logIt('zoomChangeTouch: new mooderatorWidth='+mooderatorWidth);

   
   if (mooderatorWidth < ($('#mooderatorGraph').width() - 10)) {

        mooderatorWidth = ($('#mooderatorGraph').width() - 10);
    }
	
	//diagnostic var only
	var widthDifference=mooderatorWidthAtStartGesture-mooderatorWidth;
	
	logIt('zoomChangeTouch: widthDifference='+widthDifference);


    var scrollAmount = 0;

    var midPointOnGraphDiv=touchMidPointAtStartGesture;
    
    logIt('zoomChangeTouch: midPointOnGraphDiv='+midPointOnGraphDiv);

    
    var midPointOnWholeGraph=touchMidPointAtStartGesture-baseXAtTouchStart;
    
    logIt('zoomChangeTouch: midPointOnWholeGraph='+midPointOnWholeGraph);

    
    
    var newMidPoint=midPointOnWholeGraph * zoomRatio;

	logIt('zoomChangeTouch: newMidPoint='+newMidPoint);

    
   
    scrollAmount = newMidPoint-midPointOnWholeGraph;
	
	

    logIt('zoomChangeTouch: scrollAmount='+scrollAmount);


    
    
    
    //logIt('zoomChangeTouch: new mooderatorWidth='+mooderatorWidth);
	//logIt('zoomChangeTouch: $("#mooderatorGraph").width()='+$('#mooderatorGraph').width());
	
	//logIt('zoomChangeTouch: $("#mooderatorGraph").width()-mooderatorWidth='+parseFloat($("#mooderatorGraph").width()-mooderatorWidth));
	
	
    

   
	scrollGraph(scrollAmount);

    //drawMooderator();

    

    

}


function scrollGraph(amount) {
    logIt('scrollGraph: amount='+amount);
    logIt('scrollGraph: old baseX='+baseX);

    
    if (!amount) {

        amount = 0;
    }
    baseX = baseXAtTouchStart-amount;
    if (baseX >= 0) {
      baseX = 0;
    }
    logIt('scrollGraph: new baseX='+baseX);
    logIt('scrollGraph: baseX+mooderatorWidth='+parseFloat(baseX+mooderatorWidth));
    
    logIt('scrollGraph: $("#mooderatorGraph").width()='+$('#mooderatorGraph').width());
    
    if (parseFloat(baseX+mooderatorWidth) <= $('#mooderatorGraph').width()) {
        baseX = parseFloat($('#mooderatorGraph').width()-mooderatorWidth);
    }
    
    
    drawMooderator();
}

/*function scrollRight(amount) {
    if (!amount) {
        amount = 10;
    }

    baseX -= amount;

    drawMooderator();
}*/



function createMoodPie(highlight) {
    logIt('createMoodPie running');

    noOfUpdates = me.updates.length;
    logIt('noOfUpdates=' + noOfUpdates);
    var moodFrequency = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    var pieSlicePercentages = new Array();

    for (var z = 0; z < me.updates.length; z++) {
        var thisMood = parseInt(me.updates[z].mood);
        moodFrequency[thisMood] += 1;



    }
    logIt('moodFrequency=' + moodFrequency);



    for (var p in moodFrequency) {
        if (moodFrequency[p] > 0) {
            var tempPercentage = parseInt(moodFrequency[p]) / noOfUpdates;
            //logIt('pushing new pieSlicePercentage: number='+tempPercentage+'; colour='+colourArray[p]);
            pieSlicePercentages.push(new Object({
                number: tempPercentage,
                colour: colourArray[p]
            }));
        } else {
            pieSlicePercentages.push(new Object({
                number: 0,
                colour: null
            }));
        }
    }
    logIt('pieSlicePercentages=' + pieSlicePercentages);


   logIt('createMoodPie: viewportWidth='+viewportWidth);
	
    var pieWidth; 
    if (mobileSize){
        pieWidth = parseFloat(viewportWidth * 0.9);
    } else {
        pieWidth = parseFloat(viewportWidth / 2);
    }
    $('#moodPie').data('myHeight', pieWidth + 300);

    $('#moodPieGraph').attr('width', pieWidth);
    $('#moodPieGraph').attr('height', pieWidth);
    $('#moodPieGraph').css('margin-left', 'auto');
    $('#moodPieGraph').css('margin-right', 'auto');

    logIt('pieWidth=' + pieWidth);

    drawPie(pieSlicePercentages, (pieWidth/ 2), highlight);
    
    if (!mobileSize){
    	$('#moodPieLabel').css('top', -(pieWidth / 2) - 75 + 'px');
    	$('#moodPieLabel').css('left', $("#moodPieGraph").offset().left + (pieWidth / 2) - 75 + 'px');
    } else {
        $('#moodPieLabel').css('top', -(pieWidth / 2) - ($('#moodPieLabel').width()/2) + 'px');
    	$('#moodPieLabel').css('left', $("#moodPieGraph").offset().left + (pieWidth / 2) - ($('#moodPieLabel').width()/2) + 'px');
    }
    
    
    
    logIt('highlight=' + highlight);
    
    
    if (highlight != undefined && pieSlicePercentages[highlight].number > 0) {
        $('#moodPieLabel #moodIcon').css('background-image', 'url(images/' + theMoods[highlight] + '_face.svg)');
        $('#moodPieLabel #moodTextLabel').html(theMoods[highlight] + '<br/>');
        var roundPercentage = Math.floor(pieSlicePercentages[highlight].number * 100);
        $('#moodPieLabel #percentage').html('<span style="font-size:3em">' + roundPercentage + '%</span><br/> of updates');
    } else {
        $('#moodPieLabel #moodIcon').css('background-image', 'none');
        $('#moodPieLabel #moodTextLabel').html('');
        $('#moodPieLabel #percentage').html('');

    }
}

function drawPie(percentages, theRadius, highlight) {
    logIt('drawPie running; theRadius='+theRadius);
    var pieCanvas = document.getElementById('moodPieGraph');
    pieCanvas.imageSmoothingEnabled = true;


    if (pieCanvas.getContext) {
        pieContext = pieCanvas.getContext("2d");
    }

    pieContext.lineWidth = 1;
    pieContext.lineCap = 'round';
    pieContext.lineJoin = 'round';

    //create mask to cut out middle of pie

    // Save the state, so we can undo the clipping
    pieContext.save();
	
    // Create a circle
    pieContext.beginPath();

    pieContext.arc(theRadius, theRadius, theRadius, 0, Math.PI * 2, true);
	
	
	var holeMaskRadius;
	if (!mobileSize){
		holeMaskRadius=theRadius/3;
	}else{
		holeMaskRadius=theRadius/2;
	}

    pieContext.arc(theRadius, theRadius, holeMaskRadius, 0, Math.PI * 2, false);
    pieContext.closePath();
    // Clip to the current path
    pieContext.clip();


    var lastAngle = 0;
    for (var g = 0; g < percentages.length; g++) {
        //logIt('lastAngle='+lastAngle);
        if (percentages[g].number > 0) {


            pieContext.beginPath();
            pieContext.moveTo(theRadius, theRadius);


            //logIt('percentages[g].colour='+percentages[g].colour);
            //logIt('percentages[g].number='+percentages[g].number);

            var pieGrad = pieContext.createLinearGradient(0, 0, 0, 300);

            pieGrad.addColorStop(0, percentages[g].colour);


            pieGrad.addColorStop(1, "#000000");


            pieContext.fillStyle = percentages[g].colour;

            var angle = (Math.PI * 2) * percentages[g].number;

            var theLength = theRadius;


            pieContext.arc(theRadius, theRadius, theLength, lastAngle - 0.01, lastAngle + angle + 0.01, false);
            pieContext.closePath();
            pieContext.fill();
            if (highlight != undefined) {
                if (g == highlight) {
                    pieContext.fillStyle = 'rgba(255,255, 255, 0.2)';


                    pieContext.arc(theRadius, theRadius, theRadius, lastAngle - 0.01, lastAngle + angle + 0.01, false);
                    pieContext.closePath();
                    pieContext.fill();
                }
            }


            lastAngle += angle;
        }


    }


    showDiv('moodPie');
}


function createDisplay(value) {
    logIt('createDisplay running; me.updates=' + me.updates);
    if (me.updates) {
        if (me.updates.length > 1) {

            $('#communication').html("<h1>Hey, " + me.firstName + ", how are you feeling right now?</h1>");
            showDiv('communication');
			if (me.updates.length>3){
            	showRecentUpdates(3);
            }
            drawMooderator();
            $('#graphHelp').html('You can zoom in on the graph by using pinch-zoom.');
			if (!mobileSize){
            	drawMooderatorControl();
            	$('#graphHelp').html('You can zoom in on the graph by dragging the white handles<br/> on the mini-graph below:');
            }
            
            createMoodPie(null);
        } else {
            $('#communication').html("<h1>Less than 2 Mood Updates</h1><p>Hey, " + me.firstName + ", it looks like you've updated your mood less than twice so far. To really see what Moodoo can do, let us know how you're feeling now!</p>");
            showDiv('communication');
        }
    } else {
        $('#communication').html("<h1>No Mood Updates</h1><p>Hey, " + me.firstName + ", it looks like you haven't done any mood updates yet. To get started with Moodoo, let us know how you're feeling now!</p>");
        showDiv('communication');
    }

	if (!mobileSize){
    	setMiniGraphSlider();
	}

    showDiv('moodInput');
    showDiv('tools');
    hideDiv('auth');
}


function onViewportResize() {
    logIt('onViewportResize running');




    var newViewportWidth = $(window).width() - 110;

    var newSliderWidth = $(window).width() * sliderWidthRatio;

    var newSliderPos = newViewportWidth * sliderPosRatio;

    var newMooderatorWidth = newViewportWidth * mooderatorZoomRatio;

    var newBaseX = newViewportWidth * baseXRatio;
    logIt('newSliderWidth=' + newSliderWidth + ', newSliderPos=' + newSliderPos + ', mooderatorZoomRatio=' + mooderatorZoomRatio);


    $('#miniGraphSlider').css('width', newSliderWidth + 'px');



    $('#miniGraphSlider').offset({
        top: $('#miniGraphSlider').offset().top,
        left: newSliderPos
    });
	
	

	logIt('viewportResize: pieWidth='+pieWidth);
	
    $('#moodPieLabel').css('top', -(pieWidth / 2) - 75 + 'px');
    $('#moodPieLabel').css('left', $("#moodPieGraph").offset().left + (pieWidth / 2) - 75 + 'px');


    mooderatorWidth = newMooderatorWidth;
    viewportWidth = newViewportWidth;
    
    logIt('viewportResize: viewportWidth='+viewportWidth);
	
    var pieWidth; 
    if (mobileSize){
        pieWidth = parseFloat(viewportWidth * 0.9);
    } else {
        pieWidth = parseFloat(viewportWidth / 2);
    }
    
    //createMoodPie(null);
    
    
    baseX = -newBaseX;
    if (me.updates) {
        if (me.updates.length > 1) {
            drawMooderator();
            if (!mobileSize){
              drawMooderatorControl();
            }

        }
    }
    
    
    
}



//////////////////////////////////////////
//MOUSE EVENT HANDLERS
////////////////////////////////////////

function onMouseOverGraph(e) {
    logIt('mouseover on graph');
    $('#mooderatorGraph').mousemove(function(e2) {

        onMouseMoveGraph(e2);
    });

}

function onMouseOutGraph(e) {
    logIt('onMouseOutGraph running');

    $('#mooderatorGraph').off('mousemove', $('#mooderatorGraph'), onMouseMoveGraph);



}

function onMouseMoveGraph(e) {
    logIt("onMouseMoveGraph");
    //if (typeof savedGraph=='ImageData'){
		ctx.putImageData(savedGraph, 0, 0);
	//}
    var graphOffset = $('#mooderatorGraph').offset();
    var mousePos = {
        x: e.pageX - graphOffset.left,
        y: e.pageY - graphOffset.top
    };
    var hit = false;
    //logIt("mousePos.x="+mousePos.x);
    //logIt("mousePos.y="+mousePos.y);
	var hitZone=dotRadius*5;
	
    for (var i = 0; i < canvasPoints.length; i++) {
        var testX = Math.round(canvasPoints[i].x);
        var testY = Math.round(canvasPoints[i].y);

        //logIt("testX="+testX);
        //logIt("testY="+testY);
		
		 

        if ((testX > (mousePos.x - hitZone) && testX < (mousePos.x + hitZone)) && ((testY > (mousePos.y - hitZone)) && (testY < (mousePos.y + hitZone)))) {
            logIt("hit");
            hit = true;


            
			showToolTip(canvasPoints[i].x, canvasPoints[i].y, canvasPoints[i].updateNumber, i);

        }
        if (hit != true) {
          	//logIt("no hit");
          	//if (typeof savedGraph=='ImageData'){
		  		//logIt("replacing saved graph image");
		  	ctx.putImageData(savedGraph, 0, 0);
			//}
          	hideToolTip();
		  	
            

        }
    }




}


//touch handlers for graph

var touchStartX=0;
var touchMoveX=0;


function onTouchStartGraph(e){
	logIt('onTouchStartGraph');
	//for (key in e.originalEvent.targetTouches){
		//logIt('e.originalEvent.targetTouches['+key+']='+e.originalEvent.targetTouches[key]);
	//}
	
	//for (key in e.target){
		//logIt('e.target['+key+']='+e.target[key]);
	//}
	
	
	//for android touch event bug
	
	
	if( navigator.userAgent.match(/Android/i) ) {
	    touchEvent.preventDefault();
	}

	//end android touch event bug code
	
	var noOfTouches=e.originalEvent.targetTouches.length;
	
	logIt('noOfTouches='+noOfTouches);
	baseXAtTouchStart=baseX;
	
	logIt('baseXAtTouchStart='+baseXAtTouchStart);
	
	if (noOfTouches>1){
		var touch1X=parseFloat(e.originalEvent.targetTouches[0].pageX-e.target.offsetLeft);
		var touch2X=parseFloat(e.originalEvent.targetTouches[noOfTouches-1].pageX-e.target.offsetLeft);
		
		var midPoint=(touch2X+touch1X)/2;
		
		var touchY=parseFloat(e.originalEvent.targetTouches[0].pageY-e.target.offsetTop);
				
		//ctx.fillStyle='rgba(255, 255, 255, 1)';
		//ctx.moveTo(midPoint, touchY);
		//drawSolidCircle(ctx, midPoint, touchY, 20);
	} else {
		touchStartX=parseFloat(e.originalEvent.targetTouches[0].pageX-e.target.offsetLeft);
		logIt('touchStartX='+touchStartX);
	}
	
	
}
function onTouchMoveGraph(e){
	logIt('onTouchMoveGraph');
	//for (key in e.originalEvent.targetTouches){
	//	logIt('e.originalEvent.targetTouches['+key+']='+e.originalEvent.targetTouches[key]);
	//}
	touchMoveX=parseFloat(e.originalEvent.targetTouches[0].pageX-e.target.offsetLeft);
	logIt('touchMoveX='+touchMoveX);
	scrollAmount=(touchStartX-touchMoveX);
	logIt('scrollAmount='+scrollAmount);
	scrollGraph(scrollAmount);
}
function onTouchEndGraph(e){
	logIt('onTouchEndGraph');
	
}
function onTouchCancelGraph(e){
	logIt('onTouchCancelGraph');
}
	 


//touch zoom gesture handlers


function onGestureStartGraph(e){
    e.preventDefault();
    $('#mooderatorGraph').off('touchmove');
    logIt('touch gesture start');
    mooderatorWidthAtStartGesture=mooderatorWidth;
    touchMidPointAtStartGesture=e.originalEvent.layerX;
    baseXAtStartGesture=baseX;
}


function onGestureEndGraph(e){
    e.preventDefault();
    logIt('touch gesture end');
    $('#mooderatorGraph').on('touchmove', onTouchMoveGraph);
}

function onGestureChangeGraph(e){
   e.preventDefault();
    logIt('touch gesture change');
    //for (key in e.originalEvent){
      //  logIt('e.originalEvent['+key+']='+e.originalEvent[key]);
    //}
	
	
	zoomChangeTouch(e.originalEvent.scale, e.originalEvent.layerX); 
	 
}


//mini graph slider handlers

function onMouseDownSliderLeft(e) {
    logIt('mousedown on slider left handle');
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }

    if (e.stopPropagation) {
        e.stopPropagation();
    }

    rightMargin = $(window).width() - $('#miniGraphSlider').offset().left - $('#miniGraphSlider').width() - 50;

    $(document).mousemove(function(e2) {

        onMouseMoveSlider(e2, 'left');
    });



}

function onMouseDownSliderRight(e) {
    logIt('mousedown on slider right handle');
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    rightMargin = $(window).width() - $('#miniGraphSlider').offset().left - $('#miniGraphSlider').width() - 50;

    $(document).mousemove(function(e2) {

        onMouseMoveSlider(e2, 'right');
    });

    $(document).on('touchMove', function(e3) {

        onTouchMoveSlider(e3, 'right');
    });


}

function onMouseDownSliderBody(e) {
    logIt('mousedown on slider body');
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
    var xpos;
    if (e.originalEvent.touches) {
        xpos = e.originalEvent.touches[0].pageX - $('#miniGraph').offset().left;
    } else {
        xpos = e.pageX - $('#miniGraph').offset().left;
    }
    $('#miniGraphSlider').css('cursor', ' -webkit-grabbing');
    dragOffset = xpos - $('#miniGraphSlider').offset().left;

    $(document).mousemove(function(e2) {

        onMouseMoveSlider(e2, null);
    });

    $(document).on('touchMove', function(e4) {

        onTouchMoveSlider(e4, null);
    });

}


function onMouseMoveSlider(e, leftOrRight) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
    var xpos;
    if (e.originalEvent.touches) {
        xpos = e.originalEvent.touches[0].pageX - $('#miniGraph').offset().left;
    } else {
        xpos = e.pageX - $('#miniGraph').offset().left;
    }
    logIt('onMouseMoveSlider, e.pageX=' + e.pageX + ', e.pageY=' + e.pageY);
    if (leftOrRight == 'left') {
        //user is dragging left handle of the graph slider

        if (xpos > -5) {
            $('#miniGraphSlider').css('margin', '0px');
            $('#miniGraphSlider').offset({
                top: $('#miniGraphSlider').offset().top,
                left: xpos + $('#miniGraph').offset().left
            });
            logIt('mousemove left handle, rightMargin=' + rightMargin);
            $('#miniGraphSlider').css('width', $('#miniGraph').width() - xpos - rightMargin + 'px');
        }

    } else if (leftOrRight == 'right') {
        //user is dragging right handle of the graph slider
        //the new minigraphslider width has to be the whole minigraph width - original margin left - endoffset
        logIt('mousemove; over halfway');
        if (xpos < $('#miniGraph').width() + 10) {
            var originalMargin = parseInt($('#miniGraphSlider').offset().left);
            var endOffset = $('#miniGraph').width() - xpos;
            var newWidth = xpos - originalMargin + $('#miniGraph').offset().left;
            logIt('minigraph width=' + $('#miniGraph').width() + ', originalMargin=' + originalMargin + ', endOffset=' + endOffset + ', newWidth=' + newWidth);
            $('#miniGraphSlider').css('width', newWidth + 'px');
            $('#miniGraphSlider').offset({
                top: $('#miniGraphSlider').offset().top,
                left: originalMargin
            });
        }
    } else {
        //user is dragging the whole bar
        logIt('dragging whole bar; xpos=' + xpos + ' ,dragOffset=' + dragOffset);
        var newMargin = xpos - dragOffset + $('#miniGraph').offset().left;
        logIt('newMargin=' + newMargin);
        var leftBarrier = $('#miniGraph').offset().left - 5;
        var rightBarrier = $('#miniGraph').width() + $('#miniGraph').offset().left + 10;
        if (newMargin > leftBarrier && ($('#miniGraphSlider').width() + newMargin < rightBarrier)) {
            $('#miniGraphSlider').offset({
                top: $('#miniGraphSlider').offset().top,
                left: newMargin
            });

        }

    }
	zoomToSlice($('#miniGraphSlider').innerWidth(), $('#miniGraphSlider').offset().left - $('#miniGraph').offset().left);

    logIt('mousemove on slider, xpos=' + xpos);
}


/*function onTouchStartSliderLeft(e) {
    logIt('touchstart on slider left handle');
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }

    if (e.stopPropagation) {
        e.stopPropagation();
    }

    rightMargin = $(window).width() - $('#miniGraphSlider').offset().left - $('#miniGraphSlider').width() - 50;


    $('#miniGraphSlider').on('touchmove', function(e3) {

        onTouchMoveSlider(e3, 'left');
    });

}

function onTouchStartSliderRight(e) {
    logIt('touchstart on slider right handle');
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    rightMargin = $(window).width() - $('#miniGraphSlider').offset().left - $('#miniGraphSlider').width() - 50;



    $('#miniGraphSlider').on('touchmove', function(e3) {

        onTouchMoveSlider(e3, 'right');
    });


}

function onTouchStartSliderBody(e) {
    logIt('touchstart on slider body');
    if (e.preventDefault) { 
		e.preventDefault();
	} 
	else { 
		e.returnValue = false;
	}
    var xpos;
    if (e.originalEvent.touches) {
        xpos = e.originalEvent.touches[0].pageX - $('#miniGraph').offset().left;
    } else {
        xpos = e.pageX - $('#miniGraph').offset().left;
    }

    dragOffset = xpos - $('#miniGraphSlider').offset().left;



    $('#miniGraphSlider').on('touchmove', function(e4) {
        logIt('touchMove event')
        onTouchMoveSlider(e4, null);
    });
		
}


function onTouchMoveSlider(e, leftOrRight) {
    logIt('onTouchMoveSlider running, leftOrRight=' + leftOrRight);

    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
    var xpos;
    if (e.originalEvent.touches) {
        xpos = e.originalEvent.touches[0].pageX - $('#miniGraph').offset().left;
    } else {
        xpos = e.pageX - $('#miniGraph').offset().left;
    }
    logIt('onTouchMoveSlider, e.originalEvent.touches[0].pageX=' + e.originalEvent.touches[0].pageX);
    if (leftOrRight == 'left') {
        //user is dragging left handle of the graph slider

        logIt('dragging left handle; xpos=' + xpos + ' ,dragOffset=' + dragOffset);


        if (xpos > -5) {
            $('#miniGraphSlider').css('margin', '0px');
            $('#miniGraphSlider').offset({
                top: $('#miniGraphSlider').offset().top,
                left: xpos + $('#miniGraph').offset().left
            });
            logIt('mousemove left handle, rightMargin=' + rightMargin);
            $('#miniGraphSlider').css('width', $('#miniGraph').width() - xpos - rightMargin + 'px');
        }

    } else if (leftOrRight == 'right') {
        //user is dragging right handle of the graph slider
        //the new minigraphslider width has to be the whole minigraph width - original margin left - endoffset

        logIt('dragging right handle; xpos=' + xpos + ' ,dragOffset=' + dragOffset);

        if (xpos < $('#miniGraph').width() + 10) {
            var originalMargin = parseInt($('#miniGraphSlider').offset().left);
            var endOffset = $('#miniGraph').width() - xpos;
            var newWidth = xpos - originalMargin + $('#miniGraph').offset().left;
            logIt('minigraph width=' + $('#miniGraph').width() + ', originalMargin=' + originalMargin + ', endOffset=' + endOffset + ', newWidth=' + newWidth);
            $('#miniGraphSlider').css('width', newWidth + 'px');
            $('#miniGraphSlider').offset({
                top: $('#miniGraphSlider').offset().top,
                left: originalMargin
            });
        }
    } else {
        //user is dragging the whole bar
        logIt('dragging whole bar; xpos=' + xpos + ' ,dragOffset=' + dragOffset);
        var newMargin = xpos - dragOffset + $('#miniGraph').offset().left;
        logIt('newMargin=' + newMargin);
        var leftBarrier = $('#miniGraph').offset().left - 5;
        var rightBarrier = $('#miniGraph').width() + $('#miniGraph').offset().left + 10;
        if (newMargin > leftBarrier && ($('#miniGraphSlider').width() + newMargin < rightBarrier)) {
            $('#miniGraphSlider').offset({
                top: $('#miniGraphSlider').offset().top,
                left: newMargin
            });

        }

    }

    logIt('touchmove on slider, xpos=' + xpos);
}


function onTouchEndSlider(e) {
    logIt('onTouchEndSlider running');
    $(document).off('mousemove');
    $(document).off('touchmove');
    $('#miniGraphSlider').off('mousemove');
    $('#miniGraphSlider').off('touchmove');



    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }




    sliderWidthRatio = $('#miniGraphSlider').width() / ($(window).width());
    sliderPosRatio = $('#miniGraphSlider').offset().left / ($(window).width() - 110);
    mooderatorZoomRatio = mooderatorWidth / ($(window).width() - 110);

    logIt('at touchend, sliderWidthRatio=' + sliderWidthRatio + ', miniGraphSlider.offset().left=' + $('#miniGraphSlider').offset().left + ', sliderPosRatio=' + sliderPosRatio);

    zoomToSlice($('#miniGraphSlider').innerWidth(), $('#miniGraphSlider').offset().left - $('#miniGraph').offset().left);



}



*/




function onMouseOverPie(e) {
    logIt('onMouseOverPie running');
    $('#moodPieGraph').mousemove(function(e2) {

        onMouseMovePie(e2);
    });
}

function onMouseOutPie(e) {
    logIt('onMouseOutPie running');

    $('#moodPieGraph').off('mousemove', $('#moodPieGraph'), onMouseMovePie);
    $('#moodPieLabel #moodIcon').css('background-image', 'none');
    $('#moodPieLabel #moodTextLabel').html('');
    $('#moodPieLabel #percentage').html('');


}


function onMouseMovePie(e) {
    logIt('onMouseMovePie running');
    var graphOffset = $('#moodPieGraph').offset();
    var mousePos = {
        x: e.pageX - graphOffset.left,
        y: e.pageY - graphOffset.top
    };
    logIt('x:' + mousePos.x + ', y:' + mousePos.y);


    //var pos = findPos(this);
    // var x = e.pageX - pos.x;
    // var y = e.pageY - pos.y;
    // var coord = "x=" + x + ", y=" + y;

    var c = pieContext;
    var p = c.getImageData(mousePos.x, mousePos.y, 1, 1).data;
    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    logIt("hex=" + hex);
    logIt('colourArray.indexOf(hex)=' + colourArray.indexOf(hex));
    logIt("rolled over " + theMoods[colourArray.indexOf(hex)]);
    if (highlightArray.indexOf(hex) == -1 && colourArray.indexOf(hex) != -1) {
        createMoodPie(colourArray.indexOf(hex));
    }
}


function onMouseUpDocument(e) {
    logIt('mouseup');
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }

    $(document).off('mousemove');
    $(document).off('touchmove');
    $('#miniGraphSlider').off('mousemove');
    $('#miniGraphSlider').off('touchmove');

    //$(document).off('touchmove', '**');
    //$(document).off('mousemove', '**');
    $('#miniGraphSlider').css('cursor', ' -webkit-grab');

    sliderWidthRatio = $('#miniGraphSlider').width() / ($(window).width());
    sliderPosRatio = $('#miniGraphSlider').offset().left / ($(window).width() - 110);
    mooderatorZoomRatio = mooderatorWidth / ($(window).width() - 110);

    logIt('at mouseup, sliderWidthRatio=' + sliderWidthRatio + ', miniGraphSlider.offset().left=' + $('#miniGraphSlider').offset().left + ', sliderPosRatio=' + sliderPosRatio);

    zoomToSlice($('#miniGraphSlider').innerWidth(), $('#miniGraphSlider').offset().left - $('#miniGraph').offset().left);

    if (tools.open) {
        logIt('tools open, closing tools');
        //animate tools closing
        hideTools();
        tools.open = false;
    }

}



function showToolTip(posX, posY, updateNumber, canvasNumber) {
    logIt("showToolTip running; updateNumber=" + updateNumber + ", canvasNumber=" + canvasNumber + " $('#mooderatorGraph').offset().left=" + $('#mooderatorGraph').offset().left + "; posX=" + posX + "; posY=" + posY);
    $('#mooderatorPopUpLabel').css('visibility', 'visible');


    if (updateNumber == null) {
        $('#mooderatorPopUpLabel').html('<table><tr><td colspan = "2">Group of ' + canvasPoints[canvasNumber].pointsInGroup + ' updates </td></tr><tr><td colspan = "2">From ' + canvasPoints[canvasNumber].earliestDate + '</td></tr><tr><td colspan = "2">to ' + canvasPoints[canvasNumber].latestDate + '</td></tr><tr><td>Highest Mood</td><td> <img class="groupMoodIcon" src="images/' + theMoods[canvasPoints[canvasNumber].maxMood] + '_face.svg"/></td></tr><tr>  <td>Lowest Mood</td><td> <img class="groupMoodIcon" src="images/' + theMoods[canvasPoints[canvasNumber].minMood] + '_face.svg"/></td></tr><tr><td>Average</td><td><img class="groupMoodIcon" src="images/'+theMoods[canvasPoints[canvasNumber].avgMood]+'_face.svg"/></td></tr></table>')
    } else {
        var arrayIndex = parseInt(updateNumber);

        logIt('arrayIndex=' + arrayIndex);
        logIt("me.updates[arrayIndex].status=" + me.updates[arrayIndex].status);

        var tempMoodNum = me.updates[arrayIndex].mood;

        var formalTime = convertDate(me.updates[arrayIndex].time);


        $('#mooderatorPopUpLabel').html("<span id='popUpTime'>"+formalTime+"</span><span id='labelRoundBox' style='background-color:" + colourArray[canvasPoints[canvasNumber].mood] + "'><img class='popUpMoodIcon' src='images/" + theMoods[canvasPoints[canvasNumber].mood] + "_face.svg'/>" + theMoods[canvasPoints[canvasNumber].mood] + "</span><span id='labelStatus'>" + unescape(me.updates[arrayIndex].status+'</span>'));

    }
	
	if (!mobileSize){
    	//code to position popup label on large screens
    	
    	$('#mooderatorPopUpLabel').css('height', 'auto');
		$('#mooderatorPopUpLabel').css('top', $('#mooderatorGraph').offset().top);   


        if (posX > $(window).width() / 2) {
            logIt('popUpLabel is in left half of window');

            

            $('#mooderatorPopUpLabel').css('text-align', 'right');
            $('#mooderatorPopUpLabel').css('margin-left', $('#mooderatorGraph').offset().left + posX - 30 - $('#mooderatorPopUpLabel').width() + 'px');
        } else {

            

            $('#mooderatorPopUpLabel').css('text-align', 'left');
            $('#mooderatorPopUpLabel').css('margin-left', $('#mooderatorGraph').offset().left + posX - 10 + 'px');

        }
	
	} else {
		//on smaller screens, label is static, underneath graph
		$('#mooderatorPopUpLabel').css('text-align', 'left');
		$('#mooderatorPopUpLabel').css('margin-left', '1em');
		$('#mooderatorPopUpLabel').css('display', 'block');
	}
	
	
    if (tempMoodNum > 3 && tempMoodNum < 6) {
        $('#labelRoundBox').css('color', '#000');
    }

    $('#mooderatorPopUpLabel').css('visibility', 'visible');
	
	highlightGraphPoint(canvasNumber, posX, posY);

}

function hideToolTip() {
    $('#mooderatorPopUpLabel').css('visibility', 'hidden');

	
}

function highlightGraphPoint(canvasNumber, posX, posY){
   	logIt('highlightGraphPoint running, canvasNumber='+canvasNumber+', dotRadius='+dotRadius);
    
	ctx.putImageData(savedGraph, 0, 0);
	
    
    var highlightRadius;
	var dotEnlargementRatio;
	if (!mobileSize){
		dotEnlargementRatio=4;
	}else {
		dotEnlargementRatio=8;
	}
	
	if (canvasPoints[canvasNumber].pointsInGroup){
		highlightRadius=dotRadius+((dotRadius/dotEnlargementRatio)*parseFloat(canvasPoints[canvasNumber].pointsInGroup));
	}
	else {
		highlightRadius=dotRadius;
	}
    
    
    ctx.fillStyle="rgba(255, 255, 255, 0)";
   	ctx.strokeStyle = "rgba(255, 255, 255, 1)";
	ctx.lineWidth = dotRadius*0.9;
	
	
	
	
    ctx.moveTo(posX, posY);
    
    drawSolidCircle(ctx, posX, posY, highlightRadius);
    
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

var timeSinceLocationQuery = 0;

//sets timer for async location check
function locationTimeoutCheck() {
        logIt('locationTimeoutCheck tick');
        timeSinceLocationQuery += 100;
        if (timeSinceLocationQuery > 10000) {
            stopLocationTimer();
            //manualLocate();

        } else {
            locationTimer = setTimeout("locationTimeoutCheck()", 100);
        }
    }
    //stops location timer set in locationTimeoutCheck()
function stopLocationTimer() {
    logIt('stopLocationTimer running');
    clearTimeout(locationTimer);
    timeSinceLocationQuery = 0;

}



//find the user's current location
function getLocation() {
    logIt('getLocation running');
    //$('#communication').append('<p>Attempting to retrieve your location, please wait...</p>');
    locationTimeoutCheck();
    if (Modernizr.geolocation) {
        // let's find out where you are!
        logIt('Modernizr.geolocation=true');
        gl = navigator.geolocation;




        gl.getCurrentPosition(
            recordPosition,
            function errorCallback(error) {
                //do error handling
                logIt('geolocation error! error=' + error);
                //manualLocate();
                stopLocationTimer();
            }, {
                maximumAge: Infinity,
                timeout: 6000
            }

        );



    } else {
        logIt("cant get geolocation");
        // no native geolocation support available :(
        // maybe try Gears or another third-party solution
        //manualLocate();
        stopLocationTimer();
    }


}


function manualLocate() {
    logIt("manualLocate running");
    //$('#manualLocation').html('<h1>Mood Update: Manual Location</h1><p>Your browser doesn\'t seem to be able to send your location automatically at this time. If you still want to submit your mood update to the MoodMap,  type your address below and click \'Find Me\'.</p><form name="addressForm"><input type="text" name="textfield2" id="address" value="Enter your address here."><br></form><a class="innerButton" href="javascript:findMe()">Find Me</a><br/><a class="innerButton" href="javascript:updateWithoutLocation()">Update Without Location</a><br/><a class="innerButton" href="javascript:cancelUpdateAtGeocode()">Cancel Mood Update</a><br/>');

    showDiv('manualLocation');

}

function findMe() {
    logIt("findMe running");



    var theAddress = $("#address").value;
    logIt('theAddress=' + theAddress);
    encodeAddress(theAddress);


}


function encodeAddress(address) {
    logIt('encodeAddress running');
    $('#communication').html('Attempting to get your location from your address, please wait...<br/>');
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {

            var myPosition = results[0].geometry.location;
            logIt("geocoding successful; lat=" + myPosition.lat() + ", lng=" + myPosition.lng());
            me.lat = myPosition.lat();
            me.lng = myPosition.lng();

            var addressLatLng = new google.maps.LatLng(me.lat, me.lng);
            logIt('calling getAddress from encodeAddress');
            getAddress(addressLatLng);

            stopLocationTimer();

        } else {
            logIt("Geocode was not successful for the following reason: " + status);


            stopLocationTimer();
        }
    });
}

function cancelUpdateAtGeocode() {
    $('#locationBox').css('display', 'none');

}

function updateWithoutLocation() {
    $('#changeLocationButton').css('display', 'none');


}

function recordPosition(position) {

    logIt("recordPosition running");
    me.lat = position.coords.latitude;
    me.lng = position.coords.longitude;
    var addressLatLng = new google.maps.LatLng(me.lat, me.lng);



    stopLocationTimer();
    logIt('calling getAddress from recordPosition');
    getAddress(addressLatLng);
}

function getAddress(latlng) {
    logIt('getAddress running; latlng=' + latlng);

    var returnedAddress = ' ';


    geocoder2 = new google.maps.Geocoder();

    if (latlng) {


        geocoder2.geocode({
            'latLng': latlng
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var statusAddition = '';
                if (results[0]) {
                    returnedAddress = results[2].formatted_address;

                    logIt('returnedAddress=' + returnedAddress);


                    statusAddition = 'in ' + returnedAddress + '?';
                } else {
                    logIt('reverse geocode: No results found');
                    statusAddition = '<span style="font-size:3em">?</span>';
                }


                //$('#statusLabel').append(statusAddition+'<br/>');
                $('#changeLocationButton').css('display', 'block');
            } else {
                logIt('Geocoder failed due to: ' + status);
            }
        });

    }


}

////////////////////////////////
//SOCIAL MEDIA COMMUNICATION
//////////////////////////////

function publishToSocial() {
    logIt("publishToSocial running");
    logIt("me.moodNum=" + me.moodNum);
    logIt("me.mood=" + me.mood);

    //var body = "is feeling "+me.mood.capitalize()+": "+me.status;

    /*var myAttachment = { 'name': 'name', 'href': ' <a href="https://www.moodoo.net" rel="nofollow">https://www.moodoo.net</a>', 'caption': 'Moodoo is a tool with which you can monitor your moods, share what you are feeling, get access to support in tough times and see mood patterns around the world.', 'description': body, 'media': [{ 'type': 'image', 'src': 'https://www.moodoo.net/images/'+me.mood+'.png', 'href': 'https://www.moodoo.net'}] }; */


    //var wallPost = {message : "is feeling "+me.mood.capitalize()+": "+me.status, picture: "https://www.moodoo.net/images/"+me.mood+".png"};



    /*FB.api('/me/feed', 'post', wallPost, function(response) {
		if (!response || response.error) {
		//alert('Error occured');
		} else {
		//alert('Post ID: ' + response);
		facebookPublishFinished=true;

		}
		});*/


    socialPublishFinished = true;

}



/////////////////////////
//GENERAL UTILITIES
/////////////////////////


//

function logIt(logString) {
    if (logsOn) {
        console.log(logString);
    }
}

//validate that a textfield is not empty and contains only numeric characters

function validateNumeric(passedVar) {
    var valid = true;
    var numericExpression = /^[0-9 +]+$/;

    if (passedVar) {
        if (!passedVar.match(numericExpression)) {

            valid = false;
        }
    } else {
        valid = false;
    }

    return valid;
}


//shows a div with fade & jump effect
function showDiv(divname) {
    if ($('#' + divname).data('hidden')) {
        $('#' + divname).data('hidden', false);
        logIt('showing div ' + divname);
        $('#' + divname).css('display', 'block');
        logIt('$(#' + divname + ').css("display")=' + $('#' + divname).css('display'));


        //$('#'+divname).css('position', 'relative');

        logIt('$(#' + divname + ').data("myHeight")=' + $('#' + divname).data('myHeight'));
        $('#' + divname).animate({

            height: $('#' + divname).data('myHeight')


        }, 500, function() {
            $('#' + divname).css('visibility', 'visible');

            if ($('#' + divname).css('height') == '0px') {
                $('#' + divname).css('height', 'auto');
            }
            $('#' + divname).animate({
                top: '0px',

                opacity: 1

            }, 500, function() {
                logIt('$(#' + divname + ').css("display")=' + $('#' + divname).css('display'));

            });
        });


    } //end if

}


var divToShow;
//hides a div with a fade & jump effect, shows another div if second parameter is passed
function hideDiv(divname, swapper) {
    if (swapper) {
        divToShow = swapper;

    } else {

        divToShow = null;
    }
    if ($('#' + divname).data('hidden') == false) {
        $('#' + divname).data('hidden', true);
        logIt('hiding div ' + divname + ', swapper=' + swapper);


        //store height to return to on reshow
        if ($('#' + divname).outerHeight() > 0) {
            $('#' + divname).data('myHeight', $('#' + divname).height());


        }

        logIt('$(#' + divname + ').data("myHeight")=' + $('#' + divname).data('myHeight'));

        //detach from the css flow
        //$('#'+divname).css('position', 'relative');
        //move up and fade out
        $('#' + divname).animate({
            top: '-150',
            opacity: 0

        }, 500, function() {
            //main animation finished
            logIt('hideDiv animation finished. swapper= ' + divToShow);


            $('#' + divname).css('visibility', 'hidden');
            //animate reduction in height for smooth transition for elements that are below hidden element
            $('#' + divname).animate({
                height: '0'

            }, 500, function() {
                //secondary animation finished.
                $('#' + divname).css('display', 'none');

                if (divToShow) {

                    showDiv(divToShow);
                }
            });

        });

    } //end if
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
    if (typeof stroke == "undefined") {
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

function drawSolidCircle(context, centreX, centreY, radius) {
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

//converts date to pretty format - full months, 12 hr time

function convertDate(dateString) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    logIt('dateString=' + dateString);
    dateArray = dateString.split(' ');
    newDateString = dateArray[0] + 'T' + dateArray[1];
    logIt('newDateString=' + newDateString);
    var originald = new Date(newDateString);
    var offset = originald.getTimezoneOffset() + 360;
    logIt('typeof offset=' + typeof offset);
    d = new Date(originald.getTime() - (offset * 60 * 1000));
    var year = d.getFullYear();
    var month = months[d.getMonth()];
    var date = d.getDate();
    var hours = d.getHours();
    var minutes = d.getMinutes();

    logIt('offset=' + offset + ', year=' + year + ', hours=' + hours);

    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    var finalTime = '';
    if (hours > 12) {

        hours = hours - 12;
        finalTime = hours + ':' + minutes + 'pm';
    } else {
        finalTime = hours + ':' + minutes + 'am';
    }

    return date + ' ' + month + ', ' + year + ' - ' + finalTime;
}


function findPos(obj) {
    var curleft = 0,
        curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return {
            x: curleft,
            y: curtop
        };
    }
    return undefined;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}







function logError(errorMessage, userID, otherInfo){
    
}