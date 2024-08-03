<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$language = $_POST['language'] ?? null; // Получаем значение языка из POST-запроса
if (!$language) {
    echo json_encode(['error' => 'Language not specified']);
    exit;
}

$databaseName = match (strtolower($language)) {
    'chechen' => 'chechen',
    'ingush' => 'ingush',
    'adyge' => 'adyge',
    'udmurt' => 'udmurt',
    'tatar' => 'tatar',
    'chuvash' => 'chuvash',
    default => null,
};

if (!$databaseName) {
    echo json_encode(['error' => 'Invalid language specified']);
    exit;
}

$mysqli = new mysqli("localhost", "kentar", "password", $databaseName);

if ($mysqli->connect_error) {
    die(json_encode(['error' => 'Ошибка подключения к базе данных: ' . $mysqli->connect_error]));
}

// Получение данных из таблицы lessons
$lessonsSql = "SELECT * FROM lessons";
$lessonsResult = $mysqli->query($lessonsSql);

$lessonData = [];
while($lessonRow = $lessonsResult->fetch_assoc()) {
    $lessonId = $lessonRow['id'];

    // Получение данных из таблицы topics для текущего lesson_id
    $topicsSql = "SELECT * FROM topics WHERE lesson_id = $lessonId";
    $topicsResult = $mysqli->query($topicsSql);
    $topics = [];
    while($topicRow = $topicsResult->fetch_assoc()) {
        $topics[] = [
            'topic_name' => $topicRow['topic_name'],
            'completed_lessons_per_topic' => $topicRow['completed_lessons_per_topic'],
            'lessons_per_topic' => $topicRow['lessons_per_topic']
        ];
    }

    $lessonData[] = [
        'lessons_completed' => $lessonRow['lessons_completed'],
        'total_lessons' => $lessonRow['total_lessons'],
        'completion_percentage' => $lessonRow['completion_percentage'],
        'topics' => $topics
    ];
}

echo json_encode($lessonData);

$mysqli->close();
?>
