<?php
// init.php - новый файл инициализации
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Настройка сессии
function initSession() {
    if (session_status() === PHP_SESSION_NONE) {
        // Устанавливаем время жизни сессии (30 дней)
        ini_set('session.gc_maxlifetime', 30 * 24 * 60 * 60);
        session_set_cookie_params([
            'path' => '/',
            'domain' => '',
            'secure' => false, // Измените на true если используете HTTPS
            'httponly' => true,
            'samesite' => 'Strict',
            'lifetime' => 30 * 24 * 60 * 60 // 30 дней
        ]);
        session_start();
        // Обновляем время последней активности
        $_SESSION['last_activity'] = time();
    }
}

// Инициализация PDO подключений
class DatabaseConnections {
    private static $connections = [];
    private static $config = [
        'host' => 'localhost',
        'user' => 'kentar',
        'pass' => 'password',
        'charset' => 'utf8mb4',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    ];

    public static function get($database) {
        if (!isset(self::$connections[$database])) {
            $config = self::$config;
            $dsn = "mysql:host={$config['host']};dbname={$database};charset={$config['charset']}";
            
            try {
                self::$connections[$database] = new PDO(
                    $dsn, 
                    $config['user'], 
                    $config['pass'], 
                    $config['options']
                );
            } catch (PDOException $e) {
                error_log("Connection failed to database {$database}: " . $e->getMessage());
                throw new PDOException("Connection failed to database {$database}", (int)$e->getCode());
            }
        }
        return self::$connections[$database];
    }
}

// Инициализация сессии
initSession();

// Функция проверки авторизации
function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        if (headers_sent()) {
            echo json_encode(['error' => 'Unauthorized', 'redirect' => 'login.html']);
            exit();
        } else {
            header("Location: login.html");
            exit();
        }
    }
    return $_SESSION['user_id'];
}

// Создание CSRF токена если его нет
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>