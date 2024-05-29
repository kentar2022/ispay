<?php

session_start();

// Удаление всех переменных сессии
$_SESSION = array();

// Если требуется уничтожить сессию, также удалите сессионные куки.
// Заметьте: это уничтожит сессию, а не только данные сессии!
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Наконец, уничтожить сессию.
session_destroy();

// Перенаправление на страницу входа
header("Location: login.html");
exit();
?>
