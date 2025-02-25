<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');

$debug_log = [];
function debug($message) {
    global $debug_log;
    $debug_log[] = $message;
}

try {
    debug("Script started");
    
    $rawData = file_get_contents('php://input');
    debug("Raw input data: " . $rawData);
    
    $input = json_decode($rawData, true);
    debug("Decoded input: " . json_encode($input));
    
    $user_id = $input['user_id'] ?? null;
    $language = $input['language'] ?? null;

    if (!isset($user_id) || !isset($language)) {
        echo json_encode([
            'error' => 'Invalid input',
            'debug' => $debug_log
        ]);
        exit();
    }

    $mysqli = new mysqli("localhost", "kentar", "password", $language);
    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    debug("Connected to database: $language");

    // Проверяем существование записи в таблице user_progress
    $checkQuery = "SELECT progress_data FROM user_progress WHERE user_id = ?";
    $checkStmt = $mysqli->prepare($checkQuery);
    $checkStmt->bind_param("i", $user_id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows > 0) {
        debug("User progress already exists");
        echo json_encode([
            'success' => true,
            'message' => 'Progress already initialized',
            'debug' => $debug_log
        ]);
        exit();
    }

    // Получаем все темы и их топики
    $themesQuery = "SELECT t.id as theme_id, t.themes_name, t.total_topics, 
                           tp.id as topic_id, tp.topic_name, tp.total_lessons 
                    FROM themes t 
                    LEFT JOIN topics tp ON t.id = tp.theme_id 
                    ORDER BY t.id, tp.id";
    
    $result = $mysqli->query($themesQuery);
    if (!$result) {
        throw new Exception("Error fetching course structure: " . $mysqli->error);
    }

    // Создаем структуру JSON
    $progressData = [
        'languages' => [
            $language => [
                'topics' => []
            ]
        ]
    ];

    // Заполняем топики
    while ($row = $result->fetch_assoc()) {
        if ($row['topic_id'] !== null) {
            $progressData['languages'][$language]['topics'][$row['topic_id']] = [
                'completed_lessons' => 0,
                'total_score' => 0
            ];
        }
    }

    // Сохраняем JSON в базу данных
    $jsonData = json_encode($progressData);
    $insertStmt = $mysqli->prepare("INSERT INTO user_progress (user_id, progress_data) VALUES (?, ?)");
    $insertStmt->bind_param("is", $user_id, $jsonData);
    
    if (!$insertStmt->execute()) {
        throw new Exception("Error saving progress data: " . $insertStmt->error);
    }

    debug("Progress data initialized successfully");
    
    echo json_encode([
        'success' => true,
        'message' => 'Progress initialized',
        'debug' => $debug_log,
        'progress_data' => $progressData
    ]);

} catch (Exception $e) {
    debug("Error occurred: " . $e->getMessage());
    echo json_encode([
        'error' => 'Failed to initialize progress tables',
        'details' => $e->getMessage(),
        'debug' => $debug_log
    ]);
} finally {
    if (isset($mysqli)) {
        $mysqli->close();
        debug("Database connection closed");
    }
}
?>