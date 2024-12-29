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

require 'config_ispay.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!isset($_POST['username']) || !isset($_POST['password'])) {
        error_log('Ошибка: Логин или пароль не переданы');
        echo json_encode(['error' => 'Username or password not provided']);
        exit();
    }

    $username = trim($_POST['username']);
    $password = $_POST['password'];

    try {
        $stmt = $pdo_ispay->prepare("SELECT * FROM users WHERE nickname = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

            error_log('Успешный вход для пользователя: ' . $username);
            echo json_encode(['success' => true, 'redirect' => '../index.html']);
        } else {
            error_log('Ошибка: Неверный логин или пароль');
            echo json_encode(['error' => 'Invalid username or password']);
        }
    } catch (PDOException $e) {
        error_log('Ошибка базы данных: ' . $e->getMessage());
        echo json_encode(['error' => 'Database error']);
    }
} else {
    error_log('Ошибка: Неправильный метод запроса');
    echo json_encode(['error' => 'Invalid request method']);
}
