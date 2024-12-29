<?php
// logout.php
require_once 'init.php';

// Очистка всех данных сессии
$_SESSION = array();

// Удаление куки сессии
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => '/',
        'domain' => '',
        'secure' => false, // Измените на true если используете HTTPS
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
}

// Уничтожение сессии
session_destroy();

// Перенаправление на страницу входа
header("Location: login.html");
exit();
?>