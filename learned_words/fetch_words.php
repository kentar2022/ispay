<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Получаем параметры
$language = $_GET['language'];
$user_id = $_GET['user_id'];

if (!$language || !$user_id) {
    echo json_encode(['error' => 'Missing required parameters']);
    exit;
}

$host = 'localhost';       
$user = 'kentar';           
$password = 'password';            
$dbname = $language;

$mysqli = new mysqli($host, $user, $password, $dbname);

if ($mysqli->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}

// Используем подготовленный запрос
$stmt = $mysqli->prepare("
    SELECT word_russian, word_foreign, date_learned, repetition_count, progress 
    FROM learned_words 
    WHERE user_id = ?
    ORDER BY date_learned DESC
");

if (!$stmt) {
    echo json_encode(['error' => 'Query preparation failed: ' . $mysqli->error]);
    exit;
}

$stmt->bind_param("i", $user_id);

if (!$stmt->execute()) {
    echo json_encode(['error' => 'Query execution failed: ' . $stmt->error]);
    exit;
}

$result = $stmt->get_result();

// Формируем массив
$words = [];
while ($row = $result->fetch_assoc()) {
    $words[] = $row;
}

// Возвращаем JSON
echo json_encode($words);

$stmt->close();
$mysqli->close();
?>