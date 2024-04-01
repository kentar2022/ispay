<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$servername = "localhost";
$username = "kentar"; 
$password = "password"; 
$dbname = "chechen";

$conn = new mysqli($servername, $username, $password, $dbname);


if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


$sql = "SELECT fl.*, rw.word_russian FROM first_lesson fl INNER JOIN russian_words rw ON fl.id = rw.id";
$result = $conn->query($sql);


$data = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        
        $data[] = $row;
    }
}
echo json_encode($data);


$conn->close();
?>