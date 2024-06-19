$(document).ready(function () {
    var data;
    var currentIndex = 0;
    var correctAnswersCount = 0;
    var requiredCorrectAnswers = 15;
    var score = 0; // Переменная для отслеживания количества очков
    var correctAnswersTotal = 0; // Количество правильных ответов
    var answersCount = 0; // Количество ответов

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
    var currentLanguage = localStorage.getItem('currentLanguage');
    console.log('Актуальная тема в Validator.js:', currentTheme);
    console.log('Learning Language:', currentLanguage);

    // Устанавливаем цвета элементов в соответствии с выбранной темой
    $('body').css('background-color', bodyColor);
    $('#windowsContainer').css('color', profilePageTextColor); 
    $('#nextBtn')
    .css('background-color', linkColor)
    .css('box-shadow', `0 2px 25px ${linkColor}`);
    
    $('.progress').css('background-color', linkColor);
    $('.success-message div, correct-answers').css('color', settingsPageTextColor);



    function loadPhrases(language, lessonId, currentLanguage) {
        $.ajax({
            url: '../load_phrases.php',
            method: 'POST',
            data: { language: language, lesson_id: lessonId, interfaceLanguage: currentLanguage },
            success: function (response) {
                console.log('Learning Language:', currentLanguage);
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
        if (!data || !data.questions || !data.questions[index]) {
            console.error('No data or invalid index:', data, index);
            return;
        }

        var windowContainer = $('#windowsContainer');
        windowContainer.empty();
        var currentWindow = $('#' + data.questions[index].id);

        if (currentWindow.length > 0) {
            currentWindow.text(data.questions[index].text);
        } else {
            var windowContent = '<div id="' + data.questions[index].id + '" class="window active">' + data.questions[index].text + '</div>';
            windowContainer.append(windowContent);
        }

        if (data.questions[index].image_url) {
            var imageUrl = data.questions[index].image_url;
            var imageElement = $('<img>').attr('src', imageUrl).addClass('phrase-image');
            windowContainer.append(imageElement);
        }

        $('.window').removeClass('active');
        $('#' + data.questions[index].id).addClass('active');

        updateProgressBar(index, data.questions.length);

        var currentAnswerColumn = "word_" + currentLanguage.toLowerCase();
        var currentAnswer = data.answers[index][currentAnswerColumn];

        console.log('Current Answer:', currentAnswer);

        $('#windowsContainer').on('click', '.window', function () {
            $('#hintBlock').text(currentAnswer).show();
        });
    }


    // Функция для получения ID пользователя и обновления прогресса и уровня
    function getUserId(lessonId, language) {
        $.ajax({
            type: "POST",
            url: "../getUserId.php",
            data: {},
            success: function(response) {
                console.log("User ID:", response);
                updateProgress(response.user_id, language);
                updateLevel(lessonId, response.user_id, language);
            },
            error: function(xhr, status, error) {
                console.error("Ошибка при получении ID пользователя:", error);
            }
        });
    }

    // Функция обновления прогресс-бара
    function updateProgressBar(currentIndex, totalQuestions) {
        var progressHeight = ((currentIndex + 1) / totalQuestions) * 100;
        $('#progress').css('height', progressHeight + '%'); // Обновляем высоту прогресс-бара
    }

    // Функция проверки правильности ответа
    function checkAnswer(userInput, correctAnswer) {
        return userInput.toLowerCase() === correctAnswer.toLowerCase() || userInput === ".";
    }

    // Функция обработки нажатия на кнопку "Далее"
    $('#nextBtn').on('click', function () {
        var userInput = $('#textInput').val().trim();
        if (!data || !data.questions || !data.questions[currentIndex]) {
            console.error('No data or invalid index:', data, currentIndex);
            return;
        }

        // Увеличиваем счетчик ответов
        answersCount++;

        var currentQuestion = data.questions[currentIndex];
        var currentAnswerColumn = "word_" + currentLanguage.toLowerCase();
        var currentAnswer = data.answers[currentIndex][currentAnswerColumn];

        if (checkAnswer(userInput, currentAnswer)) {
            // Получаем значение price из текущего вопроса и добавляем его к количеству очков
            var price = parseInt(currentQuestion.price) || 0; // Преобразуем значение к числу
            console.log('Price:', price);
            score += price;
            console.log('Updated score:', score);

            // Увеличиваем общее количество правильных ответов
            correctAnswersTotal++;
        }

        // Если достигнуто 15 ответов, показываем сообщение об успешном завершении урока
        if (answersCount === requiredCorrectAnswers) {
            $('.main-block').addClass('hidden');
            $('.success-message').addClass('flex');
            $('.success-message').removeClass('hidden');
            $('#correctAnswersCount').text(correctAnswersTotal); // Обновляем количество правильных ответов
            $('#scoreCount').text(score); // Обновляем количество очков
            getUserId(lessonId, language);
            return;
        }

        currentIndex++;
        if (currentIndex >= data.questions.length) {
            currentIndex = 0;
        }
        displayWindow(currentIndex);
        $('#textInput').val('');

        // Скрываем блок с подсказкой
        $('#hintBlock').hide();

    });

    // Функция для получения и обновления прогресса пользователя
    function updateProgress(userId, language) {
        console.log("Отправка данных в updateProgress:", { user_id: userId, new_score: score, language: language });
        $.ajax({
            type: "POST",
            url: "../update_progress.php",
            data: { user_id: userId, new_score: score, language: language },
            success: function (response) {
                console.log("Прогресс пользователя успешно обновлен:", response);
                score = 0;
                correctAnswersTotal = 0;
                answersCount = 0;
            },
            error: function (xhr, status, error) {
                console.error("Ошибка при обновлении прогресса пользователя:", error);
            }
        });
    }

    // Функция для получения и обновления уровня пользователя
    function updateLevel(lessonId, userId, language) {
        console.log("Отправка данных в updateLevel:", { lesson_id: lessonId, user_id: userId, language: language });
        $.ajax({
            type: "POST",
            url: "../update_level.php",
            data: { lesson_id: lessonId, user_id: userId, language: language },
            success: function(response) {
                console.log("Уровень пользователя успешно обновлен:", response);
            },
            error: function(xhr, status, error) {
                console.error("Ошибка при обновлении уровня пользователя:", error);
            }
        });
    }

    // Загружаем урок после получения параметров из URL
    loadPhrases(language, lessonId, currentLanguage);
});
