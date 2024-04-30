<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');


$db_host = 'localhost';
$db_user = 'kentar';
$db_password = 'password';
$db_name = 'ispay';

$conn = new mysqli($db_host, $db_user, $db_password, $db_name);

if ($conn->connect_error) {
  die("Database connection eror: " . $conn->connect_error);
}

if (isset($_POST['email']) && isset($_POST['password'])) {
  $email = $_POST['email'];
  $password = $_POST['password'];

  $sql = "INSERT INTO users (email, password) VALUES (?, ?)";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ss", $email, $password);

  if ($stmt->execute()) {
    header('Location: ../profile.html');
  } else {
    echo "Erreur lors de l'inscription.";
  }

  $stmt->close();
} else {
  echo "Veuillez remplir tout les champs.";
}

$conn->close();
?>
