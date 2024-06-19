<?php 
ini_set('display_errors', 1); 
ini_set('display_startup_errors', 1); 
error_reporting(E_ALL); 
header('Content-Type: application/json');  

$servername = "localhost"; 
$username = "kentar"; 
$password = "password";  

if (!isset($_POST['lesson_id']) || !isset($_POST['language']) || !isset($_POST['interfaceLanguage'])) {     
    die('lesson_id, language, or interfaceLanguage parameter is missing.'); 
}  

$lessonId = $_POST['lesson_id']; 
$language = $_POST['language']; 
$interfaceLanguage = $_POST['interfaceLanguage'];  

// Формируем имя таблицы на основе языка 
$tableName = $language . "_words";  

$conn = new mysqli($servername, $username, $password, $language);  

if ($conn->connect_error) {     
    die("Connection failed: " . $conn->connect_error); 
}  

// Получаем данные из таблицы $tableName для текстов вопросов, соответствующих указанному уровню урока (lesson_id)
$sql_select_questions = "SELECT * FROM {$tableName} WHERE lesson_level = ?"; 
$stmt_select_questions = $conn->prepare($sql_select_questions); 
$stmt_select_questions->bind_param("i", $lessonId); 
$stmt_select_questions->execute(); 
$result_select_questions = $stmt_select_questions->get_result();  

$questions_data = array();  
$question_ids = array();  

if ($result_select_questions->num_rows > 0) {     
    while($row = $result_select_questions->fetch_assoc()) {         
        $questions_data[] = $row;         
        $question_ids[] = $row['id'];     // собираем id вопросов
    } 
} else {     
    echo "No data found in table: {$tableName} (questions)"; 
}  

// Если есть вопросы, формируем запрос на выборку ответов для этих вопросов
if (!empty($question_ids)) {
    $placeholders = implode(',', array_fill(0, count($question_ids), '?'));
    
    // Формируем имя таблицы, содержащей тексты ответов, на основе языка интерфейса пользователя
    $answersTableName = $interfaceLanguage . "_words";  
    
    // Получаем данные из таблицы, соответствующей языку интерфейса пользователя, для текстов ответов, соответствующих вопросам
    $sql_select_answers = "SELECT * FROM {$answersTableName} WHERE id IN ($placeholders)";
    $stmt_select_answers = $conn->prepare($sql_select_answers);
    $stmt_select_answers->bind_param(str_repeat('i', count($question_ids)), ...$question_ids);
    $stmt_select_answers->execute();
    $result_select_answers = $stmt_select_answers->get_result();  
    
    $answers_data = array();  
    
    if ($result_select_answers->num_rows > 0) {     
        while($row = $result_select_answers->fetch_assoc()) {         
            $answers_data[] = $row;     
        } 
    } else {     
        echo "No data found in table: {$answersTableName} (answers)"; 
    }  
} else {
    $answers_data = array();
}

// Объединяем данные в один массив для передачи в JSON 
$data = array(     
    'questions' => $questions_data,     
    'answers' => $answers_data 
);  

// Возвращаем данные в формате JSON 
echo json_encode($data);  

$conn->close(); 
?>
