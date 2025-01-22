<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'kentar', 'password', 'moksha');

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$themeName = $_POST['themeName'];
$totalTopics = $_POST['totalTopics'];

$sql = "INSERT INTO themes (themes_name, total_topics) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param('si', $themeName, $totalTopics);

if ($stmt->execute()) {
    echo 'Success';
} else {
    http_response_code(500);
}

$stmt->close();
$conn->close();
?>
