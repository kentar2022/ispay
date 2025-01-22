<?php


$host = 'localhost';       
$user = 'kentar';           
$password = 'password';            
$dbname = 'chechen';         


$mysqli = new mysqli($host, $user, $password, $dbname);


if ($mysqli->connect_error) {
    echo json_encode(['error' => 'Database connection error']);
    exit;
}
?>
