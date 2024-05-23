$(document).ready(function () {
    var data;
    var currentIndex = 0;
    var correctAnswersCount = 0;
    var requiredCorrectAnswers = 15;
    var score = 0; // Переменная для отслеживания количества очков
    var correctAnswersTotal = 0; // Количество правильных ответов
    var answersCount = 0; // Количество ответов
    var userEmail = "example@example.com";

    var urlParams = new URLSearchParams(window.location.search);
    var lessonId, language;
    if (urlParams.has('lesson_id') && urlParams.has('language')) {
        lessonId = urlParams.get('lesson_id');
        language = urlParams.get('language');
        console.log('Lesson ID from URL:', lessonId);
        console.log('Language from URL:', language);
    } else {
        console.error('No lesson_id or language found in URL.');
        return;
    }

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

    function loadPhrases(language, tableName) {
        $.ajax({
            url: 'load_phrases.php',
            method: 'POST',
            data: { language: language, table: tableName },
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

        // Проверяем наличие ссылки на изображение
        if (data[index].image_url) {
            var imageUrl = data[index].image_url;
            var imageElement = $('<img>').attr('src', imageUrl).addClass('phrase-image');
            windowContainer.append(imageElement);
        }

        $('.window').removeClass('active');
        $('#' + data[index].id).addClass('active');

        updateProgressBar(index, data.length);

        var currentData = data.find(item => item.id === $('#' + data[index].id).attr('id'));
        var wordRussian = currentData ? currentData.word_russian : 'Соответствующая строка не найдена';
        console.log('Слово на русском:', wordRussian);
    }

    function updateProgress(userId) {
        $.ajax({
            type: "POST",
            url: "update_progress.php", // Замените на адрес вашего PHP скрипта для обновления прогресса пользователя
            data: { user_id: userId, new_score: score },
            success: function (response) {
                console.log("Прогресс пользователя успешно обновлен:", response);
                // Очищаем переменные и выполняем другие действия после успешного обновления прогресса
                score = 0;
                correctAnswersTotal = 0;
                answersCount = 0;
            },
            error: function (xhr, status, error) {
                console.error("Ошибка при обновлении прогресса пользователя:", error);
            }
        });
    }

    function updateLevel(lessonId, userId) {
        $.ajax({
            type: "POST",
            url: "update_level.php",
            data: { lesson_id: lessonId, user_id: userId }, // Убедитесь, что имена параметров совпадают
            success: function(response) {
                console.log("Уровень пользователя успешно обновлен:", response);
            },
            error: function(xhr, status, error) {
                console.error("Ошибка при обновлении уровня пользователя:", error);
            }
        });
    }

    function getUserId(userEmail, lessonId) {
        $.ajax({
            type: "POST",
            url: "getUserId.php",
            data: { user_email: userEmail },
            success: function(response) {
                // При успешном получении ID пользователя
                console.log("User ID:", response);
                // Вызываем функцию updateProgress, передавая полученный ID пользователя
                updateProgress(response.user_id);
                updateLevel(lessonId, response.user_id); // Передаем lessonId в функцию updateLevel

            },
            error: function(xhr, status, error) {
                // Обработка ошибки
                console.error("Ошибка при получении ID пользователя:", error);
            }
        });
    }

    // Функция для обработки нажатия на блок с фразой
    $('#windowsContainer').on('click', '.window', function () {
        var currentWindowId = $(this).attr('id');
        var currentData = data.find(item => item.id === currentWindowId);
        if (currentData) {
            var wordRussian = currentData.word_russian;
            // Создаем элемент для вывода слова на русском
            var wordRussianElement = $('<div>').text(wordRussian).addClass('word-russian');
            // Удаляем предыдущий элемент с русским словом, если такой есть
            $('.word-russian').remove();
            // Вставляем новый элемент с русским словом под текущим окном с фразой
            $(this).after(wordRussianElement);
            
            // Возвращаем фокус на строку ввода
            $('#textInput').focus();
        } else {
            console.error('Соответствующая строка не найдена');
        }
    });

    // Функция загрузки урока на основе его ID
    function loadLesson(language, lessonId) {
        console.log('Loading lesson:', language, lessonId);
        var lessonTable;
        switch (lessonId) {
            case "1":
                lessonTable = 'first_lesson';
                console.log("first_lesson" + lessonId + language);
                break;
            case "2":
                lessonTable = 'second_lesson';
                break;
            case "3":
                lessonTable = 'third_lesson';
                break;
            default:
                console.error('Lesson table not found for lesson ID:', lessonId);
                return;
        }
        loadPhrases(language, lessonTable);
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
            getUserId(userEmail, lessonId);
            return;
        }

        currentIndex++;
        if (currentIndex >= data.length) {
            currentIndex = 0;
        }
        displayWindow(currentIndex);
        $('#textInput').val('');
    });

    // Загружаем урок после получения параметров из URL
    loadLesson(language, lessonId);
});
