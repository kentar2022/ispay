<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();
require 'config_ispay.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = $_SESSION['user_id'];
    $field = $_POST['field'];
    $value = $_POST['value'];

    // Проверяем, что поле, которое мы хотим обновить, допустимо
    if (!in_array($field, ['nickname', 'email', 'country'])) {
        die("Invalid field.");
    }

    // Обновляем только одно поле
    $stmt = $pdo_ispay->prepare("UPDATE users SET $field = ? WHERE user_id = ?");
    if ($stmt->execute([$value, $user_id])) {
        header("Location: ../index.html");
    } else {
        echo "Profile update failed.";
    }
}
?>
