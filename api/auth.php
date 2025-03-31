<?php
require_once 'config.php';
require_once 'jwt_helper.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
$endpoint = end($path_parts);

switch($endpoint) {
    case 'login':
        if ($method === 'POST') {
            handleLogin();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case 'register':
        if ($method === 'POST') {
            handleRegister();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case 'logout':
        if ($method === 'POST') {
            handleLogout();
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

function handleLogin() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    $db = getDBConnection();
    $stmt = $db->prepare('SELECT user_id, password, email, nickname, country, crystals, gold, avatar FROM users WHERE email = ?');
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }
    
    $token = generateJWT($user['user_id']);
    
    echo json_encode([
        'token' => $token,
        'user' => [
            'userId' => $user['user_id'],
            'email' => $user['email'],
            'nickname' => $user['nickname'],
            'country' => $user['country'],
            'crystals' => $user['crystals'],
            'gold' => $user['gold'],
            'avatar' => $user['avatar']
        ]
    ]);
}

function handleRegister() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password']) || !isset($data['nickname']) || !isset($data['country'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    $db = getDBConnection();
    
    // Проверяем, существует ли пользователь
    $stmt = $db->prepare('SELECT user_id FROM users WHERE email = ?');
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already exists']);
        return;
    }
    
    // Создаем нового пользователя
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
    $stmt = $db->prepare('INSERT INTO users (email, password, nickname, country) VALUES (?, ?, ?, ?)');
    $stmt->execute([$data['email'], $hashed_password, $data['nickname'], $data['country']]);
    
    $user_id = $db->lastInsertId();
    $token = generateJWT($user_id);
    
    echo json_encode([
        'token' => $token,
        'user' => [
            'userId' => $user_id,
            'email' => $data['email'],
            'nickname' => $data['nickname'],
            'country' => $data['country'],
            'crystals' => 0,
            'gold' => 0,
            'avatar' => null
        ]
    ]);
}

function handleLogout() {
    // В случае с JWT, клиентская сторона просто удаляет токен
    echo json_encode(['message' => 'Successfully logged out']);
} 