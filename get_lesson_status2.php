<?php
session_start(); // Запуск сессии

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Получаем user_id из сессии
$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['error' => 'Пользователь не авторизован']);
    exit;
}

$language = $_POST['language'] ?? null;
if (!$language) {
    echo json_encode(['error' => 'Язык не указан']);
    exit;
}

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
    echo json_encode(['error' => 'Неверно указан язык']);
    exit;
}

$mysqli = new mysqli("localhost", "kentar", "password", $databaseName);

if ($mysqli->connect_error) {
    die(json_encode(['error' => 'Ошибка подключения к базе данных: ' . $mysqli->connect_error]));
}

// Получение данных из таблицы themes
$themesSql = "SELECT * FROM themes";
$themesResult = $mysqli->query($themesSql);

if (!$themesResult) {
    die(json_encode(['error' => 'Ошибка выполнения запроса: ' . $mysqli->error]));
}

$themeData = [];
while($themeRow = $themesResult->fetch_assoc()) {
    $themeId = $themeRow['id'];

    // Получение данных из таблицы topics для текущего theme_id
    $topicsSql = "SELECT * FROM topics WHERE theme_id = $themeId";
    $topicsResult = $mysqli->query($topicsSql);
    $topics = [];
    while($topicRow = $topicsResult->fetch_assoc()) {
        $topics[] = [
            'topic_id' => $topicRow['id'],
            'topic_name' => $topicRow['topic_name'],
            'total_lessons' => $topicRow['total_lessons']
        ];
    }

    // Получение данных из таблицы theme_progress для текущего пользователя и theme_id
    $progressSql = "SELECT * FROM theme_progress WHERE theme_id = $themeId AND user_id = $user_id";
    $progressResult = $mysqli->query($progressSql);
    $progress = [];
    while($progressRow = $progressResult->fetch_assoc()) {
        $progress = [
            'completed_lessons' => $progressRow['completed_lessons'],
            'completed_topics' => $progressRow['completed_topics'],
            'progress_percentage' => $progressRow['progress_percentage'],
            'total_score' => $progressRow['total_score']
        ];
    }

    // Получение данных из таблицы topic_progress для текущего пользователя и theme_id
    $topicProgressSql = "SELECT * FROM topic_progress WHERE theme_id = $themeId AND user_id = $user_id";
    $topicProgressResult = $mysqli->query($topicProgressSql);
    $topicProgress = [];
    while($topicProgressRow = $topicProgressResult->fetch_assoc()) {
        $topicProgress[$topicProgressRow['topic_id']] = [
            'completed_lessons' => $topicProgressRow['completed_lessons'] ?? 0,
            'total_lessons' => $topicProgressRow['total_lessons'] ?? 0
        ];
    }

    $themeData[] = [
        'theme_id' => $themeRow['id'],
        'theme_name' => $themeRow['themes_name'],
        'total_topics' => $themeRow['total_topics'],
        'topics' => $topics,
        'progress' => $progress,
        'topic_progress' => $topicProgress
    ];
}

$response = [
    'user_id' => $user_id,
    'theme_data' => $themeData
];

echo json_encode($response);

$mysqli->close();
?>
