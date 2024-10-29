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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получаем данные из формы
    $selectedDatabase = $_POST['language'];
    $lessonLevel = intval($_POST['lesson_level']);
    $topicId = intval($_POST['topic_id']);
    $jsonData = $_POST['jsonData'];
    $summary = $_POST['summary'] ?? null;

    // Проверяем обязательные поля
    if (!$selectedDatabase || !$lessonLevel || !$topicId || !$jsonData) {
        die(json_encode([
            'error' => 'Не все обязательные поля заполнены',
            'fields' => [
                'language' => !$selectedDatabase,
                'lesson_level' => !$lessonLevel,
                'topic_id' => !$topicId,
                'jsonData' => !$jsonData
            ]
        ]));
    }

    // Проверяем, выбрана ли корректная база данных
    if (!array_key_exists($selectedDatabase, $databases)) {
        die(json_encode(['error' => 'Ошибка: неверный выбор базы данных.']));
    }

    // Создание соединения с выбранной базой данных
    $conn = new mysqli($servername, $username, $password, $selectedDatabase);

    // Проверка соединения
    if ($conn->connect_error) {
        die(json_encode(['error' => "Ошибка подключения: " . $conn->connect_error]));
    }

    // Декодируем JSON из формы в массив
    $newDataArray = json_decode($jsonData, true);

    // Проверка правильности декодирования
    if (json_last_error() !== JSON_ERROR_NONE) {
        die(json_encode(['error' => "Ошибка в JSON формате: " . json_last_error_msg()]));
    }

    // Проверяем, есть ли уже запись с таким lesson_level и topic_id
    $stmt = $conn->prepare("SELECT data FROM lessons WHERE lesson_level = ? AND topic_id = ?");
    $stmt->bind_param("ii", $lessonLevel, $topicId);
    $stmt->execute();
    $result = $stmt->get_result();
    $existingData = $result->fetch_assoc();

    if ($existingData) {
        // Если запись существует, объединяем новые данные с существующими
        $existingDataArray = json_decode($existingData['data'], true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            die(json_encode(['error' => "Ошибка в JSON формате существующих данных: " . json_last_error_msg()]));
        }

        // Объединяем старые и новые данные
        $mergedDataArray = array_merge($existingDataArray, $newDataArray);
        $mergedDataJson = json_encode($mergedDataArray, JSON_UNESCAPED_UNICODE);

        // Обновляем существующую запись
        $updateStmt = $conn->prepare("UPDATE lessons SET data = ?, summary = ? WHERE lesson_level = ? AND topic_id = ?");
        $updateStmt->bind_param("ssii", $mergedDataJson, $summary, $lessonLevel, $topicId);

        if ($updateStmt->execute()) {
            echo json_encode(['success' => "Данные успешно обновлены для урока $lessonLevel темы $topicId"]);
        } else {
            echo json_encode(['error' => "Ошибка при обновлении данных: " . $updateStmt->error]);
        }

        $updateStmt->close();
    } else {
        // Если запись не существует, создаем новую строку
        $newDataJson = json_encode($newDataArray, JSON_UNESCAPED_UNICODE);

        $insertStmt = $conn->prepare("INSERT INTO lessons (lesson_level, topic_id, data, summary) VALUES (?, ?, ?, ?)");
        $insertStmt->bind_param("iiss", $lessonLevel, $topicId, $newDataJson, $summary);

        if ($insertStmt->execute()) {
            echo json_encode(['success' => "Новые данные успешно добавлены для урока $lessonLevel темы $topicId"]);
        } else {
            echo json_encode(['error' => "Ошибка при добавлении новых данных: " . $insertStmt->error]);
        }

        $insertStmt->close();
    }

    $stmt->close();
    $conn->close();
}
?>