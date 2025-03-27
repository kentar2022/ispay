<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

require_once 'config_ispay.php';
require_once 'password_validator.php';

function logWithTime($message) {
    error_log(date('Y-m-d H:i:s') . " - " . $message);
}

logWithTime("Starting registration process");

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit();
}

// Проверяем CSRF токен
if (!verify_csrf_token()) {
    error_log("CSRF token validation failed during registration", "SECURITY");
    echo json_encode(['error' => 'Invalid security token']);
    exit();
}

if (!isset($_POST['username']) || !isset($_POST['password'])) {
    echo json_encode(['error' => 'Username and password are required']);
    exit();
}

try {
    // Валидация входных данных
    $username = sanitize_input($_POST['username']);
    $password = $_POST['password'];

    // Проверяем сложность пароля
    $validator = new PasswordValidator();
    $validation = $validator->validate($password);
    
    if (!$validation['isValid']) {
        echo json_encode(['error' => 'Password does not meet security requirements', 'details' => $validation['errors']]);
        exit();
    }

    $pdo_ispay->beginTransaction();

    // Проверка существующего логина
    $check_stmt = $pdo_ispay->prepare("SELECT user_id FROM users WHERE nickname = ?");
    $check_stmt->execute([$username]);
    if ($check_stmt->fetch()) {
        echo json_encode(['error' => 'Username already exists']);
        exit();
    }

    // Хешируем пароль
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $csrf_token = generate_csrf_token();

    // Вставка пользователя
    $stmt = $pdo_ispay->prepare("INSERT INTO users (nickname, password, csrf_token) VALUES (?, ?, ?)");
    $stmt->execute([$username, $hashedPassword, $csrf_token]);
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