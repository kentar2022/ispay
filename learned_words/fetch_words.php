<?php
error_reporting(0);
header('Access-Control-Allow-Origin: *');


include 'db.php'; 

// Получение данных о выученных словах
$result = $mysqli->query('SELECT word_russian, word_chechen, date_learned, repetition_count, progress FROM learned_words');

// Формируем массив
$words = [];
while ($row = $result->fetch_assoc()) {
    $words[] = $row;
}

// Возвращаем JSON
header('Content-Type: application/json');
echo json_encode($words);
?>
