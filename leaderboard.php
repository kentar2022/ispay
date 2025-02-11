<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Параметры подключения к БД
$host = 'localhost';
$dbname = 'ispay';
$username = 'kentar';
$password = 'password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Запрос для получения данных пользователей
    $query = "
        SELECT 
            p.userId,
            p.score,
            p.lessonsCompleted,
            p.languages_list,
            u.nickname,
            u.avatar
        FROM profileStats p
        LEFT JOIN users u ON p.userId = u.user_id
        WHERE p.score > 0
        ORDER BY p.score DESC
        LIMIT 100
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $users = [];
    $rank = 1;
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Подсчитываем количество изучаемых языков
        $languagesCount = !empty($row['languages_list']) 
            ? count(array_filter(explode(',', $row['languages_list'])))
            : 0;
            
        $users[] = [
            'rank' => $rank,
            'userId' => $row['userId'],
            'nickname' => $row['nickname'] ?: ('Пользователь #' . $row['userId']),
            'avatar' => $row['avatar'] ?: '/default-avatar.png',
            'score' => (int)$row['score'],
            'lessonsCompleted' => (int)$row['lessonsCompleted'],
            'languagesCount' => $languagesCount
        ];
        
        $rank++;
    }
    
    // Формируем ответ
    $response = [
        'success' => true,
        'users' => $users
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    // В случае ошибки отправляем соответствующий ответ
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
}
?>