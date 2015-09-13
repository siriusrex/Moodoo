<?php


header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

ini_set('display_startup_errors',1);
ini_set('display_errors',1);
error_reporting(-1);

echo 'Moodoo Mailer Running - v2<br/>';

//phpinfo();

 echo 'Moodoo Mailer check 1<br/>';
# Include the Autoloader (see "Libraries" for install instructions)
require 'autoload.php';
use Mailgun\Mailgun;


 echo 'Moodoo Mailer check 2<br/>';
# Instantiate the client.
$mgClient = new Mailgun('key-851dde721772fe86ec36d307cebcc91a');
$domain = "mg.moodoo.net";

 echo 'Moodoo Mailer check 3<br/>';

                     

# Make the call to the client.
$result = $mgClient->sendMessage("$domain",
                  array('from'    => 'Mailgun Sandbox <postmaster@sandbox93379d92d7854391b2d102547de0af25.mailgun.org>',
                        'to'      => 'John <john@johngalea.net>',
                        'subject' => 'Hello John',
                        'text'    => 'Congratulations John, you just sent an email with Mailgun!  You are truly awesome!  You can see a record of this email in your logs: https://mailgun.com/cp/log .  You can send up to 300 emails/day from this sandbox server.  Next, you should add your own domain so you can send 10,000 emails/month for free.'));
 
 
$result = $mg->get("$domain/log", array('limit' => 25, 
                                        'skip'  => 0));

$httpResponseCode = $result->http_response_code;
$httpResponseBody = $result->http_response_body;

# Iterate through the results and echo the message IDs.
$logItems = $result->http_response_body->items;
foreach($logItems as $logItem){
    echo $logItem->message_id . "\n";
}

echo 'Moodoo Mailer Finished';                      
?>
    