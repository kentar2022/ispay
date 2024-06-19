<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();
require 'config.php';  
require 'config_ispay.php';  

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $csrf_token = bin2hex(random_bytes(32));

    
    $stmt = $pdo_user_auth->prepare("INSERT INTO users (email, password, csrf_token) VALUES (?, ?, ?)");
    if ($stmt->execute([$email, $password, $csrf_token])) {
        $user_id = $pdo_user_auth->lastInsertId();
        
        
        $stmt_ispay = $pdo_ispay->prepare("INSERT INTO users (user_id, email) VALUES (?, ?)");
        $stmt_ispay->execute([$user_id, $email]);

        $_SESSION['csrf_token'] = $csrf_token;
        $_SESSION['user_id'] = $user_id; 
        header("Location: login.html");
    } else {
        echo "Registration failed.";
    }
}
?>
