<?php
error_reporting(E_ERROR);

//Moodoo: Update mood. Creates new entry in the 'updates' table, with information about mood, location and time.
require 'key.php';

header('Content-type: text/json');


header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");


$success=false;
//get incoming data JSON string
//$rawdata=file_get_contents('php://input');

//$incoming=urldecode($rawdata);

//remove padding 
//$incoming=preg_replace('/.+?({.+}).+/','$1',$incoming); 

//$incoming=utf8_encode($incoming);

//$incoming=str_replace(":", ": ", $incoming);
//$incoming=str_replace(",", ", ", $incoming);
//$incoming=str_replace("JSONRequest=", "", $incoming);

//$jsonarray=json_decode($incoming, "TRUE");

//echo "jsonarray['facebookID']=".$jsonarray['facebookID'].'<br/>';

$dbusername = "moodooDB2";
$dbpassword = "emotion2010";
$dbhostname = "207.7.92.13";	
$dbh = mysql_connect($dbhostname, $dbusername, $dbpassword) or die("Unable to connect to MySQL");


$currentdate=getdate();

//echo 'currentdate='.$currentdate[0].'<br/>';
$mysqldate=date('Y-m-d H:i:s', $currentdate[0]);



	
	
	
	
	$doUpdateQuery="INSERT INTO `moodoo2`.`updates` (`ID`, `userID`, `socialID`, `mood`, `lat`, `lng`,`time`, `status`, `code`) VALUES (NULL, '".$_POST['userID']."', AES_ENCRYPT('".$_POST['socialID']."', SHA1('".$moodooKey."')), AES_ENCRYPT('".$_POST['mood']."', SHA1('".$moodooKey."')), AES_ENCRYPT('".$_POST['lat']."', SHA1('".$moodooKey."')), AES_ENCRYPT('".$_POST['lng']."', SHA1('".$moodooKey."')), '".$mysqldate."', AES_ENCRYPT('".$_POST['status']."', SHA1('".$moodooKey."')), '".$_POST['code']."')";
	
	
	
	//echo '$doUpdateQuery='.$doUpdateQuery.'<br/>';
	
	$checkUserResult=mysql_query($doUpdateQuery);
	
	//echo $checkUserResult.'<br/>';
	$response=array();
	if (!$checkUserResult){
		$response["moodUpdated"]=false;
		//$response["statusSentToPHP"]=$_POST['status'];
		//$response["doUpdateQuery"]=$doUpdateQuery;
	}
	else {
		$response["moodUpdated"]=true;
		

		//$response["doUpdateQuery"]=$doUpdateQuery;
	};


$print=json_encode($response);

echo $print;

?>