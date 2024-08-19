<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$mysqli = new mysqli("localhost", "kentar", "password", "ispay");

// Проверка соединения
if ($mysqli->connect_error) {
    die("Ошибка подключения: " . $mysqli->connect_error);
}

// Получение данных из таблицы profileStats
$userId = $_GET['userId']; // Получаем идентификатор пользователя из AJAX-запроса

$sql = "
    SELECT score, lessonsCompleted, overallRank, crystals, coins 
    FROM profileStats
    WHERE userId = ?
";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$stmt->store_result();

// Проверка наличия данных
if ($stmt->num_rows > 0) {
    // Получение данных
    $stmt->bind_result($score, $lessonsCompleted, $overallRank, $crystals, $coins);
    $stmt->fetch();
    // Формирование ответа
    $response = array(
        'score' => $score,
        'lessonsCompleted' => $lessonsCompleted,
        'overallRank' => $overallRank,
        'crystals' => $crystals,
        'coins' => $coins
    );
    echo json_encode($response);
} else {
    echo json_encode(array("error" => "Данные не найдены"));
}

// Закрытие запроса и соединения
$stmt->close();
$mysqli->close();
?>
