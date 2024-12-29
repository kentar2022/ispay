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
    $selectedDatabase = $_POST['language'] ?? null;
    $lessonLevel = isset($_POST['lesson_level']) ? intval($_POST['lesson_level']) : null;
    $topicId = isset($_POST['topic_id']) ? intval($_POST['topic_id']) : null;
    $jsonData = $_POST['jsonData'] ?? null;
    $summary = $_POST['summary'] ?? null;

    // Проверяем язык
    if (!$selectedDatabase || !array_key_exists($selectedDatabase, $databases)) {
        die(json_encode(['error' => 'Ошибка: неверный выбор базы данных.']));
    }

    // Проверяем обязательные поля
    if (!$lessonLevel || !$topicId || !$jsonData) {
        die(json_encode(['error' => 'Не все обязательные поля заполнены']));
    }

    // Проверяем и декодируем JSON данные
    $decodedData = json_decode($jsonData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        die(json_encode(['error' => 'Неверный формат JSON данных: ' . json_last_error_msg()]));
    }

    // Создание соединения с выбранной базой данных
    $conn = new mysqli($servername, $username, $password, $selectedDatabase);

    // Проверка соединения
    if ($conn->connect_error) {
        die(json_encode(['error' => "Ошибка подключения: " . $conn->connect_error]));
    }

    try {
        // Начинаем транзакцию
        $conn->begin_transaction();

        // Проверяем, есть ли уже запись с таким lesson_level и topic_id
        $stmt = $conn->prepare("SELECT data FROM lessons WHERE lesson_level = ? AND topic_id = ?");
        $stmt->bind_param("ii", $lessonLevel, $topicId);
        $stmt->execute();
        $result = $stmt->get_result();
        $existingData = $result->fetch_assoc();

        if ($existingData) {
            // Обновляем существующую запись
            $updateStmt = $conn->prepare("UPDATE lessons SET data = ?, summary = ? WHERE lesson_level = ? AND topic_id = ?");
            $updateStmt->bind_param("ssii", $jsonData, $summary, $lessonLevel, $topicId);
            
            if ($updateStmt->execute()) {
                $message = "Данные успешно обновлены для урока $lessonLevel темы $topicId";
            } else {
                throw new Exception("Ошибка при обновлении данных: " . $updateStmt->error);
            }
            
            $updateStmt->close();
        } else {
            // Создаем новую запись
            $insertStmt = $conn->prepare("INSERT INTO lessons (lesson_level, topic_id, data, summary) VALUES (?, ?, ?, ?)");
            $insertStmt->bind_param("iiss", $lessonLevel, $topicId, $jsonData, $summary);

            if ($insertStmt->execute()) {
                $message = "Новые данные успешно добавлены для урока $lessonLevel темы $topicId";
            } else {
                throw new Exception("Ошибка при добавлении новых данных: " . $insertStmt->error);
            }

            $insertStmt->close();
        }
        
        $stmt->close();

        // Фиксируем транзакцию
        $conn->commit();
        echo json_encode(['success' => true, 'message' => $message]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}
?>