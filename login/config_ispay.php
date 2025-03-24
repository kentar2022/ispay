<?php
// Отключаем вывод ошибок в продакшене
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

// Настройки безопасности сессии
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_lifetime', 0);

// Настройки безопасности
ini_set('session.gc_maxlifetime', 3600); // 1 час
ini_set('session.cookie_path', '/');

// Подключение к базе данных
try {
    $pdo_ispay = new PDO(
        "mysql:host=localhost;dbname=your_database;charset=utf8mb4",
        "your_username",
        "your_password",
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    die("Connection failed");
}

// Функция для безопасного логирования
function secure_log($message, $type = 'INFO') {
    $log_file = __DIR__ . '/logs/security.log';
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $log_message = "[$timestamp] [$type] [$ip] $message\n";
    
    if (!file_exists(dirname($log_file))) {
        mkdir(dirname($log_file), 0755, true);
    }
    
    error_log($log_message, 3, $log_file);
}

// Функция для очистки пользовательского ввода
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Функция для проверки CSRF токена
function verify_csrf_token() {
    if (!isset($_SESSION['csrf_token']) || !isset($_POST['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $_POST['csrf_token']);
}

// Функция для генерации CSRF токена
function generate_csrf_token() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}
?>
