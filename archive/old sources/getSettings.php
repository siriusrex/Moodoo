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
	$getMySettingsQuery="SELECT * FROM `moodoo1`.`users` WHERE `ID` = '".$jsonarray['userID']."'";
	
	$getMySettingsResult=mysql_query($getMySettingsQuery);	
};




$response=array();

$response['query']=$getMySettingsQuery;
$response['success']=true;
$response['test']='blah';


while($row=mysql_fetch_array($getMySettingsResult)){
	
	
	$response['publishToFacebook']=$row['publishToFacebook'];
	$response['publishToMoodoo']=$row['publishToMoodoo'];
	$response['publishToMap']=$row['publishToMap'];
	$response['reminder']=$row['reminder'];
	$response['firstName']=$row['firstName'];
	$response['lastName']=$row['lastName'];
	$response['facebookID']=$row['facebookID'];


	
}







$print=json_encode($response);

echo $print;


?>