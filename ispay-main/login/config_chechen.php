<?php
$dsn = 'mysql:host=localhost;dbname=chechen;charset=utf8mb4';
$username = 'kentar';
$password = 'password';

try {
    $pdo_chechen = new PDO($dsn, $username, $password);
    $pdo_chechen->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Ошибка подключения к базе данных chechen: " . $e->getMessage());
}
?>
