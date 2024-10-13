<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Настройки подключения к базе данных
$servername = "localhost";
$username = "kentar";
$password = "password";

// Список баз данных для выбора
$databases = [
    'bashkort' => 'Башкирский',
    'chechen' => 'Чеченский',
    'ingush' => 'Ингушский',
    'adyge' => 'Адыгейский',
    'udmurt' => 'Удмуртский',
    'tatar' => 'Татарский',
    'chuvash' => 'Чувашский'
];

// Проверка, отправлены ли данные через форму
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получаем данные из формы
    $selectedDatabase = $_POST['language'];
    $lessonLevel = intval($_POST['lesson_level']);
    $jsonData = $_POST['jsonData'];

    // Проверяем, выбрана ли корректная база данных
    if (!array_key_exists($selectedDatabase, $databases)) {
        die("Ошибка: неверный выбор базы данных.");
    }

    // Создание соединения с выбранной базой данных
    $conn = new mysqli($servername, $username, $password, $selectedDatabase);

    // Проверка соединения
    if ($conn->connect_error) {
        die("Ошибка подключения: " . $conn->connect_error);
    }

    // Декодируем JSON из формы в массив
    $newDataArray = json_decode($jsonData, true);

    // Проверка правильности декодирования
    if (json_last_error() !== JSON_ERROR_NONE) {
        die("Ошибка в JSON формате: " . json_last_error_msg());
    }

    // Проверяем, есть ли уже запись с таким lesson_level
    $stmt = $conn->prepare("SELECT data FROM lessons WHERE lesson_level = ?");
    $stmt->bind_param("i", $lessonLevel);
    $stmt->execute();
    $result = $stmt->get_result();
    $existingData = $result->fetch_assoc();

    if ($existingData) {
        // Если запись существует, объединяем новые данные с существующими
        $existingDataArray = json_decode($existingData['data'], true);

        // Проверка правильности декодирования существующих данных
        if (json_last_error() !== JSON_ERROR_NONE) {
            die("Ошибка в JSON формате существующих данных: " . json_last_error_msg());
        }

        // Объединяем старые и новые данные
        $mergedDataArray = array_merge($existingDataArray, $newDataArray);
        $mergedDataJson = json_encode($mergedDataArray, JSON_UNESCAPED_UNICODE);

        // Обновляем существующую запись
        $updateStmt = $conn->prepare("UPDATE lessons SET data = ? WHERE lesson_level = ?");
        $updateStmt->bind_param("si", $mergedDataJson, $lessonLevel);

        if ($updateStmt->execute()) {
            echo "Данные успешно обновлены для урока $lessonLevel.<br>";
        } else {
            echo "Ошибка при обновлении данных: " . $updateStmt->error . "<br>";
        }

        $updateStmt->close();
    } else {
        // Если запись не существует, создаем новую строку
        $newDataJson = json_encode($newDataArray, JSON_UNESCAPED_UNICODE);

        $insertStmt = $conn->prepare("INSERT INTO lessons (lesson_level, data) VALUES (?, ?)");
        $insertStmt->bind_param("is", $lessonLevel, $newDataJson);

        // Выполнение запроса на вставку новых данных
        if ($insertStmt->execute()) {
            echo "Новые данные успешно добавлены для урока $lessonLevel.<br>";
        } else {
            echo "Ошибка при добавлении новых данных: " . $insertStmt->error . "<br>";
        }

        // Закрытие подготовленного запроса
        $insertStmt->close();
    }

    // Закрытие соединения с базой данных
    $stmt->close();
    $conn->close();
}
?>

