
<?php
$host = 'localhost';
$user = 'kentar';
$password = 'password';
$dbName = 'chechen';


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');


$mysqli = new mysqli($host, $user, $password, $dbName);


if ($mysqli->connect_error) {
    die('Ошибка подключения: ' . $mysqli->connect_error);
}


$russianQuery = "SELECT * FROM russian_words";
$russianResult = $mysqli->query($russianQuery);
$russianWords = [];

while ($row = $russianResult->fetch_assoc()) {
    $russianWords[] = $row['word_russian'];
}


$chechenQuery = "SELECT * FROM chechen_words";
$chechenResult = $mysqli->query($chechenQuery);
$chechenWords = [];

while ($row = $chechenResult->fetch_assoc()) {
    $chechenWords[] = $row['word_chechen'];
}


echo json_encode(['russianWords' => $russianWords, 'chechenWords' => $chechenWords]);


$mysqli->close();
?>
