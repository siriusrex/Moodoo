var gl;

var geocoder; 
var geocoder2;

function recordPosition(position) {
  //map.setCenter(new GLatLng(position.coords.latitude, position.coords.longitude), 14);
  //trace("recordPosition running");
  //trace("position.coords.latitude="+position.coords.latitude);
  //trace("position.coords.longitude="+position.coords.longitude);
  me.lat=position.coords.latitude;
  me.lng=position.coords.longitude;
  var addressLatLng=new google.maps.LatLng(me.lat, me.lng);
        
  
  
  document.getElementById('status').value='';
 stopLocationTimer();
  unHighlightDiv('wait');
  hidediv('wait');
  stopAnimatingLogo();
  
	
	
  highlightDiv('statusBox');
  //trace('calling getAddress from recordPosition');
  getAddress(addressLatLng);
}
 
function displayError(positionError) {
  manualLocate();
  stopLocationTimer();
  //alert("error")
}

function getLocation(){
	//trace('getLocation running');
	document.getElementById('waitMessage').innerHTML='Attempting to retrieve your location, please wait...';
	locationTimeoutCheck();
	if (Modernizr.geolocation) {
	  // let's find out where you are!
	 	//trace('Modernizr.geolocation=true');
	    gl = navigator.geolocation;
		
	
	  	
	  	
	  	gl.getCurrentPosition(
        recordPosition,
        function errorCallback(error) {
            //do error handling
            //trace('geolocation error! error='+error);
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

function getAddress(latlng) {
	//trace('getAddress running; latlng='+latlng);
    
    var returnedAddress=' ';
   	
    
	geocoder2= new google.maps.Geocoder();
	   
 	if (latlng) {
        
        
       geocoder2.geocode({'latLng': latlng}, function(results, status)
	    {
	        if (status == google.maps.GeocoderStatus.OK)
	        {
	        	 var statusAddition='';
	            if (results[0])
	            {
	                
	                returnedAddress=results[2].formatted_address;
	                
	                //trace('returnedAddress='+returnedAddress);
	                
				   	
				   statusAddition='in '+returnedAddress+'?';
				   	
				   
				   	
	            }
	            else
	            {
	                //trace('reverse geocode: No results found');
	                statusAddition='<span style="font-size:3em">?</span>';
	            }
	            
	            document.getElementById('statusBox').style.height='auto';
	            document.getElementById('locationDisplay').innerHTML=statusAddition;
	            document.getElementById('changeLocationButton').style.display='block';
	        }
	        else
	        {
	             //trace('Geocoder failed due to: '+ status);
	        }
	    });
         
     }
     
    
    
   
   	
   	
	
  	
}


function manualLocate(){
	//trace("manualLocate running");
	document.getElementById('locationBox').innerHTML='<h1>Mood Update: Location error</h1><p>'+me.firstName+',  your browser doesn\'t seem to be able to send your location automatically at this time. If you still want to submit your mood update to the MoodMap,  type your address below and click \'Find Me\'.</p><form name="addressForm"> <input style="width:140px; margin-bottom:20px" type="text" name="textfield2" onfocus="javascript:focusTextField(this)" id="address" value="Enter your address here." size="30"><br></form><a class="innerButton" href="javascript:findMe()">Find Me</a><br/><a class="innerButton" href="javascript:updateWithoutLocation()">Update Without Location</a><br/><a class="innerButton" href="javascript:cancelUpdateAtGeocode()">Cancel</a><br/>';
	unHighlightDiv('wait');
	hidediv('wait');
	stopAnimatingLogo();
	highlightDiv('locationBox');
	 
}


function findMe(){
	//trace("findMe running");
	 
	
	
	var theAddress=document.getElementById("address").value;
	//trace('theAddress='+theAddress);
	encodeAddress(theAddress);
	unHighlightDiv('locationBox');
	hidediv('locationBox');
    highlightDiv('wait');
    animateWaitLogo();
	
}



function encodeAddress(address) {
	document.getElementById('waitMessage').innerHTML='Attempting to get your location from your address, please wait...';
	 geocoder= new google.maps.Geocoder();
	 geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
       
        var myPosition=results[0].geometry.location;
        //trace("geocoding successful; lat="+myPosition.lat()+", lng="+myPosition.lng());
        me.lat=myPosition.lat();
        me.lng=myPosition.lng();
        
        var addressLatLng=new google.maps.LatLng(me.lat, me.lng);
        //trace('calling getAddress from encodeAddress');
        getAddress(addressLatLng);
      	unHighlightDiv('wait');
		hidediv('wait');
		stopAnimatingLogo();
        highlightDiv('statusBox');
       	stopLocationTimer();
        
      } else {
        //trace("Geocode was not successful for the following reason: " + status);
        document.getElementById('statusTitle').innerHTML+='<span style="font-size:12px">?</span>';
        document.getElementById('locationBox').innerHTML='<h1>Mood Update: Location error</h1><p>'+me.firstName+', there was an error translating your address into a location. You won\'t be able to record location info for this mood update.</p><a class="innerButton" href="javascript:cancelUpdateAtGeocode()">Cancel</a><br/><a class="innerButton" href="javascript:updateWithoutLocation()">Update Anyway</a>';
       	unHighlightDiv('wait');
		hidediv('wait');
		stopAnimatingLogo();
        highlightDiv('locationBox');
        stopLocationTimer();
      }
    });
}




function cancelUpdateAtGeocode(){
	unHighlightDiv('locationBox');
	hidediv('locationBox');
   	showdiv('updateMoodButton');
}

function updateWithoutLocation(){
	unHighlightDiv('locationBox');
	document.getElementById('locationDisplay').innerHTML='';
	document.getElementById('changeLocationButton').style.display='none';
	hidediv('locationBox');
    highlightDiv('statusBox');
   
}

var locationTimer;

var timeSinceLocationQuery=0;

function locationTimeoutCheck(){
	trace('locationTimeoutCheck tick<br/>');
	timeSinceLocationQuery+=100;
	if (timeSinceLocationQuery>10000){
		stopLocationTimer();
		manualLocate();
		
	}	else {
		locationTimer=setTimeout("locationTimeoutCheck()", 100);
	}
}

function stopLocationTimer(){
	trace('stopLocationTimer running<br/>');
	clearTimeout(locationTimer);
	timeSinceLocationQuery=0;
	

	
}

function changeLocation(){
	trace('changeLocation running');
	
	unHighlightDiv('statusBox');
	manualLocate();
}