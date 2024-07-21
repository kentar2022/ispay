<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Установка времени жизни сессии на 24 часа
session_set_cookie_params([
    'path' => '/',
    'domain' => '', // Оставьте пустым для текущего домена
    'secure' => false, // Установите в true, если используете HTTPS
    'httponly' => true, // Сессионные куки доступны только через HTTP(S)
    'samesite' => 'Strict' // Защита от CSRF
]);

session_start();

require 'config.php';  // Подключение к базе данных user_auth

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!isset($_POST['email']) || !isset($_POST['password'])) {
        echo json_encode(['error' => 'Email or password not provided']);
        exit();
    }

    $email = $_POST['email'];
    $password = $_POST['password'];

    $pdo_user_auth = new PDO(
        "mysql:host=localhost;dbname=user_auth;charset=utf8mb4",
        "kentar",
        "password",  // Замените на ваш пароль
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $stmt = $pdo_user_auth->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); // Генерация нового CSRF токена
        echo json_encode(['success' => true]);
        header("Location: ../index.html");
        exit();
    } else {
        echo json_encode(['error' => 'Invalid email or password']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
