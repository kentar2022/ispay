<?php
class RateLimiter {
    private $pdo;
    private $maxAttempts = 5;
    private $timeWindow = 300; // 5 минут в секундах

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function isBlocked($username) {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) as attempts, MAX(attempt_time) as last_attempt 
            FROM login_attempts 
            WHERE username = ? AND attempt_time > DATE_SUB(NOW(), INTERVAL ? SECOND)
        ");
        $stmt->execute([$username, $this->timeWindow]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result['attempts'] >= $this->maxAttempts) {
            $timeLeft = $this->timeWindow - (time() - strtotime($result['last_attempt']));
            return [
                'blocked' => true,
                'timeLeft' => ceil($timeLeft / 60)
            ];
        }

        return ['blocked' => false];
    }

    public function logAttempt($username, $success) {
        $stmt = $this->pdo->prepare("
            INSERT INTO login_attempts (username, attempt_time, success) 
            VALUES (?, NOW(), ?)
        ");
        $stmt->execute([$username, $success ? 1 : 0]);
    }

    public function clearAttempts($username) {
        $stmt = $this->pdo->prepare("DELETE FROM login_attempts WHERE username = ?");
        $stmt->execute([$username]);
    }
}
?> 