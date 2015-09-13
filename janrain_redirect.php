<?php
   error_reporting(E_ERROR);

   $token=$_POST['token'];
   header( 'Location: https://www.moodoo.net/dev/test/?token='.$token ) ; 
    
 	

 	

?>