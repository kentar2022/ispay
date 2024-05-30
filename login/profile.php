<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();
require 'config.php';  // Подключение к базе данных user_auth
require 'config_ispay.php';  // Подключение к базе данных ispay

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];

// Получение CSRF токена из таблицы user_auth
$stmt_auth = $pdo_user_auth->prepare("SELECT csrf_token FROM users WHERE id = ?");
$stmt_auth->execute([$user_id]);
$user_auth = $stmt_auth->fetch(PDO::FETCH_ASSOC);

// Получение email, nickname и country из таблицы ispay
$stmt_ispay = $pdo_ispay->prepare("SELECT email, nickname, country FROM users WHERE user_id = ?");
$stmt_ispay->execute([$user_id]);
$user_ispay = $stmt_ispay->fetch(PDO::FETCH_ASSOC);

if ($user_auth && $user_ispay) {
    $user = array_merge($user_auth, $user_ispay);
    echo json_encode($user);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
}
?>
