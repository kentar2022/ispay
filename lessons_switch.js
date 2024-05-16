// Функция для загрузки данных о прогрессе пользователя
function loadUserProgress() {
    $.ajax({
        url: 'load_lessons_status.php', // Путь к PHP скрипту для загрузки данных
        method: 'GET',
        success: function(response) {
            // Обработка полученных данных
            console.log('User progress loaded:', response);
            // Находим объект с данными о пользователе с ID 1
            var userProgress = response.find(function(item) {
                return item.user_id === "1"; // Ищем объект с user_id = "1"
            });
            // Проверяем, был ли найден объект с данными о пользователе
            if (!userProgress) {
                console.error('User progress with user_id 1 not found.');
                return;
            }
            // Определяем уровень пользователя для вывода на основе его прогресса
            var userLevel = userProgress.level;
            console.log('User level:', userLevel); // Выводим уровень пользователя в консоль
            // Определяем название таблицы для вывода на основе уровня пользователя
            var lessonTable;
            switch (userLevel) {
                case "1":
                    lessonTable = 'first_lesson';
                    break;
                case "2":
                    lessonTable = 'second_lesson';
                    break;
                case "3":
                    lessonTable = 'third_lesson';
                    break;
                // Добавьте другие случаи, если это необходимо
                default:
                    console.error('Lesson table not found for user level:', userLevel);
                    return;
            }
            // Вызываем функцию для загрузки данных из нужной таблицы
            loadPhrases(lessonTable);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}

// Функция для загрузки данных из указанной таблицы
function loadPhrases(tableName) {
    $.ajax({
        url: 'load_phrases.php',
        method: 'POST',
        data: { table: tableName }, // Передаем название таблицы
        success: function(response) {
            // Обработка полученных данных
            console.log('Phrases loaded:', response);
            // Выводим полученные данные на страницу или делаем с ними что-то еще
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}

// Вызываем функцию для загрузки данных о прогрессе пользователя
loadUserProgress();
