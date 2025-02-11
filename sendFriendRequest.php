<?php
// sendFriendRequest.php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$sender_id = $_SESSION['user_id'];
$receiver_id = $_POST['friend_id'];

$mysqli = new mysqli("localhost", "kentar", "password", "ispay");

// Проверяем существование пользователя
$stmt = $mysqli->prepare("SELECT user_id FROM users WHERE user_id = ?");
$stmt->bind_param("i", $receiver_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
    exit();
}

// Проверяем, нет ли уже активной заявки
$stmt = $mysqli->prepare("
    SELECT status 
    FROM friend_requests 
    WHERE (sender_id = ? AND receiver_id = ?) 
    OR (sender_id = ? AND receiver_id = ?)
");
$stmt->bind_param("iiii", $sender_id, $receiver_id, $receiver_id, $sender_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $request = $result->fetch_assoc();
    if ($request['status'] === 'pending') {
        echo json_encode(['success' => false, 'message' => 'Заявка уже отправлена']);
    } else if ($request['status'] === 'accepted') {
        echo json_encode(['success' => false, 'message' => 'Вы уже друзья']);
    }
    exit();
}

// Отправляем заявку
$stmt = $mysqli->prepare("
    INSERT INTO friend_requests (sender_id, receiver_id) 
    VALUES (?, ?)
");
$stmt->bind_param("ii", $sender_id, $receiver_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Заявка отправлена']);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при отправке заявки']);
}
?>