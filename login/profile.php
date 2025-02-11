<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();

function logDebug($message) {
    error_log(date('Y-m-d H:i:s') . " - Profile Debug: " . print_r($message, true));
}

// Проверка авторизации
if (!isset($_SESSION['user_id'])) {
    logDebug("No user_id in session");
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    require 'config_ispay.php';
    
    $user_id = $_SESSION['user_id'];
    logDebug("Requesting data for user_id: " . $user_id);
    
    // Обновленный запрос, который выбирает все нужные поля
    $stmt = $pdo_ispay->prepare("
        SELECT 
            user_id,
            email,
            nickname,
            country,
            crystals,
            gold,
            avatar,
            csrf_token
        FROM users 
        WHERE user_id = ?
    ");
    
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        logDebug("Found user data: " . print_r($user, true));
        
        // Проверяем и устанавливаем значения
        $user['nickname'] = $user['nickname'] ?: $user['email'];
        $user['country'] = $user['country'] ?: null;
        $user['crystals'] = (int)$user['crystals'];
        $user['gold'] = (int)$user['gold'];
        $user['avatar'] = $user['avatar'] ?: null;
        
        echo json_encode($user);
    } else {
        logDebug("User not found in database for ID: " . $user_id);
        http_response_code(404);
        echo json_encode([
            'error' => 'User not found',
            'user_id' => $user_id
        ]);
    }

} catch (Exception $e) {
    logDebug("Error: " . $e->getMessage());
    error_log("Profile error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}

logDebug("Script completed");
?>