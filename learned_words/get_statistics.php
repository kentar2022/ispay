<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Получаем данные запроса
    $postData = json_decode(file_get_contents('php://input'), true);
    $user_id = $postData['user_id'] ?? null;
    $language = $postData['language'] ?? '';

    // Логируем входные параметры
    error_log(sprintf("Input parameters - user_id: %s, language: %s", 
        var_export($user_id, true), 
        var_export($language, true)
    ));

    if (!$user_id || !$language) {
        throw new Exception("Missing required parameters. User ID: $user_id, Language: $language");
    }

    $host = 'localhost';
    $user = 'kentar';
    $password = 'password';
    $dbname = $language;

    $mysqli = new mysqli($host, $user, $password, $dbname);

    if ($mysqli->connect_error) {
        throw new Exception('Database connection failed: ' . $mysqli->connect_error);
    }

    // Проверяем наличие данных напрямую
    $check = $mysqli->query("SELECT * FROM learned_words WHERE user_id = $user_id LIMIT 5");
    if (!$check) {
        error_log("Query error: " . $mysqli->error);
        throw new Exception("Error checking data: " . $mysqli->error);
    }

    $sample_data = [];
    while ($row = $check->fetch_assoc()) {
        $sample_data[] = $row;
    }
    error_log("Sample data: " . json_encode($sample_data));

    if (empty($sample_data)) {
        echo json_encode([
            'error' => 'No data found',
            'debug_info' => [
                'user_id' => $user_id,
                'language' => $language,
                'table' => 'learned_words'
            ]
        ]);
        exit;
    }

    // Прогресс по дням
    $progressQuery = "
        SELECT DATE(date_learned) as date, AVG(progress) as avg_progress 
        FROM learned_words 
        WHERE user_id = ?
        GROUP BY DATE(date_learned)
        ORDER BY date DESC
    ";
    error_log("Progress query: " . $progressQuery);
    
    $progress = $mysqli->prepare($progressQuery);
    if (!$progress) {
        throw new Exception('Progress query prepare failed: ' . $mysqli->error);
    }
    
    $progress->bind_param("i", $user_id);
    $progress->execute();
    $result = $progress->get_result();

    $progressData = ['dates' => [], 'values' => []];
    while ($row = $result->fetch_assoc()) {
        $progressData['dates'][] = $row['date'];
        $progressData['values'][] = round($row['avg_progress'] * 100, 1);
    }
    error_log("Progress data: " . json_encode($progressData));

    // Распределение
    $distributionQuery = "
        SELECT 
            CASE 
                WHEN progress < 0.3 THEN 'Начальный'
                WHEN progress < 0.6 THEN 'Средний'
                WHEN progress < 0.9 THEN 'Хороший'
                ELSE 'Отличный'
            END as level,
            COUNT(*) as count
        FROM learned_words 
        WHERE user_id = ?
        GROUP BY level
    ";
    error_log("Distribution query: " . $distributionQuery);

    $distribution = $mysqli->prepare($distributionQuery);
    if (!$distribution) {
        throw new Exception('Distribution query prepare failed: ' . $mysqli->error);
    }

    $distribution->bind_param("i", $user_id);
    $distribution->execute();
    $result = $distribution->get_result();

    $distributionData = [];
    while ($row = $result->fetch_assoc()) {
        $distributionData[$row['level']] = (int)$row['count'];
    }
    error_log("Distribution data: " . json_encode($distributionData));

    // Повторения
    $repetitionsQuery = "
        SELECT word_russian, word_foreign, repetition_count 
        FROM learned_words 
        WHERE user_id = ? 
        ORDER BY repetition_count DESC 
        LIMIT 10
    ";
    error_log("Repetitions query: " . $repetitionsQuery);

    $repetitions = $mysqli->prepare($repetitionsQuery);
    if (!$repetitions) {
        throw new Exception('Repetitions query prepare failed: ' . $mysqli->error);
    }

    $repetitions->bind_param("i", $user_id);
    $repetitions->execute();
    $result = $repetitions->get_result();

    $repetitionsData = ['words' => [], 'counts' => []];
    while ($row = $result->fetch_assoc()) {
        $repetitionsData['words'][] = $row['word_russian'] . ' - ' . $row['word_foreign'];
        $repetitionsData['counts'][] = (int)$row['repetition_count'];
    }
    error_log("Repetitions data: " . json_encode($repetitionsData));

    // Формируем итоговый ответ
    $response = [
        'progress' => $progressData,
        'distribution' => $distributionData,
        'repetitions' => $repetitionsData
    ];

    error_log("Final response: " . json_encode($response));
    echo json_encode($response);

} catch (Exception $e) {
    error_log("Error occurred: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'user_id' => $user_id ?? 'not set',
        'language' => $language ?? 'not set'
    ]);
}

if (isset($mysqli)) {
    $mysqli->close();
}
?>