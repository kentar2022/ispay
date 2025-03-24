<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Устанавливаем параметры сессии
session_set_cookie_params([
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Strict'
]);
session_start();

require_once 'config_ispay.php';
require_once 'rate_limiter.php';
require_once 'password_validator.php';

// Проверяем CSRF токен
if (!verify_csrf_token()) {
    secure_log("CSRF token validation failed", "SECURITY");
    echo json_encode(['error' => 'Invalid security token']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!isset($_POST['username']) || !isset($_POST['password'])) {
        secure_log("Login attempt without credentials", "WARNING");
        echo json_encode(['error' => 'Username or password not provided']);
        exit();
    }

    $username = sanitize_input($_POST['username']);
    $password = $_POST['password'];

    // Проверяем rate limiting
    $rateLimiter = new RateLimiter($pdo_ispay);
    $blockStatus = $rateLimiter->isBlocked($username);
    
    if ($blockStatus['blocked']) {
        secure_log("Rate limit exceeded for user: $username", "SECURITY");
        echo json_encode([
            'error' => 'Too many login attempts. Please try again in ' . $blockStatus['timeLeft'] . ' minutes.'
        ]);
        exit();
    }

    try {
        $stmt = $pdo_ispay->prepare("SELECT * FROM users WHERE nickname = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Успешный вход
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['csrf_token'] = generate_csrf_token();
            
            // Очищаем попытки входа
            $rateLimiter->clearAttempts($username);
            
            secure_log("Successful login for user: $username", "INFO");
            echo json_encode(['success' => true, 'redirect' => '../index.html']);
        } else {
            // Неудачная попытка входа
            $rateLimiter->logAttempt($username, false);
            secure_log("Failed login attempt for user: $username", "WARNING");
            echo json_encode(['error' => 'Invalid username or password']);
        }
    } catch (PDOException $e) {
        secure_log("Database error during login: " . $e->getMessage(), "ERROR");
        echo json_encode(['error' => 'Database error']);
    }
} else {
    secure_log("Invalid request method: " . $_SERVER['REQUEST_METHOD'], "WARNING");
    echo json_encode(['error' => 'Invalid request method']);
}
