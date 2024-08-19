<?php
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit();
}

$user_id = $_SESSION['user_id'];

$mysqli = new mysqli("localhost", "kentar", "password", "ispay");

if ($mysqli->connect_error) {
    die("Ошибка подключения: " . $mysqli->connect_error);
}

$sql = "SELECT u.id, u.nickname FROM friends f INNER JOIN users u ON f.friend_id = u.id WHERE f.user_id = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$friends = [];
while ($row = $result->fetch_assoc()) {
    $friends[] = $row;
}

echo json_encode($friends);

$stmt->close();
$mysqli->close();
?>
