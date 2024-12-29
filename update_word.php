<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$mysqli = new mysqli("localhost", "kentar", "password", "udmurt");

if ($mysqli->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $mysqli->connect_error]));
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['id']) || !isset($data['newText']) || !isset($data['field'])) {
    die(json_encode(['error' => 'Missing required data']));
}

$lesson_id = $data['id'];
$newText = $data['newText'];
$field = $data['field'];
$oldText = $data['oldText'];


$stmt = $mysqli->prepare("SELECT data FROM lessons WHERE id = ?");
$stmt->bind_param("i", $lesson_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if (!$row) {
    die(json_encode(['error' => 'Lesson not found', 'id' => $lesson_id]));
}


$lessonData = json_decode($row['data'], true);


$updated = false;
foreach ($lessonData as &$item) {
    if ($field === 'answer' && isset($item['data']['answer']) && $item['data']['answer'] === $oldText) {
        $item['data']['answer'] = $newText;
        $updated = true;
        break;
    }
    else if ($field === 'text' && isset($item['data']['text']) && $item['data']['text'] === $oldText) {
        $item['data']['text'] = $newText;
        $updated = true;
        break;
    }
}

if (!$updated) {
    die(json_encode([
        'error' => 'Text not found',
        'details' => [
            'field' => $field,
            'old_text' => $oldText,
            'lesson_id' => $lesson_id
        ]
    ]));
}


$updatedJson = json_encode($lessonData);
$updateStmt = $mysqli->prepare("UPDATE lessons SET data = ? WHERE id = ?");
$updateStmt->bind_param("si", $updatedJson, $lesson_id);

if (!$updateStmt->execute()) {
    die(json_encode([
        'error' => 'Update failed',
        'details' => $mysqli->error
    ]));
}

echo json_encode([
    'success' => true,
    'updated_count' => $mysqli->affected_rows
]);

$mysqli->close();
?>