<?php


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();
require 'config_ispay.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        die("Invalid CSRF token.");
    }

    $field = $_POST['field'];
    $value = $_POST['value'];
    $user_id = $_SESSION['user_id'];

    if (!in_array($field, ['nickname', 'email', 'country'])) {
        die("Invalid field.");
    }

    $stmt = $pdo_ispay->prepare("UPDATE users SET $field = ? WHERE user_id = ?");
    if ($stmt->execute([$value, $user_id])) {
        header("Location: profile.php");
    } else {
        echo "Profile update failed.";
    }
}
?>
