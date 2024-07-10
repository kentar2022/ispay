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
    var answerOptionsContainer = $('#answerOptionsContainer');
    windowContainer.empty();
    answerOptionsContainer.empty(); // Очищаем контейнер для ответов

    var currentQuestion = data.questions[index];
    var currentWindow = $('#' + currentQuestion.id);

    if (currentWindow.length > 0) {
        currentWindow.text(currentQuestion.text);
    } else {
        var windowContent = '<div id="' + currentQuestion.id + '" class="window active">' + currentQuestion.text + '</div>';
        windowContainer.append(windowContent);
    }

    if (currentQuestion.image_url) {
        var imageUrl = currentQuestion.image_url;
        var imageElement = $('<img>').attr('src', imageUrl).addClass('phrase-image');
        windowContainer.append(imageElement);
    }

    $('.window').removeClass('active');
    $('#' + currentQuestion.id).addClass('active');

    updateProgressBar(index, data.questions.length);

    var currentAnswerColumn = "word_" + currentLanguage.toLowerCase();
    var currentAnswer = data.answers[index][currentAnswerColumn];

    console.log('Current Answer:', currentAnswer);

    $('#hintBlock').hide();

    if (currentQuestion.task_type === "multiple_choice" && data.answers[index].possible_answers) {
        // Получаем список возможных ответов
        var possibleAnswers = data.answers[index].possible_answers.split(',');

        // Отображаем каждый возможный ответ
        possibleAnswers.forEach(answer => {
            var isCorrect = answer.trim() === data.answers[index].word_russian;
            var answerBlock = $('<div>')
                .addClass('answer-block')
                .text(answer.trim())
                .attr('data-correct', isCorrect); // Добавляем атрибут, чтобы указать правильный ответ

            answerOptionsContainer.append(answerBlock);
        });

        $('.answer-block').on('click', function () {
            var isCorrect = $(this).attr('data-correct') === 'true';
            if (isCorrect) {
                $(this).addClass('correct');
                alert('Правильно!');
                // Переход к следующему вопросу
                currentIndex++;
                if (currentIndex >= data.questions.length) {
                    currentIndex = 0;
                }
                displayWindow(currentIndex);
            } else {
                $(this).addClass('incorrect');
                alert('Неправильно, попробуйте снова.');
            }
        });

        // Скрываем текстовое поле ввода и кнопку "Далее" для заданий типа multiple_choice
        $('#textInput').hide();
        $('#nextBtn').hide();
    } else {
        // Показываем текстовое поле ввода и кнопку "Далее" для обычных заданий
        $('#textInput').show();
        $('#nextBtn').show();
    }

    $('#windowsContainer').on('click', '.window', function () {
        $('#hintBlock').text(currentAnswer).show();
    });
}

// Функция обработки нажатия на кнопку "Далее"
$('#nextBtn').on('click', function () {
    if (!data || !data.questions || !data.questions[currentIndex]) {
        console.error('No data or invalid index:', data, currentIndex);
        return;
    }

    var currentQuestion = data.questions[currentIndex];
    $('#hintBlock').text('').hide(); // Скрываем и очищаем подсказку при нажатии на кнопку "Далее"

    // Если текущий вопрос не multiple_choice, обрабатываем как обычно
    if (currentQuestion.task_type !== "multiple_choice") {
        var userInput = $('#textInput').val().trim();

        // Увеличиваем счетчик ответов
        answersCount++;

        var currentAnswerColumn = "word_" + currentLanguage.toLowerCase();
        var currentAnswer = data.answers[currentIndex][currentAnswerColumn];

        if (checkAnswer(userInput, currentAnswer)) {
            var price = parseInt(currentQuestion.price) || 0; // Преобразуем значение к числу
            console.log('Price:', price);
            score += price;
            console.log('Updated score:', score);

            // Увеличиваем общее количество правильных ответов
            correctAnswersTotal++;
        }

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
    } else {
        currentIndex++;
        if (currentIndex >= data.questions.length) {
            currentIndex = 0;
        }
        displayWindow(currentIndex);
    }
});



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
        if (!data || !data.questions || !data.questions[currentIndex]) {
            console.error('No data or invalid index:', data, currentIndex);
            return;
        }

        var currentQuestion = data.questions[currentIndex];
        $('#hintBlock').text(currentAnswer).hide(); // Скрываем подсказку при нажатии на кнопку "Далее"

        // Если текущий вопрос не multiple_choice, обрабатываем как обычно
        if (currentQuestion.task_type !== "multiple_choice") {
            var userInput = $('#textInput').val().trim();

            // Увеличиваем счетчик ответов
            answersCount++;

            var currentAnswerColumn = "word_" + currentLanguage.toLowerCase();
            var currentAnswer = data.answers[currentIndex][currentAnswerColumn];

            if (checkAnswer(userInput, currentAnswer)) {
                var price = parseInt(currentQuestion.price) || 0; // Преобразуем значение к числу
                console.log('Price:', price);
                score += price;
                console.log('Updated score:', score);

                // Увеличиваем общее количество правильных ответов
                correctAnswersTotal++;
            }

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

            $('#hintBlock').hide(); // Скрываем подсказку для следующего вопроса
        }
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
