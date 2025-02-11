<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

function logWithTime($message) {
    error_log(date('Y-m-d H:i:s') . " - " . $message);
}

logWithTime("Starting registration process");

session_start();
require 'config_ispay.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit();
}

// Изменено с login на username для консистентности
if (!isset($_POST['username']) || !isset($_POST['password'])) {
    echo json_encode(['error' => 'Username or password not provided']);
    exit();
}

try {
    $pdo_ispay->beginTransaction();

    $username = trim($_POST['username']); // Изменено с login на username
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $csrf_token = bin2hex(random_bytes(32));

    // Проверка существующего логина
    $check_stmt = $pdo_ispay->prepare("SELECT user_id FROM users WHERE nickname = ?");
    $check_stmt->execute([$username]);
    if ($check_stmt->fetch()) {
        echo json_encode(['error' => 'Username already exists']);
        exit();
    }

    // Вставка пользователя
    $stmt = $pdo_ispay->prepare("INSERT INTO users (nickname, password, csrf_token) VALUES (?, ?, ?)");
    $stmt->execute([$username, $password, $csrf_token]);
    $user_id = $pdo_ispay->lastInsertId();

    // Создаем запись в profileStats
    $stats_stmt = $pdo_ispay->prepare(
        "INSERT INTO profileStats (userId, score, lessonsCompleted, overallRank, crystals, coins, languages_list) 
         VALUES (?, 0, 0, 0, 0, 0, '')"
    );
    $stats_stmt->execute([$user_id]);

    // Создаем запись в gifts
    $gifts_stmt = $pdo_ispay->prepare(
        "INSERT INTO gifts (user_id, gift_day, timestamp) 
         VALUES (?, 0, NULL)"
    );
    $gifts_stmt->execute([$user_id]);

    $pdo_ispay->commit();

    $_SESSION['csrf_token'] = $csrf_token;
    $_SESSION['user_id'] = $user_id;

    logWithTime("User successfully registered with ID: " . $user_id);
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $pdo_ispay->rollBack();
    
    logWithTime("Registration error: " . $e->getMessage());
    echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
}

logWithTime("Script completed");
?>