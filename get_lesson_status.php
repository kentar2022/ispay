<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$mysqli = new mysqli("localhost", "kentar", "password", "chechen");


if ($mysqli->connect_error) {
    die("Ошибка подключения к базе данных: " . $mysqli->connect_error);
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
    echo "0 результатов";
}


$mysqli->close();
?>
