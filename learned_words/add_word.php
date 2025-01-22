<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
include 'db.php'; 

// Получаем данные из POST-запроса
$user_id = $_POST['user_id'];
$word_russian = $_POST['word_russian'];
$word_chechen = $_POST['word_chechen'];
$date_learned = $_POST['date_learned'];
$repetition_count = $_POST['repetition_count'];
$last_reviewed = $_POST['last_reviewed'] ?? null; // Значение может быть NULL
$progress = $_POST['progress'];

// Подготавливаем SQL-запрос
$stmt = $mysqli->prepare('
    INSERT INTO learned_words (user_id, word_russian, word_chechen, date_learned, repetition_count, last_reviewed, progress)
    VALUES (?, ?, ?, ?, ?, ?, ?)
');

// Привязываем параметры
$stmt->bind_param(
    'isssids', // Типы параметров: i (int), s (string), d (double)
    $user_id,
    $word_russian,
    $word_chechen,
    $date_learned,
    $repetition_count,
    $last_reviewed,
    $progress
);

// Выполняем запрос
if ($stmt->execute()) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => $stmt->error]);
}

// Закрываем соединение
$stmt->close();
$mysqli->close();
?>
