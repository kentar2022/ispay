<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Подключение к базе данных
$connection = new mysqli("localhost", "kentar", "password", "ispay");

if ($connection->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $connection->connect_error]));
}

$response = []; // Массив для сбора данных ответа

$response['debug'][] = 'Connected to database'; // Отладочное сообщение

// Получаем user_id через GET-запрос
if (!isset($_GET['user_id'])) {
    $response['error'] = 'User ID not provided';
    echo json_encode($response);
    exit();
}

$user_id = $_GET['user_id'];  // Получаем ID пользователя из GET-запроса
$response['debug'][] = 'User ID received: ' . $user_id; // Отладочное сообщение

// Используем правильное имя поля userId
$query = "SELECT languages_list FROM profileStats WHERE userId = ?";
$stmt = $connection->prepare($query);
if (!$stmt) {
    $response['error'] = 'Prepare failed: ' . $connection->error;
    echo json_encode($response);
    exit();
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $languages_list = $row['languages_list'];
    $response['debug'][] = 'Languages list received: ' . $languages_list; 
    
    
    $languages_array = array_map('trim', explode(',', $languages_list));
    
    $response['languages'] = $languages_array;  
} else {
    $response['debug'][] = 'No data found for user ID: ' . $user_id;  
    $response['languages'] = []; 
}

$stmt->close();
$connection->close();

// Отправляем весь ответ как один JSON-объект
echo json_encode($response);
?>
