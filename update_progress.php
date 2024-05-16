<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$servername = "localhost";
$username = "kentar";
$password = "password";
$dbname = "chechen";

// Создание подключения
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка соединения
if ($conn->connect_error) {
    die(json_encode(array("error" => "Ошибка подключения к базе данных: " . $conn->connect_error)));
}

// Получение данных из POST запроса (например, идентификатора пользователя и количества очков)
$user_id = isset($_POST['user_id']) ? $_POST['user_id'] : null;
$new_score = isset($_POST['new_score']) ? $_POST['new_score'] : null;

// Проверка наличия данных
if ($user_id !== null && $new_score !== null) {
    // Обновление прогресса пользователя
    $sql_update_progress = "UPDATE progress SET total_score = total_score + $new_score WHERE id = $user_id";


    if ($conn->query($sql_update_progress) === TRUE) {
        echo json_encode(array("success" => "Прогресс пользователя успешно обновлен."));
    } else {
        echo json_encode(array("error" => "Ошибка при обновлении прогресса пользователя: " . $conn->error));
    }
} else {
    echo json_encode(array("error" => "Отсутствуют необходимые данные для обновления прогресса пользователя."));
}

// Закрытие соединения с базой данных
$conn->close();
?>
