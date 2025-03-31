<?php
require_once 'config.php';

function generateJWT($user_id) {
    $issued_at = time();
    $expire = $issued_at + JWT_EXPIRE;
    
    $payload = array(
        "iat" => $issued_at,
        "exp" => $expire,
        "user_id" => $user_id
    );
    
    return jwt_encode($payload, JWT_SECRET);
}

function validateJWT($token) {
    try {
        $decoded = jwt_decode($token, JWT_SECRET);
        return $decoded->user_id;
    } catch(Exception $e) {
        return false;
    }
}

function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function requireAuth() {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        exit;
    }
    
    $user_id = validateJWT($token);
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    return $user_id;
} 