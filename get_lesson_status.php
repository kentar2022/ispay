<?php
session_start();
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

// Проверяем, что запрос пришел методом POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(['error' => 'Неверный метод запроса. Ожидается POST.']);
    exit;
}

// Получаем параметр language из запроса
$language = $_POST['language'] ?? null;
if (!$language) {
    echo json_encode(['error' => 'Язык не указан']);
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
    'moksha' => 'moksha',
    'lezgin' => 'lezgin',
    'bashkort' => 'bashkort',
    default => null,
};

if (!$databaseName) {
    echo json_encode(['error' => 'Неверно указан язык']);
    exit;
}

// Подключение к базе данных
$mysqli = new mysqli("localhost", "kentar", "password", $databaseName);
if ($mysqli->connect_error) {
    die(json_encode(['error' => 'Ошибка подключения к базе данных: ' . $mysqli->connect_error]));
}

// Получаем прогресс пользователя из новой таблицы
$progressSql = "SELECT progress_data FROM user_progress WHERE user_id = ?";
$progressStmt = $mysqli->prepare($progressSql);
$progressStmt->bind_param("i", $user_id);
$progressStmt->execute();
$progressResult = $progressStmt->get_result();
$userProgress = null;

if ($progressResult->num_rows > 0) {
    $row = $progressResult->fetch_assoc();
    $userProgress = json_decode($row['progress_data'], true);
}
$progressStmt->close();

// Получение данных из таблицы themes
$themesSql = "SELECT * FROM themes";
$themesResult = $mysqli->query($themesSql);
if (!$themesResult) {
    die(json_encode(['error' => 'Ошибка выполнения запроса к таблице themes: ' . $mysqli->error]));
}

$themeData = [];
while ($themeRow = $themesResult->fetch_assoc()) {
    $themeId = $themeRow['id'];

    // Получение данных из таблицы topics для текущего theme_id
    $topicsSql = "SELECT * FROM topics WHERE theme_id = ?";
    $topicsStmt = $mysqli->prepare($topicsSql);
    $topicsStmt->bind_param("i", $themeId);
    $topicsStmt->execute();
    $topicsResult = $topicsStmt->get_result();
    
    $topics = [];
    $completedLessonsTotal = 0;
    $totalLessonsInTheme = 0;
    $totalScoreInTheme = 0;
    
    while ($topicRow = $topicsResult->fetch_assoc()) {
        $topicId = $topicRow['id'];
        $totalLessons = (int)$topicRow['total_lessons'];
        $totalLessonsInTheme += $totalLessons;
        
        // Получаем прогресс для конкретного топика из JSON
        $completedLessons = 0;
        $topicScore = 0;
        
        if ($userProgress && 
            isset($userProgress['languages'][$language]['topics'][$topicId])) {
            $topicProgress = $userProgress['languages'][$language]['topics'][$topicId];
            $completedLessons = min((int)$topicProgress['completed_lessons'], $totalLessons);
            $topicScore = (int)$topicProgress['total_score'];
        }
        
        $completedLessonsTotal += $completedLessons;
        $totalScoreInTheme += $topicScore;
        
        $topics[] = [
            'id' => $topicId,
            'topic_name' => $topicRow['topic_name'],
            'total_lessons' => $totalLessons,
            'completed_lessons' => $completedLessons,
            'total_score' => $topicScore
        ];
    }
    $topicsStmt->close();
    
    // Вычисляем процент прогресса для темы
    $progressPercentage = $totalLessonsInTheme > 0 
        ? round(($completedLessonsTotal / $totalLessonsInTheme) * 100) 
        : 0;
    
    // Считаем завершенные топики
    $completedTopics = count(array_filter($topics, function($topic) {
        return $topic['completed_lessons'] >= $topic['total_lessons'];
    }));

    $themeData[] = [
        'id' => $themeId,
        'theme_name' => $themeRow['themes_name'],
        'total_topics' => (int)$themeRow['total_topics'],
        'topics' => $topics,
        'theme_progress' => [
            'completed_topics' => $completedTopics,
            'progress_percentage' => $progressPercentage,
            'total_score' => $totalScoreInTheme
        ]
    ];
}

// Формирование общего ответа
$response = [
    'user_id' => $user_id,
    'theme_data' => $themeData
];

echo json_encode($response);
$mysqli->close();
?>