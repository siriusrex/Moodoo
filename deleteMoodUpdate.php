<?php
error_reporting(E_ERROR);

//Moodoo: Delete Mood Update. Deletes entry from the 'updates' table.
require 'key.php';

header('Content-type: text/json');


header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");


$success=false;


$dbusername = "moodooDB2";
$dbpassword = "emotion2010";
$dbhostname = "207.7.92.13";	
$dbh = mysql_connect($dbhostname, $dbusername, $dbpassword) or die("Unable to connect to MySQL");


$currentdate=getdate();

//echo 'currentdate='.$currentdate[0].'<br/>';
$mysqldate=date('Y-m-d H:i:s', $currentdate[0]);



	
	
	
	
	$deleteMoodUpdateQuery="DELETE FROM `moodoo2`.`updates` WHERE `ID`='".$_POST['updateID']."'";

	
	
	
	//echo '$doUpdateQuery='.$doUpdateQuery.'<br/>';
	
	$deleteMoodUpdateResult=mysql_query($deleteMoodUpdateQuery);
	
	
	$response=array();
	if (mysql_affected_rows()==0){
		
		$response["moodUpdateDeleted"]=false;
		$response["error"]="No affected rows - couldnt find ID in database";
	}
	else {
		
		
		$response["moodUpdateDeleted"]=true;
		$response["affectedRows"]=mysql_affected_rows();
		
		
};


$print=json_encode($response);

echo $print;

?>