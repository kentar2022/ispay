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

    debug("user_id: " . ($user_id ?? 'null'));
    debug("language: " . ($language ?? 'null'));

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

    // Проверим существуют ли уже записи
    $checkQuery = "SELECT COUNT(*) as count FROM user_progress WHERE user_id = ?";
    $checkStmt = $mysqli->prepare($checkQuery);
    $checkStmt->bind_param("i", $user_id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $row = $result->fetch_assoc();
    debug("Existing records count: " . $row['count']);

    if ($row['count'] > 0) {
        debug("User progress already exists");
        echo json_encode([
            'success' => true,
            'message' => 'Progress already initialized',
            'debug' => $debug_log
        ]);
        exit();
    }

    $mysqli->begin_transaction();

    $themesQuery = "SELECT t.id as theme_id, t.total_topics, tp.id as topic_id, tp.total_lessons 
                    FROM themes t 
                    LEFT JOIN topics tp ON t.id = tp.theme_id 
                    ORDER BY t.id, tp.id";
    
    $result = $mysqli->query($themesQuery);
    if (!$result) {
        debug("Themes query failed: " . $mysqli->error);
        throw new Exception("Error fetching course structure: " . $mysqli->error);
    }
    
    $rowCount = $result->num_rows;
    debug("Found themes/topics: " . $rowCount);

    $userProgressStmt = $mysqli->prepare(
        "INSERT INTO user_progress 
        (user_id, theme_id, topic_id, completed_lessons, completed_topics, progress_percentage, total_score) 
        VALUES (?, ?, ?, 1, 0, 0, 0)"
    );
    
    if (!$userProgressStmt) {
        debug("Prepare statement failed: " . $mysqli->error);
        throw new Exception("Error preparing statement: " . $mysqli->error);
    }

    $processed_themes = [];
    $insertCount = 0;

    while ($row = $result->fetch_assoc()) {
        $theme_id = $row['theme_id'];
        $topic_id = $row['topic_id'];
        
        debug("Processing theme_id: $theme_id, topic_id: " . ($topic_id ?? 'null'));
        
        if (!in_array($theme_id, $processed_themes)) {
            $null_topic_id = null;
            if (!$userProgressStmt->bind_param("iii", $user_id, $theme_id, $null_topic_id)) {
                debug("Bind param failed for theme: " . $userProgressStmt->error);
                throw new Exception("Error binding theme parameters: " . $userProgressStmt->error);
            }
            
            if (!$userProgressStmt->execute()) {
                debug("Execute failed for theme: " . $userProgressStmt->error);
                throw new Exception("Error executing theme insert: " . $userProgressStmt->error);
            }
            $processed_themes[] = $theme_id;
            $insertCount++;
            debug("Theme progress inserted for theme_id: $theme_id");
        }

        if ($topic_id !== null) {
            if (!$userProgressStmt->bind_param("iii", $user_id, $theme_id, $topic_id)) {
                debug("Bind param failed for topic: " . $userProgressStmt->error);
                throw new Exception("Error binding topic parameters: " . $userProgressStmt->error);
            }
            
            if (!$userProgressStmt->execute()) {
                debug("Execute failed for topic: " . $userProgressStmt->error);
                throw new Exception("Error executing topic insert: " . $userProgressStmt->error);
            }
            $insertCount++;
            debug("Topic progress inserted for topic_id: $topic_id");
        }
    }

    debug("Total inserts performed: $insertCount");

    $mysqli->commit();
    debug("Transaction committed successfully");
    
    echo json_encode([
        'success' => true,
        'inserts_performed' => $insertCount,
        'debug' => $debug_log
    ]);

} catch (Exception $e) {
    debug("Error occurred: " . $e->getMessage());
    if (isset($mysqli)) {
        $mysqli->rollback();
        debug("Transaction rolled back");
    }
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
