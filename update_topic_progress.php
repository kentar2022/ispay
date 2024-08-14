<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$servername = "localhost";
$username = "kentar";
$password = "password";

// Проверяем наличие необходимых данных в $_POST
if (!isset($_POST['user_id']) || !isset($_POST['topic_id']) || !isset($_POST['new_score']) || !isset($_POST['language'])) {
    echo json_encode(array("error" => "Отсутствуют необходимые данные для обновления прогресса пользователя.",
                            "post_data" => $_POST));
    exit();
}

$userId = $_POST['user_id'];
$topicId = $_POST['topic_id'];
$newScore = $_POST['new_score'];
$language = $_POST['language'];

// Подключение к базе данных
$conn = new mysqli($servername, $username, $password, $language);

if ($conn->connect_error) {
    die(json_encode(array("error" => "Ошибка подключения к базе данных: " . $conn->connect_error)));
}

// Подготовка запроса для обновления total_score и completed_lessons
$stmt = $conn->prepare("
    UPDATE topic_progress 
    SET total_score = total_score + ?, 
        completed_lessons = completed_lessons + 1 
    WHERE user_id = ? AND topic_id = ?
");
$stmt->bind_param("iii", $newScore, $userId, $topicId);

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
