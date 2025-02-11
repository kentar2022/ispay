<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');


$host = 'localhost';       
$user = 'kentar';           
$password = 'password';
$dbname = 'ispay'; 

$mysqli = new mysqli($host, $user, $password, $dbname);

if ($mysqli->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $mysqli->connect_error]));
}
?>