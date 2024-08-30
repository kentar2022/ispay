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

// Подключение к базе данных языка
$conn_language = new mysqli($servername, $username, $password, $language);
if ($conn_language->connect_error) {
    die(json_encode(array("error" => "Ошибка подключения к базе данных языка: " . $conn_language->connect_error)));
}

// Подключение к базе данных пользователя
$conn_user = new mysqli($servername, $username, $password, "ispay");
if ($conn_user->connect_error) {
    die(json_encode(array("error" => "Ошибка подключения к базе данных пользователя: " . $conn_user->connect_error)));
}

// Обновление таблицы прогресса в базе данных языка
$stmt_language = $conn_language->prepare("
    UPDATE topic_progress 
    SET total_score = total_score + ?, 
        completed_lessons = completed_lessons + 1 
    WHERE user_id = ? AND topic_id = ?
");
$stmt_language->bind_param("iii", $newScore, $userId, $topicId);

if ($stmt_language->execute()) {
    // Обновление таблицы статистики пользователя
    $stmt_user = $conn_user->prepare("
        UPDATE profileStats 
        SET score = score + ?, 
            lessonsCompleted = lessonsCompleted + 1 
        WHERE userId = ?
    ");
    $stmt_user->bind_param("ii", $newScore, $userId);

    if ($stmt_user->execute()) {
        echo json_encode(array("success" => "Прогресс пользователя и статистика успешно обновлены."));
    } else {
        echo json_encode(array("error" => "Ошибка при обновлении статистики пользователя: " . $stmt_user->error));
    }

    $stmt_user->close();
} else {
    echo json_encode(array("error" => "Ошибка при обновлении прогресса пользователя: " . $stmt_language->error));
}

// Закрытие запросов и соединений
$stmt_language->close();
$conn_language->close();
$conn_user->close();
?>
