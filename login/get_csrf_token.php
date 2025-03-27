<?php
require_once 'config_ispay.php';

// Устанавливаем заголовки безопасности
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

session_start();

if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = generate_csrf_token();
    secure_log("CSRF token generated for session", "INFO");
}

// Логируем только факт запроса токена
secure_log("CSRF token requested", "INFO");

// Отправляем токен в заголовке и в теле ответа
header('X-CSRF-Token: ' . $_SESSION['csrf_token']);
echo json_encode(['success' => true]);
?> 