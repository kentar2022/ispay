<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Подключение к базе данных
$host = 'localhost';
$dbname = 'ispay';
$username = 'kentar';
$password = 'password'; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['success' => false, 'message' => "Ошибка подключения к базе данных: " . $e->getMessage()]));
}

// Получаем действие из запроса
$action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : null);
$userId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : (isset($_GET['user_id']) ? (int)$_GET['user_id'] : null);

if (!$action || !$userId) {
    die(json_encode(['success' => false, 'message' => 'Некорректные входные данные']));
}

// Если действие — получение статуса подарков
if ($action === 'getStatus') {
    // Получаем текущий день последнего открытого подарка для данного пользователя
    $query = "SELECT gift_day, timestamp FROM gifts WHERE user_id = :user_id LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    $giftData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$giftData) {
        // Если записи нет, создаем новую запись для нового пользователя
        $query = "INSERT INTO gifts (user_id, gift_day, timestamp) VALUES (:user_id, 0, NULL)";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        // Устанавливаем начальные значения
        $giftData = ['gift_day' => 0, 'timestamp' => null];
    }

    // Логика отображения доступных подарков
    $giftStatus = [];
    for ($day = 1; $day <= 6; $day++) {
        $collected = $day <= $giftData['gift_day'];  // Все дни до текущего дня считаются собранными
        $available = $day === ($giftData['gift_day'] + 1);  // Только следующий день доступен для получения

        $giftStatus[] = [
            'day' => $day,
            'collected' => $collected,
            'available' => $available
        ];
    }

    // Возвращаем состояние подарков
    echo json_encode(['success' => true, 'gifts' => $giftStatus]);
    exit;
}

// Если действие — получение подарка
if ($action === 'collectGift') {
    $itemType = isset($_POST['item_type']) ? $_POST['item_type'] : null;
    $amount = isset($_POST['amount']) ? (int)$_POST['amount'] : null;
    $giftDay = isset($_POST['gift_day']) ? (int)$_POST['gift_day'] : null;

    if (!$itemType || !$amount || !$giftDay) {
        die(json_encode(['success' => false, 'message' => 'Некорректные входные данные для получения подарка']));
    }

    // Получаем текущий день подарка и время последнего получения
    $query = "SELECT gift_day, timestamp FROM gifts WHERE user_id = :user_id LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    $giftData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$giftData) {
        die(json_encode(['success' => false, 'message' => 'Пользователь не найден в таблице подарков']));
    }

    // Проверяем, можно ли открыть этот подарок (можно только следующий за последним открытым)
    if ($giftDay !== ($giftData['gift_day'] + 1)) {
        die(json_encode(['success' => false, 'message' => 'Этот подарок нельзя открыть.']));
    }

    // Проверяем, прошло ли 24 часа с момента последнего получения подарка
    if ($giftData['timestamp']) {
        $lastGiftTime = new DateTime($giftData['timestamp']);
        $currentTime = new DateTime();
        $interval = $currentTime->diff($lastGiftTime);

        // Если не прошло 24 часа, подарок нельзя получить
        if ($interval->h < 24 && $interval->days == 0) {
            $timeRemaining = [
                'hours' => 23 - $interval->h,
                'minutes' => 59 - $interval->i,
                'seconds' => 59 - $interval->s
            ];
            die(json_encode(['success' => false, 'message' => 'Меньше 24 часов с момента последнего подарка.', 'time_remaining' => $timeRemaining]));
        }
    }

    // Если прошло 24 часа, обновляем существующую запись для пользователя
    $query = "UPDATE gifts SET gift_day = :gift_day, timestamp = NOW() WHERE user_id = :user_id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':gift_day', $giftDay);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();

    // Обновляем ресурсы пользователя
    $query = "UPDATE users SET $itemType = $itemType + :amount WHERE id = :user_id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':amount', $amount);
    $stmt->bindParam(':user_id', $userId);
    if (!$stmt->execute()) {
        die(json_encode(['success' => false, 'message' => 'Не удалось обновить ресурсы']));
    }

    // Возвращаем успешный результат
    echo json_encode(['success' => true, 'message' => 'Подарок успешно получен']);
    exit;
}

// Если действие не распознано
echo json_encode(['success' => false, 'message' => 'Некорректное действие']);
?>
