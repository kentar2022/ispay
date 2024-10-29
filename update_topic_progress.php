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

// Проверяем наличие необходимых данных в $_POST
if (!isset($_POST['user_id']) || !isset($_POST['topic_id'])) {
    $debug_info['execution_log'][] = "Ошибка: отсутствуют необходимые данные";
    echo json_encode(array(
        "error" => "Отсутствуют необходимые данные",
        "debug" => $debug_info
    ));
    exit();
}

$userId = intval($_POST['user_id']);
$topicId = intval($_POST['topic_id']);

$debug_info['parsed_data'] = array(
    'user_id' => $userId,
    'topic_id' => $topicId
);

// Подключаемся к базе данных
$conn = new mysqli($servername, $username, $password, "chechen");
if ($conn->connect_error) {
    $debug_info['execution_log'][] = "Ошибка подключения к БД: " . $conn->connect_error;
    echo json_encode(array(
        "error" => "Connection failed: " . $conn->connect_error,
        "debug" => $debug_info
    ));
    exit();
}

// Сначала проверим текущее значение
$check_sql = "SELECT completed_lessons FROM user_progress WHERE user_id = 1 AND topic_id = 1 AND theme_id = 1";
$debug_info['check_sql'] = $check_sql;

$result = $conn->query($check_sql);
if ($result) {
    $current_data = $result->fetch_assoc();
    $debug_info['current_data'] = $current_data;
}

// Выполняем UPDATE запрос
$sql = "UPDATE user_progress SET completed_lessons = completed_lessons + 1 WHERE user_id = 1 AND topic_id = 1 AND theme_id = 1";
$debug_info['update_sql'] = $sql;

if ($conn->query($sql) === TRUE) {
    $affected_rows = $conn->affected_rows;
    $debug_info['affected_rows'] = $affected_rows;
    
    if ($affected_rows > 0) {
        // Проверяем новое значение
        $result = $conn->query($check_sql);
        if ($result) {
            $new_data = $result->fetch_assoc();
            $debug_info['new_data'] = $new_data;
        }
        
        $response = array(
            "success" => "Прогресс обновлен",
            "affected_rows" => $affected_rows,
            "debug" => $debug_info
        );
    } else {
        $response = array(
            "warning" => "Запрос выполнен, но строки не обновлены",
            "debug" => $debug_info
        );
    }
} else {
    $response = array(
        "error" => "Ошибка при обновлении: " . $conn->error,
        "debug" => $debug_info
    );
}

echo json_encode($response);
$conn->close();
?>