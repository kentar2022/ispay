<?php
require_once 'config.php';
require_once 'jwt_helper.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
$endpoint = end($path_parts);

// Проверяем авторизацию для всех эндпоинтов
$user_id = requireAuth();

switch($endpoint) {
    case 'profile':
        if ($method === 'GET') {
            handleGetProfile($user_id);
        } elseif ($method === 'PUT') {
            handleUpdateProfile($user_id);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case 'balance':
        if ($method === 'GET') {
            handleGetBalance($user_id);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}

function handleGetProfile($user_id) {
    $db = getDBConnection();
    $stmt = $db->prepare('SELECT user_id, email, nickname, country, crystals, gold, avatar FROM users WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    echo json_encode([
        'userId' => $user['user_id'],
        'email' => $user['email'],
        'nickname' => $user['nickname'],
        'country' => $user['country'],
        'crystals' => $user['crystals'],
        'gold' => $user['gold'],
        'avatar' => $user['avatar']
    ]);
}

function handleUpdateProfile($user_id) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['nickname']) || !isset($data['country'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    $db = getDBConnection();
    $stmt = $db->prepare('UPDATE users SET nickname = ?, country = ? WHERE user_id = ?');
    $stmt->execute([$data['nickname'], $data['country'], $user_id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    // Получаем обновленные данные
    $stmt = $db->prepare('SELECT user_id, email, nickname, country, crystals, gold, avatar FROM users WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'userId' => $user['user_id'],
        'email' => $user['email'],
        'nickname' => $user['nickname'],
        'country' => $user['country'],
        'crystals' => $user['crystals'],
        'gold' => $user['gold'],
        'avatar' => $user['avatar']
    ]);
}

function handleGetBalance($user_id) {
    $db = getDBConnection();
    $stmt = $db->prepare('SELECT crystals, gold FROM users WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $balance = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$balance) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    echo json_encode([
        'crystals' => $balance['crystals'],
        'gold' => $balance['gold']
    ]);
} 