<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$servername = "localhost";
$username = "kentar";
$password = "password";

if (!isset($_POST['table']) || !isset($_POST['language'])) {
    die('Table or language parameter is missing.');
}

$tableName = $_POST['table'];
$language = $_POST['language'];

$conn = new mysqli($servername, $username, $password, $language);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT {$tableName}.*, rw.word_russian FROM {$tableName} INNER JOIN russian_words rw ON {$tableName}.id = rw.id";
$result = $conn->query($sql);

$data = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);

$conn->close();
?>
