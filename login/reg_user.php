<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();
require 'config.php';  // Подключение к базе данных user_auth
require 'config_ispay.php';  // Подключение к базе данных ispay

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $csrf_token = bin2hex(random_bytes(32));

    // Вставка данных в таблицу user_auth.users
    $stmt = $pdo->prepare("INSERT INTO users (email, password, csrf_token) VALUES (?, ?, ?)");
    if ($stmt->execute([$email, $password, $csrf_token])) {
        $user_id = $pdo->lastInsertId();
        
        // Вставка данных в таблицу ispay.users
        $stmt_ispay = $pdo_ispay->prepare("INSERT INTO users (user_id, email) VALUES (?, ?)");
        $stmt_ispay->execute([$user_id, $email]);

        $_SESSION['csrf_token'] = $csrf_token;
        $_SESSION['user_id'] = $user_id;  // Сохранение user_id в сессии
        header("Location: login.php");
    } else {
        echo "Registration failed.";
    }
}
?>
