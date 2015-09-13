<?php

//Moodoo:Social sign-on test  This script creates a new user in the database, with their ID from their chosen ID provider (facebook, twitter, google, etc), their name and email address.

//echo 'running';
/*

require 'key.php';

//tells browser to read the output as json, not html
header('Content-type: text/html');

$response=array();
$response['log']='';	



function checkVar($var){
	$ok=true;
	
	if ($var=='null'){
		$ok=false;
	}
	
	if ($var==null){
		$ok=false;
	}
	
	if ($var==''){
		$ok=false;
	}
	
	if ($var==' '){
		$ok=false;
	}

	return $ok;

}




function checkUser() {
	
	global $dbh;
	global $response;
	
	$response['log'].='checkUser running |';
	//echo $response['log'];

	
	//$getID=filter_input(INPUT_POST, 'userID', FILTER_SANITIZE_STRING);
	if (checkVar($_GET['userID'])){
		$getID=$_GET['userID'];
	
	}
	else {
		$getID=false;
	}
	
	
	if (checkVar($_GET['socialID'])){
		$socialID=$_GET['socialID'];
	
	}
	else {
		$socialID=false;
	}
	
	$response['log'].='$getID='.$getID.', $socialID='.$socialID.'|';


	
	$response['success']='init success value, not overwritten';
	//$response['query']='no query set';
	
	
	//database details
 
	$dbusername = "moodooDB2";
	$dbpassword = "emotion2010";//emotion2010
	$dbhostname = "207.7.92.13";	
	
	//connect to database
	$dbh = mysql_connect($dbhostname, $dbusername, $dbpassword);
	
	
	
	if (!$dbh) {
		$response['success']='ERROR: could not connect to mySQL';
		generateOutput();
	}

	else {
		//CHECK USER - what data do we have? Can we find them on the database or create a new user?
		$response['log'].='checking user|';
		//first check: is there a POST id?
		
		
		if ($getID){
			$response['log'].='got getID|';
		
			//query database for user data based on POST id	
			
			
		
			getUser($getID, null);		
		
		}
		
		elseif ($socialID) {
		
			//no POST id sent - try to load user data based on socialID
			
			$response['log'].='no POST id, checking user via socialID|';
		
			getUser(null, $socialID);
			
			
		
		}
		else {
			$response['success']='Error: no userID or socialID sent! Is this a returning user or someone who needs a new account?? I cant tell.';

		}
	}
	
	
	//echo $response['log'];

	//echo $response['success'];

}



function getUser($getID, $socialID){
	
	global $response; 
	global $moodooKey;
	
	$response['log'].='getUser running|';

	
	//construct query to send to database
	$userQuery="SELECT ID,  CONVERT(AES_DECRYPT(socialID, SHA1('".$moodooKey."')) USING UTF8) AS socialID, CONVERT(AES_DECRYPT(firstName, SHA1('".$moodooKey."')) USING UTF8) AS firstName, CONVERT(AES_DECRYPT(lastName, SHA1('".$moodooKey."')) USING UTF8) AS lastName, CONVERT(AES_DECRYPT(email, SHA1('".$moodooKey."')) USING UTF8) AS email, publishSocial, publishToMoodoo, publishToMap, allowLocation, reminder FROM `moodoo2`.`users`";
	
	
	
	//append type of ID to use as index
		
	if ($getID){
		$userQuery.=" WHERE ID='".$getID."'";
		
		executeQuery($userQuery);
	}
	elseif ($socialID) {
		$userQuery.=" WHERE AES_DECRYPT(socialID, SHA1('".$moodooKey."'))='".$socialID."'";
		
		executeQuery($userQuery);
	}

	else {
		
	
		 $response['success']='Error: no userID or socialID sent! Is this a returning user or someone who needs a new account?? I cant tell.';
		$response['log'].='Error: no userID or socialID sent! Is this a returning user or someone who needs a new account?? I cant tell.';
		generateOutput();

	}	
	
	
	
	
}


function executeQuery($userQuery){
	global $response;
	//$response['log'].='$userQuery='.$userQuery.'|';
	
		
	$userResult=mysql_query($userQuery);
	
	
	//if mySQL returns a valid user, populate response array with those values. $userResult will be false if query was invalid.
	if ($userResult) {
		$response['log'].='got user result from database, checking for multiple matches. no of matches='.mysql_num_rows($userResult).'|';

		
		//check if there are multiple matches for the getID or socialID
		if (mysql_num_rows($userResult) > 1) {
			$response['log'].='multiple matches in database for this ID|';
			$response['success']='aborted due to multiple user matches|';
			generateOutput();
		}
		
		elseif (mysql_num_rows($userResult) == 0) {
			$response['log'].='no matches in database for this ID, creating new user|';
			
			createUser();
		
		}
		
		else {
			$response['log'].='only 1 match, trying to pass data to response array|';


			
			//pass query results to response array to be sent back via JSON
			
			while ($row=mysql_fetch_array($userResult)){
					
					$response['userID']=$row['ID'];
					$response['socialID']=$row['socialID'];
					$response['firstName']=$row['firstName'];
					$response['lastName']=$row['lastName'];
					$response['email']=$row['email'];
					$response['publishSocial']=$row['publishSocial'];
					$response['publishToMoodoo']=$row['publishToMoodoo'];
					$response['allowLocation']=$row['allowLocation'];
					$response['reminder']=$row['reminder'];
			}
		
			
			
			//$response['query']=$userQuery;
			$response['success']=$userResult;
			
			$response['newUser']=false;
			
			
			getUserData($response['userID']);
			//generateOutput();
		
		}
		
	}
	
	else {
		$response['log'].='could not find user in moodoo database |';

		//if $userResult draws a blank, create new user
		createUser();
	
	}

}

function createUser() {	
		global $response;
		global $moodooKey;
		global $dbh;
		
		$response['log'].='createUser running|';
		
		$response['newUser']=true;
		
		//query database to create new user
		$createUserQuery="INSERT INTO `moodoo2`.`users` (`ID`, `socialID`, `firstName`, `lastName`, `email`,`publishSocial`, `publishToMoodoo`, `publishToMap`) VALUES (NULL, AES_ENCRYPT('".$_POST['socialID']."', SHA1('".$moodooKey."')), AES_ENCRYPT('".$_POST['firstName']."', SHA1('".$moodooKey."')), AES_ENCRYPT('".$_POST['lastName']."', SHA1('".$moodooKey."')), AES_ENCRYPT('".$_POST['email']."', SHA1('".$moodooKey."')), 0, 0, 0)";
		
		$createUserResult=mysql_query($createUserQuery);
		//generateOutput();
		
		
		$response['log'].='checking createUser query result|';
		
		if ($createUserResult){
			//get moodooDB id from user that was just created
			$response['log'].='created user successfully, retrieving new ID |';
		
			$newuserID=(mysql_insert_id($dbh));
			
			
			
			$response['newuserID']=$newuserID;
			
			//add results of queries to reponse variable
			
			//$response['createQuery']=$createUserQuery;
			
			$response['newUser']=true;
			
			
			
			getUser($newuserID, null);
			
			
			
			
			

			
			
		}
		
		else {
			
			$response['log'].='create user query threw an error. |';
			$response['error'].='error at create user query execution!';
			generateOutput();
		}
		
		

}


function getUserData($userID) {
	global $response;
	global $moodooKey;
	
	$response['log'].='getUserData running |';
	
	
	
	
	$moodDataQuery="SELECT ID,  CONVERT(AES_DECRYPT(socialID, SHA1('".$moodooKey."')) USING UTF8) AS socialID, CONVERT(AES_DECRYPT(mood, SHA1('".$moodooKey."')) USING UTF8) AS mood, CONVERT(AES_DECRYPT(lat, SHA1('".$moodooKey."')) USING UTF8) AS lat, CONVERT(AES_DECRYPT(lng, SHA1('".$moodooKey."')) USING UTF8) AS lng, time, CONVERT(AES_DECRYPT(status, SHA1('".$moodooKey."')) USING UTF8) AS status, code FROM `moodoo2`.`updates` WHERE userID='".$userID."' ORDER BY time ASC";
		
		
	
	
	
	//$response['log'].="moodDataQuery= ".$moodDataQuery.' |';
	
	$moodDataResult=mysql_query($moodDataQuery);
	
	if ($moodDataResult){
	
		$noOfUpdates=mysql_num_rows($moodDataResult);
		$response['log'].='moodDataQuery executed, no of mood updates='.$noOfUpdates.' |';
		
		if ($noOfUpdates>0){
			$response['log'].='got more than one mood update, adding values to response |';
			
			//////////CODE ADDED FROM ORIGINAL MOODOO SCRIPT
			
			$j=0;
			
			while($row=mysql_fetch_assoc($moodDataResult)){
				
				$response['updates'][$j]['updateID']=$row['ID'];
				$response['updates'][$j]['mood']=$row['mood'];
				$response['updates'][$j]['lat']=$row['lat'];
				$response['updates'][$j]['lng']=$row['lng'];
				$response['updates'][$j]['time']=$row['time'];
				$response['updates'][$j]['seconds']=strtotime($row['time']);
				$response['updates'][$j]['status']=$row['status'];
				$response['updates'][$j]['code']=$row['code'];
				
			
				$j++;
			}
			
			if ($noOfUpdates>0){
				$latestUpdateTime=$response['updates'][$totalRows-1]['time'];
			}
			else {
				$latestUpdateTime=null;
			}
			
			
			$monthstring='month';
			$weekstring='week';
			$daystring='day';
			$hourstring='hour';
			$minutestring='minute';
			
			if ($latestUpdateTime!=null){
				$difference = time() - strtotime($latestUpdateTime); //difference in seconds between the last update and now
				
			
				
				$months = floor($difference / 2592000); // approx 1814400 seconds in an average 30 day month
				$weeks = floor(($difference % 2592000) / 604800); //get remainder after finding months, divide those seconds by no of seconds in a week (604800)
				$days= floor((($difference % 2592000) % 604800) / 86400); //etc
				
				$hours= floor(((($difference % 2592000) % 604800) % 86400) / 3600); //etc
				
				
				$minutes=floor((((($difference % 2592000) % 604800) % 86400) % 3600) / 60); // etc
				
				
				
				
				
				
				
				if ($months>1){
					$monthstring.='s';
				}
				if ($weeks>1){
					$weekstring.='s';
				}
				
				if ($days>1){
					
					$daystring.='s';
				}
				
				if ($hours>1){
					$hourstring.='s';
				
				}
				
				if ($minutes>1){
					$minutestring.='s';
				}
				
			
				
				if ($months>0){
					$timeSinceLastUpdate.=$months.' '.$monthstring.', ';
				}
				
				if ($weeks>0){
					$timeSinceLastUpdate.=$weeks.' '.$weekstring.', ';
				}
				
				
				if ($days>0){
					$timeSinceLastUpdate.=$days.' '.$daystring.', ';
				}
				
				
				if ($hours>0){
					$timeSinceLastUpdate.=$hours.' '.$hourstring.' and ';
				}
				if ($minutes>0){
					$timeSinceLastUpdate.=$minutes.' '.$minutestring;
				}
				
				if ($difference<60){
					if ($difference==1){
						$timeSinceLastUpdate='1 second';
					}
					else {
						$timeSinceLastUpdate=$difference.' seconds';
					}
				}
				
				if ($months>6){
					$timeSinceLastUpdate='more than six months';
			
				}
				
				
			}
			else {
				$timeSinceLastUpdate=null;
			
			}
			
			$response['timeSinceLastUpdate']=$timeSinceLastUpdate;
			
			$response['secondsSinceLastUpdate']=$difference;
			
			
			
			//////////END ORIGINAL CODE
			
			
				
		}
		
		generateOutput();
		
	} 
	else {
		$response['log'].='get mood data query threw an error. |';
		$response['error'].='error at mood data query execution!';
		generateOutput();

		
	}
	
	
}
	
function generateOutput() {	 
	global $response;
	//generate json formatted response for client-side javascript use
	$response['log'].='encoding json|';
	
	$print=json_encode($response);
	
	echo $print;

}


checkUser();

?>*/