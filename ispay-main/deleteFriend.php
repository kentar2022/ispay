<?php
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit();
}

$user_id = $_SESSION['user_id'];
$friend_id = $_POST['friend_id'];

$mysqli = new mysqli("localhost", "kentar", "password", "ispay");

if ($mysqli->connect_error) {
    die("Ошибка подключения: " . $mysqli->connect_error);
}

// Удаляем друга
$sql = "DELETE FROM friends WHERE user_id = ? AND friend_id = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("ii", $user_id, $friend_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Друг удалён']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при удалении друга']);
}

$stmt->close();
$mysqli->close();
?>
