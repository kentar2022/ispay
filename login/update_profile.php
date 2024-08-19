<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require 'config_ispay.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = $_SESSION['user_id'];

    // Проверяем, загружен ли файл
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/avatars/';
        $fileTmpPath = $_FILES['avatar']['tmp_name'];
        $fileName = $_FILES['avatar']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $newFileName = $user_id . '_' . uniqid() . '.' . $fileExtension;
        $destPath = $uploadDir . $newFileName;

        // Перемещаем загруженный файл в директорию
        if (move_uploaded_file($fileTmpPath, $destPath)) {
            // Обновляем запись в базе данных
            $stmt = $pdo_ispay->prepare("UPDATE users SET avatar = ? WHERE user_id = ?");
            $stmt->execute([$destPath, $user_id]);
        }
    } else {
        // Обновляем текстовое поле
        $field = $_POST['field'];
        $value = $_POST['value'];

        // Проверяем, что поле допустимо для обновления
        if (in_array($field, ['nickname', 'email', 'country'])) {
            // Обновляем указанное поле
            $stmt = $pdo_ispay->prepare("UPDATE users SET $field = ? WHERE user_id = ?");
            $stmt->execute([$value, $user_id]);
        }
    }

    // Перезагрузка заглавной страницы после выполнения обновления
    header("Location: ../index.html");
    exit();
}
?>
