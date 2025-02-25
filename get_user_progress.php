<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

function getUserProgress($userId, $language) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT progress_data FROM user_progress WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $progressData = json_decode($row['progress_data'], true);
        
        if (isset($progressData['languages'][$language])) {
            return [
                'success' => true,
                'progress' => $progressData['languages'][$language]
            ];
        }
    }
    
    return [
        'success' => true,
        'progress' => [
            'topics' => []
        ]
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['user_id'] ?? null;
    $language = $_GET['language'] ?? null;
    
    if ($userId && $language) {
        $result = getUserProgress($userId, $language);
        echo json_encode($result);
    } else {
        echo json_encode([
            'success' => false, 
            'error' => 'Missing required parameters'
        ]);
    }
}
?>