<?php
require_once 'config_ispay.php';
require_once 'password_validator.php';

class PasswordRecovery {
    private $pdo;
    private $tokenExpiry = 3600; // 1 час

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function generateResetToken($email) {
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', time() + $this->tokenExpiry);

        $stmt = $this->pdo->prepare("
            UPDATE users 
            SET reset_token = ?, reset_token_expiry = ? 
            WHERE email = ?
        ");
        $stmt->execute([$token, $expiry, $email]);

        return $token;
    }

    public function validateResetToken($token) {
        $stmt = $this->pdo->prepare("
            SELECT user_id 
            FROM users 
            WHERE reset_token = ? 
            AND reset_token_expiry > NOW()
        ");
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function resetPassword($token, $newPassword) {
        $validator = new PasswordValidator();
        $validation = $validator->validate($newPassword);

        if (!$validation['isValid']) {
            return [
                'success' => false,
                'errors' => $validation['errors']
            ];
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        
        $stmt = $this->pdo->prepare("
            UPDATE users 
            SET password = ?, reset_token = NULL, reset_token_expiry = NULL 
            WHERE reset_token = ? AND reset_token_expiry > NOW()
        ");
        
        $success = $stmt->execute([$hashedPassword, $token]);

        return [
            'success' => $success,
            'message' => $success ? 'Пароль успешно изменен' : 'Недействительный или просроченный токен'
        ];
    }
}

// Обработка запроса на сброс пароля
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $recovery = new PasswordRecovery($pdo_ispay);
    
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'request_reset':
                if (!isset($_POST['email'])) {
                    echo json_encode(['error' => 'Email не указан']);
                    exit;
                }
                
                $token = $recovery->generateResetToken($_POST['email']);
                // Здесь должна быть отправка email с токеном
                echo json_encode(['success' => true, 'message' => 'Инструкции по сбросу пароля отправлены на email']);
                break;

            case 'reset_password':
                if (!isset($_POST['token']) || !isset($_POST['new_password'])) {
                    echo json_encode(['error' => 'Не все параметры указаны']);
                    exit;
                }

                $result = $recovery->resetPassword($_POST['token'], $_POST['new_password']);
                echo json_encode($result);
                break;
        }
    }
}
?> 