<?php
    header('Content-type: text/json');
 	error_reporting(E_ERROR);

    require 'key.php';
 	$token=$_POST['token'];
    if ($curl = curl_init()) {
    curl_setopt($curl, CURLOPT_URL, 'https://rpxnow.com/api/v2/auth_info');
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS,
        array('token' =>  $token,
              'apiKey' => $apiKey));
    curl_setopt($curl, CURLOPT_FAILONERROR, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($curl);
    if (!$response){
        echo '{"Curl error": "' . curl_error($curl). '",';
        echo '"passed token": "'.$token.'",';
        echo '"HTTP code": "' . curl_errno($curl) . '"}';
    } else {
        echo $response;
    }
    curl_close($curl);
    }
    else {
     	echo 'curl did not initialize';
    }
?>