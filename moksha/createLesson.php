<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(["error" => "Неверный метод запроса."]));
}

// Получение данных из POST-запроса
$data = json_decode(file_get_contents('php://input'), true);

// Проверка обязательных полей
$lessonLevel = $data['lessonLevel'] ?? null;
$lessonTopicId = $data['lessonTopicId'] ?? null;
$tasks = $data['tasks'] ?? [];
$lessonSummary = $data['lessonSummary'] ?? null; // Может быть NULL

if (!$lessonLevel || !$lessonTopicId) {
    die(json_encode([
        "error" => "Отсутствуют обязательные данные (lessonLevel, lessonTopicId).",
        "receivedData" => $data // Добавлено для отладки
    ]));
}

// Подключение к базе данных
$conn = new mysqli('localhost', 'kentar', 'password', 'moksha');

if ($conn->connect_error) {
    die(json_encode(["error" => "Ошибка подключения к базе данных: " . $conn->connect_error]));
}

// Преобразование массива заданий в JSON
$tasksJson = json_encode($tasks, JSON_UNESCAPED_UNICODE);

// Добавление урока
$stmt = $conn->prepare("INSERT INTO lessons (lesson_level, topic_id, data, summary) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiss", $lessonLevel, $lessonTopicId, $tasksJson, $lessonSummary);

if (!$stmt->execute()) {
    die(json_encode([
        "error" => "Ошибка при сохранении данных: " . $stmt->error,
        "receivedData" => $data // Добавлено для отладки
    ]));
}

// Получение ID добавленного урока
$lessonId = $stmt->insert_id;

echo json_encode([
    "success" => "Урок успешно добавлен.",
    "lessonId" => $lessonId,
    "receivedData" => $data // Добавлено для отладки
]);

$stmt->close();
$conn->close();
?>
