$(document).ready(function () {
    var data;
    var currentIndex = 0;
    var correctAnswersCount = 0;
    var requiredCorrectAnswers = 15;
    var score = 0; // Переменная для отслеживания количества очков
    var correctAnswersTotal = 0; // Количество правильных ответов
    var answersCount = 0; // Количество ответов



    var currentTheme = localStorage.getItem('currentTheme');
    var bodyColor = localStorage.getItem('bodyColor');
    var linkColor = localStorage.getItem('linkColor');
    var fillColor = localStorage.getItem('fillColor');
    var profilePageTextColor = localStorage.getItem('profilePageTextColor');
    var settingsPageTextColor = localStorage.getItem('settingsPageTextColor');
    var coursesPageColor = localStorage.getItem('coursesPageColor');
    console.log('Актуальная тема в Validator.js:', currentTheme);

    // Устанавливаем цвета элементов в соответствии с выбранной темой
    $('body').css('background-color', bodyColor);
    $('#windowsContainer').css('color', profilePageTextColor); 
    $('#nextBtn').css('background-color', linkColor);
    $('.progress').css('background-color', linkColor);
    $('.success-message div, correct-answers').css('color', settingsPageTextColor);


    
    var lessonId = localStorage.getItem('lessonId');
    
    
    if (lessonId !== null) {
        console.log('Received lesson ID:', lessonId);
        
        loadLesson(lessonId);
    } else {
        console.log('No lesson ID found.');
    }
    
    
    localStorage.removeItem('lessonId');

    
    function loadPhrases(tableName) {
        $.ajax({
            url: 'load_phrases.php',
            method: 'POST',
            data: { table: tableName },
            success: function (response) {
                console.log('Phrases loaded:', response);
                data = response; 
                displayWindow(currentIndex); 
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

        $('#nextBtn').on('click', function () {
        var userInput = $('#textInput').val().trim();
        if (!data || !data[currentIndex]) {
            console.error('No data or invalid index:', data, currentIndex);
            return;
        }

        // Увеличиваем счетчик ответов
        answersCount++;

        var currentWordRussian = data[currentIndex].word_russian.toLowerCase();

        if (userInput === '.' || userInput.toLowerCase() === currentWordRussian) {
            // Получаем значение price и добавляем его к количеству очков
            var currentData = data.find(item => item.id === $('#' + data[currentIndex].id).attr('id'));
            var price = currentData ? parseInt(currentData.price) : 0;
            score += price;

            // Увеличиваем общее количество правильных ответов
            correctAnswersTotal++;
            console.log(correctAnswersTotal);
        }

        // Если достигнуто 15 ответов, показываем сообщение об успешном завершении урока
        if (answersCount === 15) {
            $('.main-block').addClass('hidden');
            $('.success-message').addClass('flex');
            $('.success-message').removeClass('hidden');
            $('#correctAnswersCount').text(correctAnswersTotal); // Обновляем количество правильных ответов
            $('#scoreCount').text(score); // Обновляем количество очков
            return;
        }

        currentIndex++;
        if (currentIndex >= data.length) {
            currentIndex = 0;
        }
        displayWindow(currentIndex);
        $('#textInput').val('');
    });
});

