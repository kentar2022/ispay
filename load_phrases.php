<?php
// Включение отображения ошибок для отладки
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Начало буферизации вывода для перехвата ошибок
ob_start();

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['error' => 'Неверный метод запроса. Ожидается GET.']);
    exit;
}

// Получение параметров из запроса
$language = $_GET['language'] ?? null;
$lesson_id = $_GET['lesson_id'] ?? null;

if (!$language || !$lesson_id) {
    echo json_encode(['error' => 'Язык или идентификатор урока не указан.']);
    exit;
}

// Определение базы данных на основе выбранного языка
$databaseName = match (strtolower($language)) {
    'chechen' => 'chechen',
    'ingush' => 'ingush',
    'adyge' => 'adyge',
    'udmurt' => 'udmurt',
    'tatar' => 'tatar',
    'chuvash' => 'chuvash',
    'bashkort' => 'bashkort',
    default => null,
};

if (!$databaseName) {
    echo json_encode(['error' => 'Ошибка: неверный выбор базы данных.']);
    exit;
}

// Подключение к базе данных
$mysqli = new mysqli("localhost", "kentar", "password", $databaseName);

if ($mysqli->connect_error) {
    echo json_encode(['error' => 'Ошибка подключения к базе данных: ' . $mysqli->connect_error]);
    exit;
}

// Извлечение данных для указанного урока
$sql = "SELECT data, summary FROM lessons WHERE lesson_level = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("i", $lesson_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Данные для указанного урока не найдены.']);
    exit;
}

$lessonData = $result->fetch_assoc();
$dataJson = json_decode($lessonData['data'], true);

// Проверка на корректность JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Ошибка декодирования JSON: ' . json_last_error_msg()]);
    exit;
}

// Формирование массива вопросов и ответов
$questions = [];
$answers = [];

foreach ($dataJson as $item) {
    if (isset($item['data']['text']) && isset($item['data']['word_russian'])) {
        $questions[] = [
            'id' => $item['ID'],
            'text' => $item['data']['text'],
            'price' => $item['data']['price'] ?? null,
            'chance' => $item['data']['chance'] ?? null,
            'rating' => $item['data']['rating'] ?? null,
            'task_type' => $item['data']['task_type'] ?? null,  // Добавлено поле task_type
            'translation' => $item['data']['word_russian'],
            'possible_answers' => $item['data']['possible_answers'] ?? null,  // Возможные ответы для типа multiple_choice
            'matches' => $item['data']['matches'] ?? null  // Сопоставления для типа matches
        ];
        $answers[] = [
            'id' => $item['ID'],
            'word_russian' => $item['data']['word_russian']
        ];
    }
}

// Подготовка данных для отправки в клиент
$response = [
    'questions' => $questions,
    'answers' => $answers,
    'summary' => $lessonData['summary']
];

// Проверка ошибок PHP
$phpErrors = ob_get_clean();
if ($phpErrors) {
    echo json_encode(['error' => 'PHP Error: ' . $phpErrors]);
    exit;
}

// Успешный ответ
echo json_encode($response);

// Закрытие соединения
$mysqli->close();
