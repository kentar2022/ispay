<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'kentar', 'password', 'moksha');

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$sql = "SELECT id, themes_name FROM themes";
$result = $conn->query($sql);

$themes = [];
while ($row = $result->fetch_assoc()) {
    $themes[] = $row;
}

echo json_encode($themes);

$conn->close();
?>
