<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();
require 'config.php';  // Подключение к базе данных user_auth
require 'config_ispay.php';  // Подключение к базе данных ispay
require 'config_chechen.php';  // Подключение к базе данных chechen

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $csrf_token = bin2hex(random_bytes(32));

    // Вставка данных в таблицу users (база данных user_auth)
    $stmt = $pdo_user_auth->prepare("INSERT INTO users (email, password, csrf_token) VALUES (?, ?, ?)");
    if ($stmt->execute([$email, $password, $csrf_token])) {
        $user_id = $pdo_user_auth->lastInsertId();
        
        // Вставка в другую базу данных (например, ispay)
        $stmt_ispay = $pdo_ispay->prepare("INSERT INTO users (user_id, email) VALUES (?, ?)");
        $stmt_ispay->execute([$user_id, $email]);

        // Получение всех тем из таблицы themes (база данных chechen)
        $themes_stmt = $pdo_chechen->query("SELECT id FROM themes");
        $themes = $themes_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Получение всех уроков из таблицы topics (база данных chechen)
        $topics_stmt = $pdo_chechen->query("SELECT id, theme_id FROM topics");
        $topics = $topics_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Вставка данных в таблицу theme_progress для нового пользователя
        $theme_progress_stmt = $pdo_chechen->prepare("INSERT INTO theme_progress (user_id, theme_id, completed_lessons, completed_topics, progress_percentage, total_score) VALUES (?, ?, 0, 0, 0, 0)");
        foreach ($themes as $theme) {
            $theme_progress_stmt->execute([$user_id, $theme['id']]);
        }

        // Вставка данных в таблицу topic_progress для нового пользователя
        $topic_progress_stmt = $pdo_chechen->prepare("INSERT INTO topic_progress (user_id, theme_id, topic_id, completed_lessons, completed_topics, total_score) VALUES (?, ?, ?, 0, 0, 0)");
        foreach ($topics as $topic) {
            $topic_progress_stmt->execute([$user_id, $topic['theme_id'], $topic['id']]);
        }

        // Сохранение данных в сессии
        $_SESSION['csrf_token'] = $csrf_token;
        $_SESSION['user_id'] = $user_id; 
        header("Location: login.html");
    } else {
        echo "Registration failed.";
    }
}
?>
