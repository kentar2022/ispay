<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require 'config.php';  // Убедитесь, что путь к файлу верный

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $login = $_POST['login'];
    $password = $_POST['password'];

    // Проверка учетных данных пользователя
    $stmt = $pdo_user_auth->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$login]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

        // Перенаправление на index.html
        header("Location: ../index.html");
        exit();
    } else {
        // Неправильные учетные данные
        header("Location: ../login.html?error=invalid_credentials");
        exit();
    }
}
?>
