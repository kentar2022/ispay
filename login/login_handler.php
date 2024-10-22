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
    if (!isset($_POST['username']) || !isset($_POST['password'])) {
        echo json_encode(['error' => 'Username or password not provided']);
        exit();
    }

    $username = $_POST['username'];  // Теперь может быть и почта, и никнейм
    $password = $_POST['password'];

    // Проверка, является ли введенное значение email или никнеймом
    if (filter_var($username, FILTER_VALIDATE_EMAIL)) {
        // Поиск по email
        $query = "SELECT * FROM users WHERE email = ?";
    } else {
        // Поиск по никнейму
        $query = "SELECT * FROM users WHERE nickname = ?";
    }

    try {
        // Подключение к базе данных user_auth
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

        // Выполняем подготовленный запрос с использованием email или никнейма
        $stmt = $pdo_user_auth->prepare($query);
        $stmt->execute([$username]);  // Передаем либо email, либо никнейм
        $user = $stmt->fetch();

        // Проверка пароля
        if ($user && password_verify($password, $user['password'])) {
            // Установка сессии и CSRF-токена
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));  // Генерация нового CSRF токена

            // Возвращаем успешный результат
            echo json_encode(['success' => true]);
            header("Location: ../index.html");  // Перенаправление на главную страницу
            exit();
        } else {
            // Неверный пароль или пользователь
            echo json_encode(['error' => 'Invalid username or password']);
        }

    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
