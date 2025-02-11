<?php
session_start();
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$user_id = $input['user_id'];
$language = $input['language'];

if (!isset($user_id) || !isset($language)) {
    echo json_encode(['error' => 'Invalid input']);
    exit();
}

// Подключаемся к базе данных
$mysqli = new mysqli('localhost', 'kentar', 'password', 'ispay');

if ($mysqli->connect_error) {
    echo json_encode(['error' => 'Database connection failed']);
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
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Failed to update languages list']);
    }
} else {
    echo json_encode(['error' => 'Language already added']);
}

$mysqli->close();
?>
