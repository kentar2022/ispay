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

// Проверяем, существует ли пользователь с таким ID
$sql = "SELECT id FROM users WHERE id = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("i", $friend_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Пользователь с таким ID не найден']);
    $stmt->close();
    $mysqli->close();
    exit();
}

$stmt->close();

// Проверяем, не является ли этот пользователь уже другом
$sql = "SELECT * FROM friends WHERE user_id = ? AND friend_id = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("ii", $user_id, $friend_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Этот пользователь уже в вашем списке друзей']);
    $stmt->close();
    $mysqli->close();
    exit();
}

$stmt->close();

// Добавляем друга в список
$sql = "INSERT INTO friends (user_id, friend_id) VALUES (?, ?)";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("ii", $user_id, $friend_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Друг успешно добавлен']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при добавлении друга']);
}

$stmt->close();
$mysqli->close();
?>
