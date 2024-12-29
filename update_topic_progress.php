<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$servername = "localhost";
$username = "kentar";
$password = "password";

$debug_info = array(
    'timestamp' => date('Y-m-d H:i:s'),
    'post_data' => $_POST,
    'execution_log' => array()
);

if (!isset($_POST['user_id']) || !isset($_POST['topic_id']) || !isset($_POST['language']) || !isset($_POST['new_score'])) {
    echo json_encode(array(
        "error" => "Отсутствуют необходимые данные",
        "debug" => $debug_info
    ));
    exit();
}

$userId = intval($_POST['user_id']);
$topicId = intval($_POST['topic_id']);
$language = $_POST['language'];
$newScore = intval($_POST['new_score']);

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
    echo json_encode(array(
        "error" => "Неверный язык",
        "debug" => $debug_info
    ));
    exit();
}

$conn = new mysqli($servername, $username, $password, $databaseName);
if ($conn->connect_error) {
    echo json_encode(array(
        "error" => "Connection failed: " . $conn->connect_error,
        "debug" => $debug_info
    ));
    exit();
}

try {
    // Начинаем транзакцию
    $conn->begin_transaction();

    // Получаем theme_id для этого topic_id
    $theme_sql = "SELECT theme_id FROM topics WHERE id = ?";
    $stmt = $conn->prepare($theme_sql);
    $stmt->bind_param("i", $topicId);
    $stmt->execute();
    $theme_result = $stmt->get_result();
    $theme_data = $theme_result->fetch_assoc();
    
    if (!$theme_data) {
        throw new Exception("Тема не найдена");
    }
    
    $themeId = $theme_data['theme_id'];
    $debug_info['theme_id'] = $themeId;

    // Получаем общее количество уроков в теме
    $total_sql = "SELECT COUNT(*) as total_lessons FROM lessons WHERE topic_id IN (SELECT id FROM topics WHERE theme_id = ?)";
    $stmt = $conn->prepare($total_sql);
    $stmt->bind_param("i", $themeId);
    $stmt->execute();
    $total_result = $stmt->get_result();
    $total_data = $total_result->fetch_assoc();
    $total_lessons = $total_data['total_lessons'];
    $debug_info['total_lessons_in_theme'] = $total_lessons;

    // Получаем количество пройденных уроков пользователем в этой теме
    $completed_sql = "SELECT SUM(completed_lessons) as completed FROM user_progress 
                     WHERE user_id = ? AND topic_id IN (SELECT id FROM topics WHERE theme_id = ?)";
    $stmt = $conn->prepare($completed_sql);
    $stmt->bind_param("ii", $userId, $themeId);
    $stmt->execute();
    $completed_result = $stmt->get_result();
    $completed_data = $completed_result->fetch_assoc();
    $completed_lessons = $completed_data['completed'] ?? 0;
    $debug_info['completed_lessons_before'] = $completed_lessons;

    // Вычисляем процент прогресса
    $progress_percentage = ($completed_lessons + 1) * 100 / $total_lessons;
    $debug_info['progress_percentage'] = $progress_percentage;

    // Обновляем прогресс, очки и процент прохождения
    $update_sql = "UPDATE user_progress 
                   SET completed_lessons = completed_lessons + 1,
                       total_score = total_score + ?,
                       progress_percentage = ?
                   WHERE user_id = ? AND topic_id = ?";
    
    $stmt = $conn->prepare($update_sql);
    $stmt->bind_param("idii", $newScore, $progress_percentage, $userId, $topicId);

    if ($stmt->execute()) {
        $affected_rows = $stmt->affected_rows;
        $debug_info['affected_rows'] = $affected_rows;
        
        if ($affected_rows > 0) {
            // Проверяем обновленные значения
            $check_sql = "SELECT completed_lessons, total_score, progress_percentage 
                         FROM user_progress 
                         WHERE user_id = ? AND topic_id = ?";
            $stmt = $conn->prepare($check_sql);
            $stmt->bind_param("ii", $userId, $topicId);
            $stmt->execute();
            $new_data = $stmt->get_result()->fetch_assoc();
            $debug_info['new_data'] = $new_data;
            
            // Фиксируем транзакцию
            $conn->commit();
            
            echo json_encode(array(
                "success" => "Прогресс обновлен",
                "progress_percentage" => $progress_percentage,
                "affected_rows" => $affected_rows,
                "debug" => $debug_info
            ));
        } else {
            // Откатываем транзакцию
            $conn->rollback();
            
            echo json_encode(array(
                "warning" => "Запись не найдена или уже обновлена",
                "debug" => $debug_info
            ));
        }
    } else {
        // Откатываем транзакцию
        $conn->rollback();
        
        echo json_encode(array(
            "error" => "Ошибка при обновлении: " . $stmt->error,
            "debug" => $debug_info
        ));
    }
} catch (Exception $e) {
    // В случае ошибки откатываем транзакцию
    $conn->rollback();
    
    echo json_encode(array(
        "error" => "Ошибка: " . $e->getMessage(),
        "debug" => $debug_info
    ));
}

$conn->close();
?>