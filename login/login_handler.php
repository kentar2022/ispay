<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set('session.gc_maxlifetime', 86400); // 24 часа
ini_set('session.cookie_lifetime', 86400); // 24 часа

session_set_cookie_params([
    'lifetime' => 86400, // 24 часа
    'path' => '/',
    'domain' => '', // Оставьте пустым для текущего домена
    'secure' => false, // Установите в true, если используете HTTPS
    'httponly' => true, // Сессионные куки доступны только через HTTP(S)
    'samesite' => 'Strict' // Защита от CSRF
]);

session_start();

require 'config.php';  // Подключение к базе данных user_auth

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Проверяем, что ключи 'email' и 'password' существуют в массиве $_POST
    if (!isset($_POST['email']) || !isset($_POST['password'])) {
        echo json_encode(['error' => 'Email or password not provided']);
        exit();
    }

    $email = $_POST['email'];
    $password = $_POST['password'];

    // Инициализация подключения к базе данных user_auth
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

    // Поиск пользователя по email
    $stmt = $pdo_user_auth->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Успешный вход в систему
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); // Генерация нового CSRF токена
        echo json_encode(['success' => true]);
        header("Location: ../index.html");  // Перенаправление на index.html
        exit();
    } else {
        // Неверный email или пароль
        echo json_encode(['error' => 'Invalid email or password']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
