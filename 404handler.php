<?php
//Mooodoo 404 error handler - sends an email to support
		$name='';
		$email='';
		$info='';
		
    if (isset($_POST['email'])) {
        $email= filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
        echo "<br/><br/>";
    }
 
    if (isset($_POST['info'])) {
        $info= filter_var($_POST['info'], FILTER_SANITIZE_STRING);
        echo "<br/><br/>";
    }
	
	if (isset($_POST['name'])) {
        $info= filter_var($_POST['name'], FILTER_SANITIZE_STRING);
        echo "<br/><br/>";
    }


	echo '404 page handler: User\'s name is: '.$name.', user\'s email is: '.$email.', user\'s message is: '.$message;

?>