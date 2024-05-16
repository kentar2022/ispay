<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$servername = "localhost";
$username = "kentar"; 
$password = "password"; 
$dbname = "chechen";

// Подключение к базе данных
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка соединения
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL запрос для получения всех данных из таблицы user_levels
$sql = "SELECT * FROM user_levels";
$result = $conn->query($sql);

// Проверка наличия данных
if ($result->num_rows > 0) {
    // Преобразование результата в ассоциативный массив
    $data = array();
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    // Вывод данных в формате JSON
    echo json_encode($data);
} else {
    echo json_encode([]); // Возвращаем пустой массив, если данных нет
}

// Закрытие соединения с базой данных
$conn->close();
?>
