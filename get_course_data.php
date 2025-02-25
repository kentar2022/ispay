<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Получаем язык и user_id из GET-запроса
if (!isset($_GET['language']) || !isset($_GET['user_id'])) {
    die(json_encode(['error' => 'Language or user ID not provided']));
}

$language = $_GET['language'];
$user_id = $_GET['user_id'];

// Сначала подключаемся к основной базе данных для проверки прав доступа
$main_connection = new mysqli("localhost", "kentar", "password", "ispay");

if ($main_connection->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $main_connection->connect_error]));
}

// Проверяем, есть ли у пользователя доступ к этому языку
$query = "SELECT languages_list FROM profileStats WHERE userId = ?";
$stmt = $main_connection->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if (!$row || !in_array($language, array_map('trim', explode(',', $row['languages_list'])))) {
    $main_connection->close();
    die(json_encode(['error' => 'Access denied to this language']));
}

$main_connection->close();

// Подключаемся к базе данных выбранного языка
$lang_connection = new mysqli("localhost", "kentar", "password", $language);

if ($lang_connection->connect_error) {
    die(json_encode(['error' => 'Connection to language database failed: ' . $lang_connection->connect_error]));
}

// Получаем прогресс пользователя из JSON
$progress_query = "SELECT progress_data FROM user_progress WHERE user_id = ?";
$stmt = $lang_connection->prepare($progress_query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$progress_result = $stmt->get_result();
$user_progress = null;

if ($progress_result->num_rows > 0) {
    $row = $progress_result->fetch_assoc();
    $user_progress = json_decode($row['progress_data'], true);
}

// Получаем темы и их топики
$response = [];
$themes_query = "SELECT * FROM themes ORDER BY id";
$themes_result = $lang_connection->query($themes_query);

if ($themes_result) {
    while ($theme = $themes_result->fetch_assoc()) {
        $theme_data = [
            'theme_id' => $theme['id'],
            'theme_name' => $theme['themes_name'],
            'total_topics' => (int)$theme['total_topics'],
            'topics' => []
        ];

        // Получаем топики для каждой темы
        $topics_query = "SELECT id, topic_name, total_lessons FROM topics WHERE theme_id = ? ORDER BY id";
        $stmt = $lang_connection->prepare($topics_query);
        $stmt->bind_param("i", $theme['id']);
        $stmt->execute();
        $topics_result = $stmt->get_result();

        while ($topic = $topics_result->fetch_assoc()) {
            $completed_lessons = 0;
            $total_score = 0;

            // Получаем прогресс для этого топика из JSON если он есть
            if ($user_progress && 
                isset($user_progress['languages'][$language]['topics'][$topic['id']])) {
                $topic_progress = $user_progress['languages'][$language]['topics'][$topic['id']];
                $completed_lessons = $topic_progress['completed_lessons'];
                $total_score = $topic_progress['total_score'];
            }

            $theme_data['topics'][] = [
                'id' => (int)$topic['id'],
                'topic_name' => $topic['topic_name'],
                'total_lessons' => (int)$topic['total_lessons'],
                'completed_lessons' => (int)$completed_lessons,
                'total_score' => (int)$total_score
            ];
        }

        // Вычисляем общий прогресс для темы
        $total_lessons = array_sum(array_column($theme_data['topics'], 'total_lessons'));
        $completed_lessons = array_sum(array_column($theme_data['topics'], 'completed_lessons'));
        $total_score = array_sum(array_column($theme_data['topics'], 'total_score'));

        $theme_data['theme_progress'] = [
            'completed_topics' => count(array_filter($theme_data['topics'], 
                fn($t) => $t['completed_lessons'] >= $t['total_lessons'])),
            'progress_percentage' => $total_lessons > 0 
                ? round(($completed_lessons / $total_lessons) * 100) 
                : 0,
            'total_score' => $total_score
        ];

        $response[] = $theme_data;
    }
}

$lang_connection->close();
echo json_encode($response);
?>