<?php
header('Content-Type: application/json');

function connectToDatabase($language) {
    $databaseName = match (strtolower($language)) {
        'chechen' => 'chechen',
        'ingush' => 'ingush',
        'adyge' => 'adyge',
        'udmurt' => 'udmurt',
        'tatar' => 'tatar',
        'chuvash' => 'chuvash',
        'lezgin' => 'lezgin',
        'moksha' => 'moksha',
        'bashkort' => 'bashkort',
        default => null,
    };

    if (!$databaseName) {
        throw new Exception("Unsupported language: $language");
    }

    $conn = new mysqli('localhost', 'kentar', 'password', $databaseName);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    return $conn;
}

function updateUserProgress($userId, $language, $topicId, $newScore) {
    try {
        $conn = connectToDatabase($language);
        
        // Получаем текущий прогресс пользователя
        $stmt = $conn->prepare("SELECT progress_data FROM user_progress WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $progressData = json_decode($row['progress_data'], true) ?: [];
        } else {
            $progressData = ['languages' => []];
        }
        
        // Обновляем прогресс
        if (!isset($progressData['languages'][$language])) {
            $progressData['languages'][$language] = ['topics' => []];
        }
        
        if (!isset($progressData['languages'][$language]['topics'][$topicId])) {
            $progressData['languages'][$language]['topics'][$topicId] = [
                'completed_lessons' => 0,
                'total_score' => 0
            ];
        }
        
        $currentTopic = &$progressData['languages'][$language]['topics'][$topicId];
        $currentTopic['completed_lessons'] = max($currentTopic['completed_lessons'] ?? 0, (int)$_POST['completed_lessons']);
        $currentTopic['total_score'] += $newScore;
        
        // Сохраняем обновленный прогресс
        $jsonData = json_encode($progressData);
        
        if ($result->num_rows > 0) {
            $stmt = $conn->prepare("UPDATE user_progress SET progress_data = ? WHERE user_id = ?");
            $stmt->bind_param("si", $jsonData, $userId);
        } else {
            $stmt = $conn->prepare("INSERT INTO user_progress (user_id, progress_data) VALUES (?, ?)");
            $stmt->bind_param("is", $userId, $jsonData);
        }
        
        $success = $stmt->execute();
        $conn->close();
        
        if ($success) {
            return [
                'success' => true,
                'completed_lessons' => $currentTopic['completed_lessons'],
                'total_score' => $currentTopic['total_score']
            ];
        } else {
            throw new Exception("Failed to update progress");
        }
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage(),
            'debug' => [
                'language' => $language,
                'user_id' => $userId,
                'topic_id' => $topicId,
                'new_score' => $newScore
            ]
        ];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_POST['user_id'] ?? null;
    $language = $_POST['language'] ?? null;
    $topicId = $_POST['topic_id'] ?? null;
    $newScore = $_POST['new_score'] ?? 0;
    
    if ($userId && $language && $topicId) {
        $result = updateUserProgress($userId, $language, $topicId, $newScore);
        echo json_encode($result);
    } else {
        echo json_encode([
            'success' => false, 
            'error' => 'Missing required parameters',
            'debug' => [
                'received_user_id' => $userId,
                'received_language' => $language,
                'received_topic_id' => $topicId,
                'received_score' => $newScore
            ]
        ]);
    }
}
?>