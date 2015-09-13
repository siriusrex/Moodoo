<?php

error_reporting(E_ERROR);

//SENDS MAIL TO MOODOO SUPPORT FROM PRIMARY CONTACT FORM
//REQUIRES MAILGUN ACCOUNT & MAILGUN PHP LIBRARY
//INPUT DATA SENT VIA XMLHTTPREQUEST AS JSON
//RETURNS JSON STRING
//Last edited 2015-08-08

//incoming field names: returnEmail, contactFirstName, subject, message

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");



//echo 'Moodoo Mailer Running - v0.1<br/>';
//echo 'POST vars:'.$_POST['returnEmail'].', '.$_POST['contactFirstName'].', '.$_POST['subject'].', '.$_POST['contactMessage'];


# Include the Autoloader (see "Libraries" for install instructions)
require 'mailgun-php/vendor/autoload.php';
use Mailgun\Mailgun;


$response=array();
$response['log']='';	



# Instantiate the client.
$mgClient = new Mailgun('key-851dde721772fe86ec36d307cebcc91a');
$domain = "mg.moodoo.net";


//Check incoming vars
$sanitizedEmailString=filter_var($_POST['returnEmail'], FILTER_SANITIZE_EMAIL);

//echo '$sanitizedEmailString='.$sanitizedEmailString;

if (!filter_var($sanitizedEmailString, FILTER_VALIDATE_EMAIL) === false) {
  $response['log'].="|".$sanitizedEmailString." is a valid email address|";
  $returnEmail=$sanitiedEmailString;
} else {
  $response['log'].="|Oops! ".$sanitizedEmailString." is not a valid email address|";
  $response['log'].='|error: invalid email address: '.$sanitiedEmailString.'|';
}

$returnEmail=$_POST['returnEmail'];

$contactFirstName=filter_var($_POST['contactFirstName'], FILTER_SANITIZE_STRING);
echo '$contactFirstName='.$contactFirstName;


//echo '$contactFirstName:'.$contactFirstName;
$from=$contactFirstName.' via Moodoo Contact Form <'.$returnEmail.'>';

$to='Moodoo Contact Officer <admin@moodoo.net>';

$formSubject=filter_var($_POST['subject'], FILTER_SANITIZE_STRING);
//$formSubject='Test subject from script';

$subject='New contact form message from moodoo.net: "'.$formSubject.'"';

$message=$_POST['contactMessage'];//filter_var($_POST['contactMessage'], FILTER_SANITIZE_STRING);

$html='<html><head/><body><p>Hello Contact Officer! '.$contactFirstName.' has sent the following message via the Moodoo contact form: </p><p>'.$message.'</p></body></html>';  

//$text='Test text from script';            

# Make the call to the client.
$result = $mgClient->sendMessage("$domain",
                  array('from'    => $from,
                        'to'      => $to,
                        'subject' => $subject,
                        'html'    => $html));
 
 
//$result = $mgClient->get("$domain/log", array('limit' => 25, 
                                       // 'skip'  => 0));

$httpResponseCode = $result->http_response_code;
$httpResponseBody = $result->http_response_body;

# Iterate through the results and echo the message IDs.
$logItems = $result->http_response_body->items;

foreach($logItems as $logItem){
  $response['log'].= "|".$logItem->message_id . "|";
}

function generateOutput() {	 
	global $response;
	//generate json formatted response for client-side javascript use
	$response['log'].='encoding json|';
	
	$print=json_encode($response);
	
	echo $print;

}



generateOutput();                      
?>
    