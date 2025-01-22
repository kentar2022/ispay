<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id'])) {
   echo json_encode(['success' => false, 'message' => 'Unauthorized']);
   exit();
}

$receiver_id = $_SESSION['user_id'];
$sender_id = $_POST['user_id'];
$action = $_POST['action'];

$mysqli = new mysqli("localhost", "kentar", "password", "ispay");

if ($mysqli->connect_error) {
   echo json_encode(['success' => false, 'message' => 'Database connection error']);
   exit();
}

$mysqli->begin_transaction();

try {
   $status = ($action === 'accept') ? 'accepted' : 'rejected';
   
   $stmt = $mysqli->prepare("
       UPDATE friend_requests 
       SET status = ?, updated_at = NOW() 
       WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'
   ");
   $stmt->bind_param("sii", $status, $sender_id, $receiver_id);
   $stmt->execute();

   if ($action === 'accept') {
       $stmt = $mysqli->prepare("INSERT INTO friends (user_id, friend_id) VALUES (?, ?), (?, ?)");
       $stmt->bind_param("iiii", $receiver_id, $sender_id, $sender_id, $receiver_id);
       $stmt->execute();
   }

   $mysqli->commit();
   echo json_encode(['success' => true, 'message' => 'Request processed successfully']);
} catch (Exception $e) {
   $mysqli->rollback();
   echo json_encode(['success' => false, 'message' => 'Error processing request']);
}

$mysqli->close();
?>