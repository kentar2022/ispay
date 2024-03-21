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

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Select data from the first_lesson table
$sql = "SELECT fl.* FROM first_lesson fl INNER JOIN russian_words rw ON fl.id = rw.id";
$result = $conn->query($sql);

// Fetch data and return as JSON
$data = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Добавляем данные в массив только если id из обеих таблиц совпадает
        $data[] = $row;
    }
}
echo json_encode($data);

// Close connection
$conn->close();
?>
