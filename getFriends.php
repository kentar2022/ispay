<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');

function logDebug($message) {
    error_log(date('Y-m-d H:i:s') . " - Friends Debug: " . print_r($message, true));
}

logDebug("Starting friends fetch");

if (!isset($_SESSION['user_id'])) {
    logDebug("No user_id in session");
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
logDebug("Getting friends for user_id: " . $user_id);

try {
    $mysqli = new mysqli("localhost", "kentar", "password", "ispay");

    if ($mysqli->connect_error) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }

    // Убрали email из выборки
    $sql = "
        SELECT 
            u.user_id as id,
            u.nickname,
            COALESCE(u.avatar, 'images/avatar.png') as avatar,
            u.country
        FROM friends f 
        INNER JOIN users u ON f.friend_id = u.user_id 
        WHERE f.user_id = ?
    ";

    logDebug("Executing query: " . $sql);

    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $mysqli->error);
    }

    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $friends = [];
    while ($row = $result->fetch_assoc()) {
        $row['avatar'] = $row['avatar'] ?: 'images/avatar.png';
        // Убрали проверку на email
        $row['nickname'] = $row['nickname'] ?: 'Пользователь';
        $friends[] = $row;
    }

    logDebug("Found friends: " . count($friends));
    logDebug("Friends data: " . print_r($friends, true));

    echo json_encode($friends);

} catch (Exception $e) {
    logDebug("Error: " . $e->getMessage());
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($mysqli)) {
        $mysqli->close();
    }
}
?>