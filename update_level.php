<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$servername = "localhost";
$username = "kentar";
$password = "password";

if (!isset($_POST['language'])) {
    die(json_encode(array("error" => "Language parameter is missing.")));
}

$language = $_POST['language']; 

$conn = new mysqli($servername, $username, $password, $language);

if ($conn->connect_error) {
    die(json_encode(array("error" => "Ошибка подключения к базе данных: " . $conn->connect_error)));
}

$lessonId = isset($_POST['lesson_id']) ? $_POST['lesson_id'] : null;
$userId = isset($_POST['user_id']) ? $_POST['user_id'] : null;

$stmt = $conn->prepare("UPDATE user_levels SET level = ? WHERE user_id = ?");
$stmt->bind_param("ii", $lessonId, $userId);

if ($stmt->execute()) {
    echo json_encode(array("success" => "Уровень пользователя успешно обновлен."));
} else {
    echo json_encode(array("error" => "Ошибка при обновлении уровня пользователя: " . $stmt->error));
}

$stmt->close();
$conn->close();
?>
