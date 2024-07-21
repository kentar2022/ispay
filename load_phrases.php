<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$servername = "localhost";
$username = "kentar";
$password = "password";

if (!isset($_POST['lesson_id']) || !isset($_POST['language']) || !isset($_POST['interfaceLanguage'])) {
    echo json_encode(['error' => 'lesson_id, language, or interfaceLanguage parameter is missing.']);
    exit;
}

$lessonId = $_POST['lesson_id'];
$language = $_POST['language'];
$interfaceLanguage = $_POST['interfaceLanguage'];

$tableName = $language . "_words";

$conn = new mysqli($servername, $username, $password, $language);

if ($conn->connect_error) {
    echo json_encode(['error' => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Получение вопросов
$sql_select_questions = "SELECT * FROM {$tableName} WHERE lesson_level = ?";
$stmt_select_questions = $conn->prepare($sql_select_questions);
$stmt_select_questions->bind_param("i", $lessonId);
$stmt_select_questions->execute();
$result_select_questions = $stmt_select_questions->get_result();

$questions_data = array();
$question_ids = array();
$matches_data = array();

if ($result_select_questions->num_rows > 0) {
    while ($row = $result_select_questions->fetch_assoc()) {
        $questions_data[] = $row;
        $question_ids[] = $row['id'];

        if ($row['task_type'] === 'matches') {
            $match = array(
                'question_id' => $row['id'],
                'questions' => $row['text'],
                'answers' => '' // Заполним позже
            );
            $matches_data[] = $match;
        }
    }
} else {
    echo json_encode(["error" => "No data found in table: {$tableName} (questions)"]);
    exit;
}

// Получение ответов
$answersTableName = 'russian_words';

$sql_select_answers = "SELECT * FROM {$answersTableName} WHERE id IN (" . implode(',', array_fill(0, count($question_ids), '?')) . ")";
$stmt_select_answers = $conn->prepare($sql_select_answers);
$stmt_select_answers->bind_param(str_repeat('i', count($question_ids)), ...$question_ids);
$stmt_select_answers->execute();
$result_select_answers = $stmt_select_answers->get_result();

$answers_data = array();
$summary = "";

if ($result_select_answers->num_rows > 0) {
    while ($row = $result_select_answers->fetch_assoc()) {
        $answers_data[] = $row;

        // Check if summary is not yet set and current row has a non-empty summary
        if (empty($summary) && !empty($row['summary'])) {
            $summary = $row['summary'];
        }

        foreach ($matches_data as &$match) {
            if ($match['question_id'] == $row['id']) {
                $match['answers'] = $row['word_russian'];
            }
        }
    }
} else {
    echo json_encode(["error" => "No data found in table: {$answersTableName} (answers)"]);
    exit;
}

// Добавление summary в ответ
foreach ($answers_data as &$answer) {
    $answer['summary'] = $summary;
}

$data = array(
    'questions' => $questions_data,
    'answers' => $answers_data,
    'matches' => $matches_data
);

echo json_encode($data);

$conn->close();
?>
