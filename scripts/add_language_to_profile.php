<?php
session_start();
header('Content-Type: application/json');

$debug = ["Script started"];

// Получаем данные из POST-запроса
$debug[] = "Raw input data: " . file_get_contents('php://input');
$language = isset($_POST['language']) ? $_POST['language'] : null;
$debug[] = "Decoded input: " . ($language ? $language : "null");

if (!isset($language)) {
    echo json_encode([
        'error' => 'Invalid input',
        'debug' => $debug
    ]);
    exit();
}

// Получаем ID пользователя из сессии
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (!isset($user_id)) {
    echo json_encode([
        'error' => 'User not authenticated',
        'debug' => $debug
    ]);
    exit();
}

// Подключаемся к базе данных
$mysqli = new mysqli('localhost', 'kentar', 'password', 'ispay');

if ($mysqli->connect_error) {
    echo json_encode([
        'error' => 'Database connection failed',
        'debug' => $debug
    ]);
    exit();
}

// Получаем текущий список языков
$stmt = $mysqli->prepare("SELECT languages_list FROM profileStats WHERE userId = ?");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$current_languages = explode(',', $row['languages_list']);

// Проверяем, если язык уже добавлен
if (!in_array($language, $current_languages)) {
    $current_languages[] = $language;
    $new_languages_list = implode(',', $current_languages);

    // Обновляем список языков
    $update_stmt = $mysqli->prepare("UPDATE profileStats SET languages_list = ? WHERE userId = ?");
    $update_stmt->bind_param('si', $new_languages_list, $user_id);
    if ($update_stmt->execute()) {
        echo json_encode([
            'success' => true,
            'debug' => $debug
        ]);
    } else {
        echo json_encode([
            'error' => 'Failed to update languages list',
            'debug' => $debug
        ]);
    }
} else {
    echo json_encode([
        'error' => 'Language already added',
        'debug' => $debug
    ]);
}

$mysqli->close();
?>
