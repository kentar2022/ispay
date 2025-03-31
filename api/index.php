<?php
require_once 'config.php';
require_once 'jwt_helper.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
$api_version = $path_parts[1] ?? '';
$resource = $path_parts[2] ?? '';

if ($api_version !== 'api') {
    http_response_code(404);
    echo json_encode(['error' => 'Invalid API version']);
    exit;
}

switch($resource) {
    case 'auth':
        require_once 'auth.php';
        break;
        
    case 'user':
        require_once 'user.php';
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Resource not found']);
        break;
} 