-- Добавляем таблицу для отслеживания попыток входа
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    attempt_time DATETIME NOT NULL,
    success BOOLEAN NOT NULL,
    INDEX idx_username_time (username, attempt_time)
);

-- Добавляем поля для восстановления пароля в таблицу users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reset_token_expiry DATETIME DEFAULT NULL;

-- Добавляем поле для CSRF токена
ALTER TABLE users
ADD COLUMN IF NOT EXISTS csrf_token VARCHAR(64) DEFAULT NULL;

-- Создаем таблицу для логирования безопасности
CREATE TABLE IF NOT EXISTS security_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    type VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    message TEXT NOT NULL,
    INDEX idx_timestamp (timestamp)
);

-- Создаем триггер для автоматического обновления времени последнего входа
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_last_login
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.last_login IS NULL OR NEW.last_login < OLD.last_login THEN
        SET NEW.last_login = NOW();
    END IF;
END//
DELIMITER ; 