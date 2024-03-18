<?php
// Подключение к базе данных (замените данными вашей базы данных)
$servername = "localhost";
$username = "kentar";
$password = "password";
$dbname = "ispay";

// Создание подключения
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка подключения
if ($conn->connect_error) {
    die("Ошибка подключения к базе данных: " . $conn->connect_error);
}

// Выполнение запроса к базе данных
$sql = "SELECT georgianWord FROM georgian ORDER BY RAND() LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Получение данных из результата запроса
    $row = $result->fetch_assoc();
    $georgianWord = $row["georgianWord"];

    // Возвращаем данные в формате JSON
    echo json_encode(['georgianWord' => $georgianWord]);
} else {
    echo json_encode(['georgianWord' => 'Нет данных']);
}

// Закрытие подключения к базе данных
$conn->close();
?>
