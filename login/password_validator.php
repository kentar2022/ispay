<?php
class PasswordValidator {
    private $minLength = 8;
    private $requireUppercase = true;
    private $requireLowercase = true;
    private $requireNumbers = true;
    private $requireSpecialChars = true;

    public function validate($password) {
        $errors = [];

        if (strlen($password) < $this->minLength) {
            $errors[] = "Пароль должен содержать минимум {$this->minLength} символов";
        }

        if ($this->requireUppercase && !preg_match('/[A-Z]/', $password)) {
            $errors[] = "Пароль должен содержать хотя бы одну заглавную букву";
        }

        if ($this->requireLowercase && !preg_match('/[a-z]/', $password)) {
            $errors[] = "Пароль должен содержать хотя бы одну строчную букву";
        }

        if ($this->requireNumbers && !preg_match('/[0-9]/', $password)) {
            $errors[] = "Пароль должен содержать хотя бы одну цифру";
        }

        if ($this->requireSpecialChars && !preg_match('/[!@#$%^&*()\-_=+{};:,<.>]/', $password)) {
            $errors[] = "Пароль должен содержать хотя бы один специальный символ (!@#$%^&*()-_=+{};:,<.>)";
        }

        return [
            'isValid' => empty($errors),
            'errors' => $errors
        ];
    }
}
?> 