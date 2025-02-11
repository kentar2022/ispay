<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
// Подключение к базе данных
$mysqli = new mysqli("localhost", "kentar", "password", "udmurt");

if ($mysqli->connect_error) {
    die("Ошибка подключения: " . $mysqli->connect_error);
}

// Получение всех тем с их топиками и уроками
function getThemesWithLessons($mysqli) {
    $themes = [];
    
    // Получаем все темы
    $themeQuery = "SELECT * FROM themes ORDER BY id";
    $themeResult = $mysqli->query($themeQuery);
    
    while ($theme = $themeResult->fetch_assoc()) {
        $theme['topics'] = [];
        
        // Получаем топики для каждой темы
        $topicQuery = "SELECT * FROM topics WHERE theme_id = ? ORDER BY id";
        $stmt = $mysqli->prepare($topicQuery);
        $stmt->bind_param("i", $theme['id']);
        $stmt->execute();
        $topicResult = $stmt->get_result();
        
        while ($topic = $topicResult->fetch_assoc()) {
            $topic['lessons'] = [];
            
            // Получаем уроки для каждого топика
            $lessonQuery = "SELECT * FROM lessons WHERE topic_id = ? ORDER BY lesson_level";
            $stmt2 = $mysqli->prepare($lessonQuery);
            $stmt2->bind_param("i", $topic['id']);
            $stmt2->execute();
            $lessonResult = $stmt2->get_result();
            
            while ($lesson = $lessonResult->fetch_assoc()) {
                $lesson['data'] = json_decode($lesson['data'], true);
                $topic['lessons'][] = $lesson;
            }
            
            $theme['topics'][] = $topic;
        }
        
        $themes[] = $theme;
    }
    
    return $themes;
}

$themes = getThemesWithLessons($mysqli);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Уроки удмуртского языка</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }

        .theme-section {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .theme-title {
            color: #2c5282;
            font-size: 24px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
        }

        .topics-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }

        .topic-card {
            background: #f8fafc;
            border-radius: 6px;
            padding: 15px;
        }

        .topic-title {
            color: #4a5568;
            font-size: 18px;
            margin-bottom: 15px;
        }

        .lesson-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .lesson-item {
            background: white;
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }

        .task-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 10px;
        }

        .task-card {
            background: #f1f5f9;
            padding: 10px;
            border-radius: 4px;
        }

        .task-type {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 5px;
        }

        .expand-button {
            background: #4a5568;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }

        .expand-button:hover {
            background: #2d3748;
        }
    </style>
</head>
<body>
    <h1>Уроки удмуртского языка</h1>

    <?php foreach ($themes as $theme): ?>
        <section class="theme-section">
            <h2 class="theme-title"><?= htmlspecialchars($theme['themes_name']) ?></h2>
            <div class="topics-container">
                <?php foreach ($theme['topics'] as $topic): ?>
                    <div class="topic-card">
                        <h3 class="topic-title"><?= htmlspecialchars($topic['topic_name']) ?></h3>
                        <div class="lesson-list" id="topic-<?= $topic['id'] ?>">
                            <?php foreach ($topic['lessons'] as $lesson): ?>
                                <div class="lesson-item">
                                    <strong>Урок <?= $lesson['lesson_level'] ?></strong>
                                    <div class="task-container">
                                        <?php 
                                        if (isset($lesson['data']) && is_array($lesson['data'])) {
                                            foreach ($lesson['data'] as $task) {
                                                if (isset($task['data']['task_type'])) {
                                                    $taskType = match($task['data']['task_type']) {
                                                        'translation' => 'Перевод',
                                                        'multiple_choice' => 'Выбор ответа',
                                                        'matches' => 'Сопоставление',
                                                        default => 'Другое'
                                                    };
                                                    echo "<div class='task-card'>";
                                                    echo "<div class='task-type'>{$taskType}</div>";
                                                    echo "<div>{$task['data']['text']}</div>";
                                                    echo "</div>";
                                                }
                                            }
                                        }
                                        ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>
    <?php endforeach; ?>

    <script>
        // JavaScript для обработки раскрытия/скрытия заданий
        document.querySelectorAll('.lesson-item').forEach(item => {
            const taskContainer = item.querySelector('.task-container');
            const initialHeight = taskContainer.style.height;
            
            taskContainer.style.display = 'none';
            
            item.addEventListener('click', () => {
                const isHidden = taskContainer.style.display === 'none';
                taskContainer.style.display = isHidden ? 'grid' : 'none';
            });
        });
    </script>
</body>
</html>
