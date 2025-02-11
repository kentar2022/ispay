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

// Получаем темы
$response = [];
$themes_query = "SELECT * FROM themes ORDER BY id";
$themes_result = $lang_connection->query($themes_query);

if ($themes_result) {
    while ($theme = $themes_result->fetch_assoc()) {
        $theme_data = [
            'id' => $theme['id'],
            'name' => $theme['themes_name'],
            'total_topics' => $theme['total_topics'],
            'topics' => []
        ];

        // Получаем топики для каждой темы
        $topics_query = "SELECT * FROM topics WHERE theme_id = ? ORDER BY id";
        $stmt = $lang_connection->prepare($topics_query);
        $stmt->bind_param("i", $theme['id']);
        $stmt->execute();
        $topics_result = $stmt->get_result();

        while ($topic = $topics_result->fetch_assoc()) {
            $theme_data['topics'][] = [
                'id' => $topic['id'],
                'name' => $topic['topic_name'],
                'total_lessons' => $topic['total_lessons'],
                'completed_lessons' => 0 // Здесь можно добавить логику подсчета завершенных уроков
            ];
        }

        $response[] = $theme_data;
    }
}

$lang_connection->close();
echo json_encode($response);
?>