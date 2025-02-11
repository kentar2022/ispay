<?php
session_start();
header('Content-Type: application/json');

function logDebug($message) {
    error_log(date('Y-m-d H:i:s') . " - Profile Update: " . print_r($message, true));
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    require 'config_ispay.php';
    
    logDebug("Received request: " . print_r($_POST, true));
    if (isset($_FILES)) {
        logDebug("Received files: " . print_r($_FILES, true));
    }
    
    if (!isset($_POST['field'])) {
        throw new Exception('Поле field обязательно');
    }

    $field = $_POST['field'];
    $allowed_fields = ['nickname', 'email', 'country', 'avatar'];

    if (!in_array($field, $allowed_fields)) {
        throw new Exception('Недопустимое поле для обновления');
    }

    // Обработка загрузки аватара
    if ($field === 'avatar' && isset($_FILES['avatar'])) {
        $file = $_FILES['avatar'];
        
        logDebug("Processing avatar upload: " . print_r($file, true));
        
        // Проверяем ошибки загрузки
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Ошибка при загрузке файла: ' . $file['error']);
        }

        // Проверяем тип файла
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime_type, $allowed_types)) {
            throw new Exception('Недопустимый тип файла. Разрешены только JPEG, PNG и GIF');
        }

        // Проверяем размер файла (5MB максимум)
        if ($file['size'] > 5 * 1024 * 1024) {
            throw new Exception('Файл слишком большой. Максимальный размер 5MB');
        }

        // Создаем директорию для загрузки, если её нет
        $upload_dir = dirname(__DIR__) . '/profile-pics/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0775, true);
        }

        // Генерируем уникальное имя файла
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = 'avatar_' . $_SESSION['user_id'] . '_' . time() . '.' . $extension;
        $filepath = $upload_dir . $filename;

        logDebug("Attempting to move file to: " . $filepath);

        // Перемещаем загруженный файл
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            logDebug("Failed to move file. PHP error: " . error_get_last()['message']);
            throw new Exception('Ошибка при сохранении файла');
        }

        // Устанавливаем права на файл
        chmod($filepath, 0664);

        // Получаем текущий аватар пользователя
        $stmt = $pdo_ispay->prepare("SELECT avatar FROM users WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $old_avatar = $stmt->fetchColumn();

        // Удаляем старый файл аватара, если он существует
        if ($old_avatar && $old_avatar !== 'images/avatar.png') {
            $old_file = dirname(__DIR__) . '/' . $old_avatar;
            if (file_exists($old_file)) {
                unlink($old_file);
            }
        }

        // Обновляем путь в базе данных
        $avatar_path = 'profile-pics/' . $filename;
        $stmt = $pdo_ispay->prepare("UPDATE users SET avatar = ? WHERE user_id = ?");
        $stmt->execute([$avatar_path, $_SESSION['user_id']]);

        echo json_encode([
            'success' => true,
            'message' => 'Аватар успешно обновлен',
            'avatar_path' => $avatar_path
        ]);
    } 
    // Обработка других полей
    else if (isset($_POST['value'])) {
        $value = trim($_POST['value']);
        
        // Валидация данных
        switch ($field) {
            case 'email':
                if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    throw new Exception('Неверный формат email');
                }
                $check = $pdo_ispay->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
                $check->execute([$value, $_SESSION['user_id']]);
                if ($check->fetch()) {
                    throw new Exception('Этот email уже используется');
                }
                break;
                
            case 'nickname':
                if (strlen($value) < 2 || strlen($value) > 50) {
                    throw new Exception('Никнейм должен быть от 2 до 50 символов');
                }
                break;
                
            case 'country':
                if (strlen($value) > 50) {
                    throw new Exception('Название страны слишком длинное');
                }
                break;
        }

        logDebug("Updating field $field with value $value");

        $stmt = $pdo_ispay->prepare("UPDATE users SET $field = ? WHERE user_id = ?");
        $stmt->execute([$value, $_SESSION['user_id']]);

        if ($stmt->rowCount() === 0) {
            throw new Exception('Данные не были обновлены');
        }

        echo json_encode([
            'success' => true,
            'message' => 'Данные успешно обновлены',
            'field' => $field,
            'value' => $value
        ]);
    } else {
        throw new Exception('Не указано значение для обновления');
    }

} catch (Exception $e) {
    logDebug("Error: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}
?>