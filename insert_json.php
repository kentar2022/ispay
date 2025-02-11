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
    'lezgin' => 'Лезгинский',
    'chuvash' => 'Чувашский'
];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получаем данные из формы
    $selectedDatabase = $_POST['language'] ?? null;
    $topicId = isset($_POST['topic_id']) ? intval($_POST['topic_id']) : null;
    $lessonsData = isset($_POST['lessons']) ? json_decode($_POST['lessons'], true) : null;

    // Проверяем язык
    if (!$selectedDatabase || !array_key_exists($selectedDatabase, $databases)) {
        die(json_encode(['error' => 'Ошибка: неверный выбор базы данных.']));
    }

    // Проверяем обязательные поля
    if (!$topicId || !$lessonsData) {
        die(json_encode(['error' => 'Не все обязательные поля заполнены']));
    }

    // Проверяем корректность JSON данных
    if (!is_array($lessonsData)) {
        die(json_encode(['error' => 'Неверный формат данных уроков']));
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

        $messages = [];
        foreach ($lessonsData as $lesson) {
            $lessonLevel = $lesson['lesson_level'];
            $content = json_encode($lesson['content']); 

            // Проверяем, есть ли уже запись с таким lesson_level и topic_id
            $stmt = $conn->prepare("SELECT id FROM lessons WHERE lesson_level = ? AND topic_id = ?");
            $stmt->bind_param("ii", $lessonLevel, $topicId);
            $stmt->execute();
            $result = $stmt->get_result();
            $existingData = $result->fetch_assoc();

            if ($existingData) {
                // Обновляем существующую запись
                $updateStmt = $conn->prepare("UPDATE lessons SET data = ? WHERE lesson_level = ? AND topic_id = ?");
                $updateStmt->bind_param("sii", $content, $lessonLevel, $topicId);
                
                if ($updateStmt->execute()) {
                    $messages[] = "Урок $lessonLevel темы $topicId обновлен";
                } else {
                    throw new Exception("Ошибка при обновлении урока $lessonLevel: " . $updateStmt->error);
                }
                
                $updateStmt->close();
            } else {
                // Получаем максимальный ID
                $maxIdResult = $conn->query("SELECT MAX(id) as max_id FROM lessons");
                $maxId = $maxIdResult->fetch_assoc()['max_id'];
                $newId = $maxId ? $maxId + 1 : 1;

                // Создаем новую запись
                $insertStmt = $conn->prepare("INSERT INTO lessons (id, lesson_level, topic_id, data) VALUES (?, ?, ?, ?)");
                $insertStmt->bind_param("iiis", $newId, $lessonLevel, $topicId, $content);

                if ($insertStmt->execute()) {
                    $messages[] = "Урок $lessonLevel темы $topicId добавлен";
                } else {
                    throw new Exception("Ошибка при добавлении урока $lessonLevel: " . $insertStmt->error);
                }

                $insertStmt->close();
            }
            
            $stmt->close();
        }

        // Фиксируем транзакцию
        $conn->commit();
        echo json_encode([
            'success' => true, 
            'message' => implode(", ", $messages)
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['error' => $e->getMessage()]);
    }

    $conn->close();
}
?>