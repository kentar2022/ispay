<?php

// Включаем вывод всех ошибок
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Устанавливаем заголовок ответа как JSON
header('Content-Type: application/json');

// Подключаемся к базе данных
$mysqli = new mysqli("localhost", "kentar", "password", "ispay");

// Проверяем подключение
if ($mysqli->connect_error) {
    // Если есть ошибка подключения, завершаем скрипт и выводим сообщение об ошибке
    die("Ошибка подключения к базе данных: " . $mysqli->connect_error);
}

// Проверяем, был ли передан параметр user_email в POST-запросе
if (isset($_POST['user_email'])) {
    // Если параметр был передан, присваиваем его переменной $userEmail
    $userEmail = $_POST['user_email'];

    // Подготавливаем SQL-запрос для поиска пользователя по email
    $query = "SELECT id FROM users WHERE email = ?";

    // Подготавливаем запрос
    $stmt = $mysqli->prepare($query);

    // Проверяем успешность подготовки запроса
    if ($stmt === false) {
        // Если есть ошибка, завершаем скрипт и выводим сообщение об ошибке
        die("Ошибка подготовки запроса: " . $mysqli->error);
    }

    // Привязываем параметр к подготовленному выражению
    $stmt->bind_param("s", $userEmail);

    // Выполняем запрос
    $stmt->execute();

    // Получаем результат запроса
    $result = $stmt->get_result();

    // Проверяем наличие результатов
    if ($result->num_rows > 0) {
        // Если пользователь найден, извлекаем его идентификатор из результата запроса
        $row = $result->fetch_assoc();
        $userId = $row['id'];

        // Возвращаем идентификатор пользователя в виде JSON
        echo json_encode(array("user_id" => $userId));
    } else {
        // Если пользователь не найден, возвращаем сообщение об ошибке в виде JSON
        echo json_encode(array("error" => "Пользователь не найден"));
    }

    // Закрываем подготовленный запрос
    $stmt->close();
} else {
    // Если параметр user_email не был передан, возвращаем сообщение об ошибке в виде JSON
    echo json_encode(array("error" => "Параметр user_email отсутствует в POST-запросе"));
}

// Закрываем соединение с базой данных
$mysqli->close();

?>
