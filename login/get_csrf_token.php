<?php
require_once 'config_ispay.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = generate_csrf_token();
}

echo json_encode(['token' => $_SESSION['csrf_token']]);
?> 