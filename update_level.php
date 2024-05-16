<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$mysqli = new mysqli("localhost", "kentar", "password", "chechen");

// Проверка подключения
if ($mysqli->connect_error) {
    die("Ошибка подключения к базе данных: " . $mysqli->connect_error);
}

$lessonId = $_POST['lesson_id'];
$user_id = $_POST['user_id'];

// Подготовленный запрос для обновления значения level
$stmt = $mysqli->prepare("UPDATE user_levels SET level = ? WHERE user_id = ?");
$stmt->bind_param("ii", $lessonId, $userId);

// Выполнение запроса
if ($stmt->execute()) {
    echo "Уровень пользователя успешно обновлен.";
} else {
    echo "Ошибка при обновлении уровня пользователя: " . $mysqli->error;
}

// Закрытие запроса и соединения с базой данных
$stmt->close();
$mysqli->close();
?>
