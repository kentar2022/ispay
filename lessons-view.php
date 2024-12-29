<?php
// Подключение к базе данных
$mysqli = new mysqli("localhost", "kentar", "password", "udmurt");

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Получение тем
$themes_query = "SELECT * FROM themes ORDER BY id";
$themes_result = $mysqli->query($themes_query);
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
            cursor: pointer;
        }

        .theme-title {
            color: #2c5282;
            font-size: 24px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            z-index: 1000;
        }

        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 20px;
            width: 80%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            border-radius: 8px;
            position: relative;
        }

        .modal-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            gap: 20px;
        }

        .modal-item:hover {
            background-color: #f5f5f5;
        }

        .close {
            position: absolute;
            right: 20px;
            top: 20px;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
        }
        .editable {
            cursor: pointer;
            padding: 2px 5px;
            border-radius: 3px;
        }

        .editable:hover {
            background-color: #f0f0f0;
        }

        .editable::after {
            content: '✎';
            margin-left: 5px;
            opacity: 0;
            color: #666;
        }

        .editable:hover::after {
            opacity: 1;
        }        
    </style>
</head>
<body>
    <div id="taskModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2 id="modalTitle"></h2>
            <div id="modalList"></div>
        </div>
    </div>

    <?php while ($theme = $themes_result->fetch_assoc()): ?>
        <?php
        
        $lessons_query = "SELECT * FROM lessons WHERE topic_id IN 
            (SELECT id FROM topics WHERE theme_id = ?) 
            ORDER BY lesson_level";
        $stmt = $mysqli->prepare($lessons_query);
        $stmt->bind_param("i", $theme['id']);
        $stmt->execute();
        $lessons_result = $stmt->get_result();
        ?>

        <div class="theme-section" data-theme-id="<?= $theme['id'] ?>">
            <h2 class="theme-title"><?= htmlspecialchars($theme['themes_name']) ?></h2>
            <div class="lessons-data" style="display: none;">
                <?php 
                while ($lesson = $lessons_result->fetch_assoc()) {
                    $data = json_decode($lesson['data'], true);
                    if ($data) {
                        foreach ($data as $task) {
                            if ($task['data']['task_type'] !== 'matches') {
                                echo json_encode([
                                    'lesson_id' => $lesson['id'],
                                    'text' => $task['data']['text'],
                                    'answer' => $task['data']['answer'] ?? ''
                                ]) . '|||';
                            }
                        }
                    }
                }
                ?>
            </div>
        </div>
    <?php endwhile; ?>

    <script>
        document.querySelectorAll('.theme-section').forEach(section => {
            section.addEventListener('click', () => {
                const title = section.querySelector('.theme-title').textContent;
                const tasksData = section.querySelector('.lessons-data').textContent;
                const tasks = tasksData.split('|||')
                    .filter(t => t.trim())
                    .map(t => JSON.parse(t));

                showModal(title, tasks);
            });
        });

        function showModal(title, tasks) {
            const modal = document.getElementById('taskModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalList = document.getElementById('modalList');

            modalTitle.textContent = title;
            
            // Отображаем задания
            modalList.innerHTML = tasks.map(task => `
                <div class="modal-item" data-id="${task.lesson_id}">
                    <span class="editable" data-field="text">${task.text}</span>
                    <span class="editable" data-field="answer">${task.answer}</span>
                </div>
            `).join('');

            // Добавляем обработчики
            document.querySelectorAll('.editable').forEach(element => {
                element.addEventListener('dblclick', async function(e) {
                    const newText = prompt('Введите новое значение:', this.textContent);
                    if (newText && newText !== this.textContent) {
                        const taskId = this.closest('.modal-item').dataset.id;
                        const field = this.dataset.field;
                        const oldText = this.textContent;

                        console.log('Updating:', {
                            lesson_id: taskId,
                            field: field,
                            old: oldText,
                            new: newText
                        });

                        try {
                            const result = await updateWord(taskId, oldText, newText, field);
                            if (result.success) {
                                this.textContent = newText;
                                // Перезагружаем страницу для обновления всех данных
                                location.reload();
                            } else {
                                alert('Ошибка обновления: ' + JSON.stringify(result));
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            alert('Ошибка: ' + error.message);
                        }
                    }
                });
            });

            modal.style.display = 'block';
        }

        async function updateWord(id, oldText, newText, field) {
            try {
                const response = await fetch('update_word.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: id,
                        oldText: oldText,
                        newText: newText,
                        field: field
                    })
                });
                
                const data = await response.json();
                console.log('Server response:', data); // Логируем ответ сервера
                
                if (data.error) {
                    throw new Error(JSON.stringify(data, null, 2));
                }
                
                return data;
            } catch (error) {
                console.error('Error details:', error);
                throw error;
            }
        }

        // Закрытие модального окна
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('taskModal').style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            const modal = document.getElementById('taskModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    </script>

</body>
</html>

<?php
$mysqli->close();
?>