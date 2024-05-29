<?php


session_start();
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $csrf_token = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare("INSERT INTO users (username, email, password, csrf_token) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$username, $email, $password, $csrf_token])) {
        $_SESSION['csrf_token'] = $csrf_token;
        header("Location: login.php");
    } else {
        echo "Registration failed.";
    }
}
?>
