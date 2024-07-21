$(document).ready(function () {
    var data;
    var currentIndex = -1;
    var correctAnswersCount = 0;
    var requiredCorrectAnswers = 15;
    var score = 0; // Переменная для отслеживания количества очков
    var correctAnswersTotal = 0; // Количество правильных ответов
    var answersCount = 0; // Количество ответов
    let selectedBlock = null;



    updateProgressBar(1, 21);

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
    /*console.log('Актуальная тема в Validator.js:', currentTheme);*/
   /* console.log('Learning Language:', currentLanguage);*/

    // Устанавливаем цвета элементов в соответствии с выбранной темой
    $('body').css('background-color', bodyColor);
    $('#windowsContainer').css('color', profilePageTextColor); 
    $('#nextBtn')
        .css('background-color', linkColor)
        .css('box-shadow', `0 2px 25px ${linkColor}`);
    
    $('.progress').css('background-color', linkColor);
    $('.success-message div, correct-answers').css('color', settingsPageTextColor);
    $('#hintBlock').css('color', linkColor);
    

function loadPhrases(language, lessonId, currentLanguage) {
    $.ajax({
        url: '../load_phrases.php',
        method: 'POST',
        data: { language: language, lesson_id: lessonId, interfaceLanguage: currentLanguage },
        dataType: 'json',
        success: function (response) {
            /*console.log('Learning Language:', currentLanguage);*/
            console.log('Phrases loaded:', response);
            data = response;
            if (data && data.questions && data.answers) {
                /*console.log('Data structure:', data);*/
                displayWindow(currentIndex);
            } else {
                console.error('Invalid data structure:', data);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading phrases:', error);
        }
    });
}




function displayWindow(index) {
  /*  console.log('Display window index:', index);
    console.log('Data:', data);*/

    if (index === -1) {
        if (!data || !data.answers || !data.answers[0] || !data.answers[0].summary) {
            console.error('No summary data or invalid structure:', data);
            return;
        }

        var summaryContent = data.answers[0].summary;
        var summaryElement = $('<div>').html(summaryContent);

        summaryElement.css({
            'border': `10px solid ${linkColor} !important`
        });

        var windowContainer = $('#windowsContainer');
        windowContainer.empty();
        windowContainer.append(summaryElement);

        var iconLink = $('<a>').attr('href', '../library.html');
        var svgIcon = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5L12 2z" fill="#fff"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        answerOptionsContainer.hide();
        progressBar.hide();

        iconLink.html(svgIcon);
        summaryElement.prepend(iconLink);
        setTimeout(function() {
                    var linkColor = localStorage.getItem('linkColor');
                    var profilePageTextColor = localStorage.getItem('profilePageTextColor');

                    summaryElement.css({
                        'border': `2px solid ${linkColor}`, // Рамка цвета темы
                        'padding': '10px', // Отступы внутри блока
                        'margin': '20px auto', // Автоматические отступы по бокам для центрирования
                        'width': '600px', // Ширина блока (можете изменить по необходимости)
                        'box-sizing': 'border-box', // Учитывать отступы и границу в ширине блока
                        'color': profilePageTextColor, // Цвет текста
                    });


                    // Проверка стилей summaryElement
                    console.log('Applied styles to summaryElement:', summaryElement.attr('style'));

                    // Проверка видимости элемента
                    if (summaryElement.is(':visible')) {
                        console.log('Summary element is visible');
                    } else {
                        console.error('Summary element is not visible');
                    }

                    // Проверка количества элементов с классом 'summary'
                    console.log('Number of .summary elements:', $('.summary').length);
                }, 100); // Задержка в 100 миллисекунд, чтобы убедиться, что элемент уже в DOM

        $('#nextBtn').show().text('Начать урок').off('click').on('click', function () {
            currentIndex++;
            displayWindow(currentIndex);
           /* console.log('Initial display window after start:', currentIndex);*/
        });
        return;
    }

    if (index >= data.questions.length) {
       /* console.log('All questions completed.');*/
        showFinalResults();
        return;
    }

    if (!data || !data.questions || !data.answers || !data.questions[index] || !data.answers[index]) {
       /* console.error('No data or invalid index:', data, index);*/
        return;
    }

    var windowContainer = $('#windowsContainer');
    var answerOptionsContainer = $('#answerOptionsContainer');
    windowContainer.empty();
    answerOptionsContainer.empty();

    if (index === -1) {
    var summaryContent = data.answers[0].summary; // Получаем summary из первой строки answers
    var summaryElement = $('<div>').addClass('summary').html(summaryContent);
    windowContainer.append(summaryElement);
    $('#nextBtn').show().text('Начать урок').off('click').on('click', function () {
        currentIndex++;
        displayWindow(currentIndex);
    });
    return;
}

    var currentQuestion = data.questions[index];
    var currentAnswerColumn = "word_" + currentLanguage.toLowerCase();
    var currentAnswer = data.answers[index][currentAnswerColumn];
    var questionPrice = parseInt(currentQuestion.price) || 0; // Убедитесь, что цена задания корректно парсится

  /*  console.log('Current Question:', currentQuestion);
    console.log('Current Answer:', currentAnswer);*/

    $('#windowsContainer').on('click', '.window', function () { $('#hintBlock').text(currentAnswer).show(); });

    $('#hintBlock').hide();

    if (currentQuestion.task_type === "multiple_choice" && data.answers[index].possible_answers) {
        $('#textInput').hide();
        $('#nextBtn').hide();

        var currentWindow = $('<div id="' + currentQuestion.id + '" class="window active">' + currentQuestion.text + '</div>');
        windowContainer.append(currentWindow);

        var possibleAnswers = data.answers[index].possible_answers.split(',');

        possibleAnswers.forEach(answer => {
            var isCorrect = answer.trim() === data.answers[index].word_russian;
            var answerBlock = $('<div>')
                .addClass('answer-block')
                .text(answer.trim())
                .attr('data-correct', isCorrect);

            answerOptionsContainer.append(answerBlock);
        });

        $('.answer-block').on('click', function () {
            var isCorrect = $(this).attr('data-correct') === 'true';
            if (isCorrect) {
                $(this).addClass('correct');
                score += questionPrice; // Добавляем цену задания к общему счету
                currentIndex++;
                if (currentIndex < data.questions.length) {
                    displayWindow(currentIndex);
                    console.log('Next index after correct multiple choice:', currentIndex);
                } else {
                    showFinalResults();
                }
            } else {
                $(this).addClass('incorrect');
            }
        });

    } else if (currentQuestion.task_type === "matches" && data.matches) {
        $('#textInput').hide();
        $('#nextBtn').hide();

        var matchesData = data.matches.find(match => match.question_id === currentQuestion.id);
        if (matchesData) {
            var questions = matchesData.questions.split(',').map(q => q.trim());
            var answers = matchesData.answers.split(',').map(a => a.trim());

            var questionsContainer = $('<div>').addClass('matches-questions');
            var answersContainer = $('<div>').addClass('matches-answers');

            questions.forEach((question, idx) => {
                var questionBlock = $('<div>')
                    .addClass('answer-block question-block')
                    .text(question)
                    .attr('data-type', 'question')
                    .attr('data-id', idx);

                questionsContainer.append(questionBlock);
            });

            answers.forEach((answer, idx) => {
                var answerBlock = $('<div>')
                    .addClass('answer-block')
                    .text(answer)
                    .attr('data-type', 'answer')
                    .attr('data-id', idx);

                answersContainer.append(answerBlock);
            });

            var matchesContainer = $('<div>').addClass('matches-container');
            matchesContainer.append(questionsContainer);
            matchesContainer.append(answersContainer);
            answerOptionsContainer.append(matchesContainer);

            let correctMatches = 0;

            $('.answer-block').on('click', function () {
                if (selectedBlock === null) {
                    selectedBlock = $(this);
                    $(this).addClass('selected');
                } else {
                    if ($(this).attr('data-type') !== selectedBlock.attr('data-type')) {
                        var questionBlock = selectedBlock.attr('data-type') === 'question' ? selectedBlock : $(this);
                        var answerBlock = selectedBlock.attr('data-type') === 'answer' ? selectedBlock : $(this);

                        var questionId = questionBlock.attr('data-id');
                        var answerId = answerBlock.attr('data-id');

                        var isCorrect = questionId === answerId;

                        if (isCorrect) {
                            questionBlock.css('background-color', 'rgb(21, 230, 112)');
                            answerBlock.css('background-color', 'rgb(21, 230, 112)');
                            correctMatches++;
                        } else {
                            questionBlock.css('background-color', '#ff0081');
                            answerBlock.css('background-color', '#ff0081');
                        }

                        questionBlock.add(answerBlock).removeClass('selected');
                        selectedBlock = null;

                        if (correctMatches === questions.length) {
                            score += questionPrice; // Добавляем цену задания к общему счету
                            currentIndex++;
                            if (currentIndex < data.questions.length) {
                                displayWindow(currentIndex);
                                console.log('Next index after correct matches:', currentIndex);
                            } else {
                                showFinalResults();
                            }
                        }
                    } else {
                        selectedBlock.removeClass('selected');
                        selectedBlock = $(this).addClass('selected');
                    }
                }
            });

            return;
        }

    } else {
        var currentWindow = $('<div id="' + currentQuestion.id + '" class="window active">' + currentQuestion.text + '</div>');
        windowContainer.append(currentWindow);

        $('#textInput').show().val('');
        $('#nextBtn').show().text('Далее').off('click').on('click', function () {
            var userAnswer = $('#textInput').val().trim();
            var correctAnswer = data.answers[index].word_russian;

            if (checkAnswer(userAnswer, correctAnswer)) {
                correctAnswersCount++;
                correctAnswersTotal++;
                score += questionPrice; // Добавляем цену задания к общему счету
            }

            currentIndex++;
            if (currentIndex < data.questions.length) {
                updateProgressBar(currentIndex, data.questions.length);
                displayWindow(currentIndex);
                /*console.log('Next index after text input:', currentIndex);*/
            } else {
                showFinalResults();
            }
            $('#textInput').val('');
            $('#hintBlock').hide();
        });
    }
}




$('#nextBtn').on('click', function () {
    if (!data || !data.questions || !data.answers || !data.questions[currentIndex] || !data.answers[currentIndex]) {
        console.error('No data or invalid index:', data, currentIndex);
        return;
    }

    var currentQuestion = data.questions[currentIndex];
    var currentAnswerColumn = "word_" + currentLanguage.toLowerCase();
    var currentAnswer = data.answers[currentIndex][currentAnswerColumn];

    $('#hintBlock').text(currentAnswer).hide();

    if (currentQuestion.task_type !== "matches") {
        var userInput = $('#textInput').val().trim();
        answersCount++;

        if (checkAnswer(userInput, currentAnswer)) {
            var price = parseInt(currentQuestion.price) || 0;
            console.log('Price:', price);
            score += price;
            console.log('Updated score:', score);
            correctAnswersTotal++;
            updateProgressBar(currentIndex + 1, data.questions.length);
            currentIndex++;
            if (currentIndex >= data.questions.length) {
                showFinalResults();
            } else {
                displayWindow(currentIndex);
            }
        } else {
            $('#hintBlock').text(currentAnswer).show();
        }

        if (answersCount === requiredCorrectAnswers) {
            showFinalResults();
            return;
        }

        if (currentIndex >= data.questions.length) {
            showFinalResults();
        }
        $('#textInput').val('');
        $('#hintBlock').hide();
    }
});


function showFinalResults() {
    $('.main-block').addClass('hidden');
    $('.success-message').addClass('flex').removeClass('hidden');
    $('#correctAnswersCount').text(correctAnswersTotal);
    $('#scoreCount').text(score);
    getUserId(lessonId, language); // Отправляем данные на сервер
}


function getUserId(lessonId, language) {
    $.ajax({
        type: "POST",
        url: "../getUserId.php",
        data: {},
        success: function (response) {
            console.log("User ID:", response);
            updateProgress(response.user_id, language);
            updateLevel(lessonId, response.user_id, language);
        },
        error: function (xhr, status, error) {
            console.error("Ошибка при получении ID пользователя:", error);
        }
    });
}


function updateProgress(userId, language) {
    $.ajax({
        type: "POST",
        url: "../update_progress.php",
        data: {
            user_id: userId,
            new_score: score, // Передаем обновленное значение очков
            language: language
        },
        success: function (response) {
            console.log("Прогресс обновлен:", response);
        },
        error: function (xhr, status, error) {
            console.error("Ошибка при обновлении прогресса:", error);
        }
    });
}





function updateLevel(lessonId, userId, language) {
    console.log("Отправка данных в updateLevel:", { lesson_id: lessonId, user_id: userId, language: language });
    $.ajax({
        type: "POST",
        url: "../update_level.php",
        data: { lesson_id: lessonId, user_id: userId, language: language },
        success: function (response) {
            console.log("Уровень пользователя успешно обновлен:", response);
        },
        error: function (xhr, status, error) {
            console.error("Ошибка при обновлении уровня пользователя:", error);
        }
    });
}

loadPhrases(language, lessonId, currentLanguage);
});

function checkAnswer(userInput, correctAnswer) {
    var correctAnswers = correctAnswer.split(',').map(answer => answer.trim().toLowerCase());
    // Проверка на правильный ответ или точку
    return correctAnswers.includes(userInput.toLowerCase()) || userInput === ".";
}