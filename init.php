// Устанавливаем параметры сессии
ini_set('session.gc_maxlifetime', 86400); // 24 часа
ini_set('session.cookie_lifetime', 86400); // 24 часа
ini_set('session.gc_probability', 1);
ini_set('session.gc_divisor', 100);

// Устанавливаем параметры cookie
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => '',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Strict'
]);

// Начинаем сессию
session_start();

// Проверяем, не истекла ли сессия
$session_timeout = 86400; // 24 часа в секундах
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $session_timeout)) {
    session_unset();
    session_destroy();
    header("Location: login/login.html");
    exit();
}

// Обновляем время последней активности
$_SESSION['last_activity'] = time();

// Регенерируем ID сессии каждый час для безопасности
if (!isset($_SESSION['created'])) {
    $_SESSION['created'] = time();
} else if (time() - $_SESSION['created'] > 3600) {
    session_regenerate_id(true);
    $_SESSION['created'] = time();
} 