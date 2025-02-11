<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$mysqli = new mysqli("localhost", "kentar", "password", "ispay");

if ($mysqli->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection error']);
    exit();
}

$sql = "
    SELECT fr.id, fr.sender_id, u.nickname as sender_nickname, u.avatar as sender_avatar
    FROM friend_requests fr
    JOIN users u ON fr.sender_id = u.user_id
    WHERE fr.receiver_id = ? AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
";

$stmt = $mysqli->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$requests = [];
while ($row = $result->fetch_assoc()) {
    $requests[] = $row;
}

echo json_encode(['success' => true, 'requests' => $requests]);
$mysqli->close();
?>
