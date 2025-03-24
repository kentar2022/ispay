<?php
// Настройки базы данных
define('DB_HOST', 'localhost');
define('DB_USER', 'database_username');
define('DB_PASSWORD', 'database_password');
define('DB_NAME', 'database_name');

// Дополнительные настройки
define('BASE_URL', '//' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']));
define('DEBUG_MODE', false);

// Языки
define('SUPPORTED_LANGUAGES', [
    'chechen' => 'Чеченский',
    'ingush' => 'Ингушский',
    'adyge' => 'Черкесский',
    'udmurt' => 'Удмуртский',
    'tatar' => 'Татарский',
    'chuvash' => 'Чувашский',
    'bashkort' => 'Башкирский',
    'moksha' => 'Мокшанский',
    'lezgin' => 'Лезгинский'
]);