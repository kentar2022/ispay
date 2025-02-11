<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'kentar', 'password', 'moksha');

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$topicName = $_POST['topicName'];
$totalLessons = $_POST['totalLessons'];
$themeId = $_POST['themeId'];

$sql = "INSERT INTO topics (topic_name, total_lessons, theme_id) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param('sii', $topicName, $totalLessons, $themeId);

if ($stmt->execute()) {
    echo 'Success';
} else {
    http_response_code(500);
}

$stmt->close();
$conn->close();
?>
