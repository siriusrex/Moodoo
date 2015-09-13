<?php


//Moodoo: Get user's mood data


header('Content-type: application/jsonrequest');


//get incoming data JSON string
$rawdata=file_get_contents('php://input');

$incoming=urldecode($rawdata);

//remove padding 
$incoming=preg_replace('/.+?({.+}).+/','$1',$incoming); 

$incoming=utf8_encode($incoming);

$incoming=str_replace(":", ": ", $incoming);
$incoming=str_replace(",", ", ", $incoming);
$incoming=str_replace("JSONRequest=", "", $incoming);

$jsonarray=json_decode($incoming, "TRUE");


$dbusername = "moodooDB";
$dbpassword = "emotion2010";
$dbhostname = "207.7.92.13";	
$dbh = mysql_connect($dbhostname, $dbusername, $dbpassword) or die("Unable to connect to MySQL");





if ($jsonarray){
	$getMyDataQuery="SELECT * FROM `moodoo1`.`updates` WHERE `userID` LIKE '".$jsonarray['userID']."' ORDER BY `time` ASC";
	
	$getMyDataResult=mysql_query($getMyDataQuery);
	
		
	
};




$response=array();

$response['query']=$getMyDataQuery;
$response['success']=true;

$j=0;
$totalRows=mysql_num_rows($getMyDataResult);
while($row=mysql_fetch_assoc($getMyDataResult)){
	
	
	$response['updates'][$j]['mood']=$row['mood'];
	$response['updates'][$j]['lat']=$row['lat'];
	$response['updates'][$j]['lng']=$row['lng'];
	$response['updates'][$j]['time']=$row['time'];
	$response['updates'][$j]['seconds']=strtotime($row['time']);
	$response['updates'][$j]['status']=$row['status'];
	$response['updates'][$j]['code']=$row['code'];
	

	$j++;
}

if ($totalRows>0){
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

$print=json_encode($response);

echo $print;


?>