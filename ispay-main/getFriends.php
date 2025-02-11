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

$sql = "SELECT u.id, u.nickname, u.avatar FROM friends f INNER JOIN users u ON f.friend_id = u.id WHERE f.user_id = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$default_avatar = 'images/avatar.png'; // Путь к дефолтной аватарке
$friends = [];
while ($row = $result->fetch_assoc()) {
    if (empty($row['avatar'])) {
        $row['avatar'] = $default_avatar;
    }
    $friends[] = $row;
}

echo json_encode($friends);

$stmt->close();
$mysqli->close();

?>
