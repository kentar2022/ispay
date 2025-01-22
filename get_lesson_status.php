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
    if (!$topicsStmt) {
        echo json_encode(['error' => 'Ошибка подготовки запроса к таблице topics: ' . $mysqli->error]);
        exit;
    }
    $topicsStmt->bind_param("i", $themeId);
    $topicsStmt->execute();
    $topicsResult = $topicsStmt->get_result();
    $topics = [];
    while ($topicRow = $topicsResult->fetch_assoc()) {
        $topics[] = [
            'topic_id' => $topicRow['id'],
            'topic_name' => $topicRow['topic_name'],
            'total_lessons' => $topicRow['total_lessons']
        ];
    }
    $topicsStmt->close();

    // Получение прогресса пользователя из таблицы user_progress
    $progressSql = "SELECT * FROM user_progress WHERE theme_id = ? AND user_id = ?";
    $progressStmt = $mysqli->prepare($progressSql);
    if (!$progressStmt) {
        echo json_encode(['error' => 'Ошибка подготовки запроса к таблице user_progress: ' . $mysqli->error]);
        exit;
    }
    $progressStmt->bind_param("ii", $themeId, $user_id);
    $progressStmt->execute();
    $progressResult = $progressStmt->get_result();
    
    $themeProgress = [];
    $topicProgress = [];
    
    while ($progressRow = $progressResult->fetch_assoc()) {
        if ($progressRow['topic_id'] === null) {
            $themeProgress = [
                'completed_topics' => $progressRow['completed_topics'] ?? 0,
                'progress_percentage' => $progressRow['progress_percentage'] ?? 0,
                'total_score' => $progressRow['total_score'] ?? 0
            ];
        } else {
            $topicProgress[$progressRow['topic_id']] = [
                'completed_lessons' => $progressRow['completed_lessons'] ?? 0,
                'total_score' => $progressRow['total_score'] ?? 0
            ];
        }
    }
    $progressStmt->close();

    // Формирование данных темы для ответа
    $themeData[] = [
        'theme_id' => $themeRow['id'],
        'theme_name' => $themeRow['themes_name'],
        'total_topics' => $themeRow['total_topics'],
        'topics' => $topics,
        'theme_progress' => $themeProgress,
        'topic_progress' => $topicProgress
    ];
}

// Формирование общего ответа
$response = [
    'user_id' => $user_id,
    'theme_data' => $themeData
];

echo json_encode($response);

// Закрытие соединения с базой данных
$mysqli->close();
?>
