<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['csrf_token'])) {
    header("Location: login.php");
    exit();
}

echo "Welcome to the protected page, your CSRF token is: " . htmlspecialchars($_SESSION['csrf_token']);
?>
