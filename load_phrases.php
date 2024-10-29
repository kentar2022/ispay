<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

ob_start();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['error' => 'Неверный метод запроса. Ожидается GET.']);
    exit;
}

// Получаем параметры из запроса
$language = $_GET['language'] ?? null;
$lesson_id = $_GET['lesson_id'] ?? null;
$topic_id = $_GET['topic_id'] ?? null;
$user_id = $_SESSION['user_id'] ?? 1;

// Проверяем параметры
if (!$language || !$lesson_id || !$topic_id) {
    echo json_encode([
        'error' => 'Язык, идентификатор урока или идентификатор топика не указан.',
        'language' => $language,
        'lesson_id' => $lesson_id,
        'topic_id' => $topic_id,
        'user_id' => $user_id
    ]);
    exit;
}

// Устанавливаем базу данных на основе языка
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

$mysqli = new mysqli("localhost", "kentar", "password", $databaseName);

if ($mysqli->connect_error) {
    echo json_encode(['error' => 'Ошибка подключения к базе данных: ' . $mysqli->connect_error]);
    exit;
}

// Извлекаем урок с учётом уровня и topic_id
$sql = "SELECT data, summary FROM lessons WHERE lesson_level = ? AND topic_id = ?";
$stmt = $mysqli->prepare($sql);

if (!$stmt) {
    echo json_encode(['error' => 'Ошибка подготовки SQL запроса: ' . $mysqli->error]);
    exit;
}

$stmt->bind_param("ii", $lesson_id, $topic_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'error' => 'Данные для указанного урока не найдены.',
        'lesson_id' => $lesson_id,
        'topic_id' => $topic_id
    ]);
    exit;
}

$lessonData = $result->fetch_assoc();
$dataJson = json_decode($lessonData['data'], true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'error' => 'Ошибка декодирования JSON: ' . json_last_error_msg(),
        'raw_data' => $lessonData['data']
    ]);
    exit;
}

$questions = [];
$answers = [];
$debug = ['skipped_items' => [], 'processed_items' => []];

foreach ($dataJson as $item) {
    if (!isset($item['data'])) {
        $debug['skipped_items'][] = [
            'id' => $item['ID'] ?? 'unknown',
            'reason' => 'no_data'
        ];
        continue;
    }

    $questionData = [
        'id' => $item['ID'],
        'text' => $item['data']['text'] ?? null,
        'price' => $item['data']['price'] ?? null,
        'chance' => $item['data']['chance'] ?? null,
        'rating' => $item['data']['rating'] ?? null,
        'task_type' => $item['data']['task_type'] ?? null
    ];

    // Добавляем специфичные поля в зависимости от типа задания
    if ($item['data']['task_type'] === 'matches' && isset($item['data']['matches'])) {
        $questionData['matches'] = [
            'questions' => $item['data']['matches']['questions'],
            'answers' => $item['data']['matches']['answers']
        ];
    } else if ($item['data']['task_type'] === 'multiple_choice') {
        $questionData['possible_answers'] = $item['data']['possible_answers'] ?? null;
        $questionData['answer'] = $item['data']['answer'] ?? null;  // ответ добавляется в вопрос
    } else {
        $questionData['answer'] = $item['data']['answer'] ?? null;
    }

    $questions[] = $questionData;

    // Добавляем ответ только для не-matches типов заданий
    if ($item['data']['task_type'] !== 'matches') {
        $answers[] = [                                    // и тот же ответ добавляется в answers
            'id' => $item['ID'],
            'answer' => $item['data']['answer'] ?? null
        ];
    }

    $debug['processed_items'][] = [
        'id' => $item['ID'],
        'type' => $item['data']['task_type'],
        'has_matches' => isset($item['data']['matches']),
        'has_answer' => isset($item['data']['answer'])
    ];
}

// Добавляем дополнительную отладочную информацию
$response = [
    'questions' => $questions,
    'answers' => $answers,
    'summary' => $lessonData['summary'],
    'debug' => $debug,
    'raw_data_sample' => array_slice($dataJson, 0, 2)
];

echo json_encode($response);

$mysqli->close();
?>