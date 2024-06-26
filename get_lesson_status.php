<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$language = $_POST['language'] ?? null; // Получаем значение языка из POST-запроса
if (!$language) {
    echo json_encode(['error' => 'Language not specified']);
    exit;
}

$databaseName = match (strtolower($language)) {
    'chechen' => 'chechen',
    'ingush' => 'ingush',
    'adyge' => 'adyge',
    'udmurt' => 'udmurt',
    'tatar' => 'tatar',
    'chuvash' => 'chuvash',
    default => null,
};

if (!$databaseName) {
    echo json_encode(['error' => 'Invalid language specified']);
    exit;
}

$mysqli = new mysqli("localhost", "kentar", "password", $databaseName);

if ($mysqli->connect_error) {
    die(json_encode(['error' => 'Ошибка подключения к базе данных: ' . $mysqli->connect_error]));
}

$sql = "SELECT * FROM lesson_status";
$result = $mysqli->query($sql);

if ($result->num_rows > 0) {
    $lessonData = array();
    while($row = $result->fetch_assoc()) {
        $lessonData[$row["lesson_id"]] = $row["status"];
    }
    echo json_encode($lessonData);
} else {
    echo json_encode(['error' => 'No results found']);
}

$mysqli->close();
?>
