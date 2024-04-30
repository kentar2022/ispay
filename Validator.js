$(document).ready(function () {
    var data;
    var currentIndex = 0;
    var correctAnswersCount = 0;

    // Получаем ID урока из localStorage
    var lessonId = localStorage.getItem('lessonId');
    
    // Проверяем, что lessonId не равен null (что означает, что он был сохранен на предыдущей странице)
    if (lessonId !== null) {
        console.log('Received lesson ID:', lessonId);
        // Загружаем урок на основе полученного ID
        loadLesson(lessonId);
    } else {
        console.log('No lesson ID found.');
    }
    
    // Опционально: Очищаем localStorage после использования, если это необходимо
    localStorage.removeItem('lessonId');

    // Функция загрузки фраз из указанной таблицы
    function loadPhrases(tableName) {
        $.ajax({
            url: 'load_phrases.php',
            method: 'POST',
            data: { table: tableName },
            success: function (response) {
                console.log('Phrases loaded:', response);
                data = response; // Сохраняем полученные данные
                displayWindow(currentIndex); // Отображаем первую фразу урока
            },
            error: function (xhr, status, error) {
                console.error(error);
            }
        });
    }

    // Функция отображения фразы на странице
    function displayWindow(index) {
        if (!data || !data[index]) {
            console.error('No data or invalid index:', data, index);
            return;
        }
        var windowContainer = $('#windowsContainer');
        windowContainer.empty();
        var currentWindow = $('#' + data[index].id);

        if (currentWindow.length > 0) {
            currentWindow.text(data[index].text);
        } else {
            var windowContent = '<div id="' + data[index].id + '" class="window active">' + data[index].text + '</div>';
            windowContainer.append(windowContent);
        }

        $('.window').removeClass('active');
        $('#' + data[index].id).addClass('active');

        updateProgressBar(index, data.length);

        var currentData = data.find(item => item.id === $('#' + data[index].id).attr('id'));
        var wordRussian = currentData ? currentData.word_russian : 'Соответствующая строка не найдена';
        console.log('Слово на русском:', wordRussian);
    }

    // Функция загрузки урока на основе его ID
    function loadLesson(lessonId) {
        var lessonTable;
        switch (lessonId) {
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
                console.error('Lesson table not found for lesson ID:', lessonId);
                return;
        }
        // Загружаем данные урока
        loadPhrases(lessonTable);
    }

    // Обработчик кнопки "Далее"
    $('#nextBtn').on('click', function () {
        var userInput = $('#textInput').val().trim();
        if (!data || !data[currentIndex]) {
            console.error('No data or invalid index:', data, currentIndex);
            return;
        }
        var currentWordRussian = data[currentIndex].word_russian.toLowerCase();

        if (userInput === '.' || userInput.toLowerCase() === currentWordRussian) {
            correctAnswersCount++;
            if (correctAnswersCount === 15) {
                window.location.href = 'chechen_lessons_menu.html';
                return;
            }
            currentIndex++;
            if (currentIndex >= data.length) {
                currentIndex = 0;
            }
            displayWindow(currentIndex);
            $('#textInput').val('');
        } else {
            alert('Неверный перевод фразы.');
        }
    });

});
