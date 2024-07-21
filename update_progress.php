<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$servername = "localhost";
$username = "kentar";
$password = "password";

// Проверяем наличие данных в массиве $_POST
if (!isset($_POST['user_id']) || !isset($_POST['new_score']) || !isset($_POST['language'])) {
    echo json_encode(array("error" => "Отсутствуют необходимые данные для обновления прогресса пользователя.",
                            "post_data" => $_POST));
    exit();
}

$userId = $_POST['user_id'];
$newScore = $_POST['new_score'];
$language = $_POST['language'];

// Подключаемся к базе данных
$conn = new mysqli($servername, $username, $password, $language);

if ($conn->connect_error) {
    die(json_encode(array("error" => "Ошибка подключения к базе данных: " . $conn->connect_error)));
}

// Подготовленный запрос для обновления значения total_score
$stmt = $conn->prepare("UPDATE progress SET total_score = total_score + ? WHERE id = ?");
$stmt->bind_param("ii", $newScore, $userId);

// Выполнение запроса
if ($stmt->execute()) {
    echo json_encode(array("success" => "Прогресс пользователя успешно обновлен."));
} else {
    echo json_encode(array("error" => "Ошибка при обновлении прогресса пользователя: " . $stmt->error));
}

// Закрытие запроса и соединения с базой данных
$stmt->close();
$conn->close();
?>
