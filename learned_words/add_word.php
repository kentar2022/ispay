<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include 'db.php';

$user_id = $_POST['user_id'];
$word_russian = $_POST['word_russian'];
$word_foreign = $_POST['word_foreign']; 
$date_learned = $_POST['date_learned'];
$repetition_count = $_POST['repetition_count'];
$progress = $_POST['progress'];


$check = $mysqli->prepare('SELECT * FROM learned_words WHERE user_id = ? AND word_russian = ? AND word_foreign = ?');
$check->bind_param('iss', $user_id, $word_russian, $word_foreign);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
   
   $row = $result->fetch_assoc();
   $new_repetition_count = $row['repetition_count'] + 1;
   
   
   $new_progress = min(1.0, $row['progress'] + 0.1);
   
   $update = $mysqli->prepare('
       UPDATE learned_words 
       SET repetition_count = ?, 
           progress = ?,
           last_reviewed = CURRENT_DATE
       WHERE user_id = ? AND word_russian = ? AND word_foreign = ?
   ');
   
   $update->bind_param('idiss', 
       $new_repetition_count,
       $new_progress,
       $user_id,
       $word_russian,
       $word_foreign
   );
   
   if ($update->execute()) {
       echo json_encode(['status' => 'updated', 'progress' => $new_progress]);
   } else {
       echo json_encode(['status' => 'error', 'message' => $update->error]);
   }
   $update->close();
} else {
   
   $insert = $mysqli->prepare('
       INSERT INTO learned_words (user_id, word_russian, word_foreign, date_learned, repetition_count, progress)
       VALUES (?, ?, ?, ?, ?, ?)
   ');
   
   $insert->bind_param('isssid',
       $user_id,
       $word_russian,
       $word_foreign,
       $date_learned,
       $repetition_count,
       $progress
   );
   
   if ($insert->execute()) {
       echo json_encode(['status' => 'inserted']);
   } else {
       echo json_encode(['status' => 'error', 'message' => $insert->error]);
   }
   $insert->close();
}

$check->close();
$mysqli->close();
?>