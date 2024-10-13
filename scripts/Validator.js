$(document).ready(function () {
    var data;
    var currentIndex = -1;
    var correctAnswersCount = 0;
    var requiredCorrectAnswers = 15;
    var score = 0; // Переменная для отслеживания количества очков
    var correctAnswersTotal = 0; // Количество правильных ответов
    var answersCount = 0; // Количество ответов
    let selectedBlock = null;
    window.courseData = {};


    // Извлечение параметров из URL
    var urlParams = new URLSearchParams(window.location.search);
    var language = urlParams.get('language');
    var completedLessons = urlParams.get('completedLessons');

    // Проверяем, что language присутствует в URL
    if (language) {
        console.log('Language from URL:', language);
    } else {
        console.error('No language found in URL.');
        return;
    }

    // Проверяем, что completedLessons присутствует в URL
    if (completedLessons) {
        console.log('Completed Lessons from URL:', completedLessons);
    } else {
        console.error('No completedLessons found in URL.');
        return;
    }

    // Получаем данные о текущей теме из localStorage
    var currentTopicData = JSON.parse(localStorage.getItem('currentTopicData'));

    if (currentTopicData) {
        console.log('Current Topic Data:', currentTopicData);

        // Получаем lessonId из completed_lessons
        var lessonId = parseInt(completedLessons, 10);
        console.log('Lesson ID:', lessonId);

        // Обновляем completed_lessons_per_topic
        currentTopicData.completed_lessons_per_topic = lessonId;

        // Сохраняем обновленные данные обратно в localStorage
        localStorage.setItem('currentTopicData', JSON.stringify(currentTopicData));

        // Отображаем данные на странице
        $('#completedLessons').text(currentTopicData.completed_lessons_per_topic);
        $('#lessonsPerTopic').text(currentTopicData.lessons_per_topic);

    } else {
        console.error('No current topic data found in localStorage.');
    }

    // Загрузка настроек страницы из localStorage
    var currentTheme = localStorage.getItem('currentTheme');
    var bodyColor = localStorage.getItem('bodyColor');
    var linkColor = localStorage.getItem('linkColor');
    var fillColor = localStorage.getItem('fillColor');
    var profilePageTextColor = localStorage.getItem('profilePageTextColor');
    var settingsPageTextColor = localStorage.getItem('settingsPageTextColor');
    var coursesPageColor = localStorage.getItem('coursesPageColor');
    var currentLanguage = localStorage.getItem('currentLanguage');

    $('body').css('background-color', bodyColor);
    $('#windowsContainer').css('color', profilePageTextColor);
    $('#nextBtn')
        .css('background-color', linkColor)
        .css('box-shadow', `0 2px 25px ${linkColor}`);

    $('.progress').css('background-color', linkColor);
    $('.success-message div, .correct-answers').css('color', settingsPageTextColor);
    $('#hintBlock').css('color', linkColor);
    $('.summaryBlock').css('background-color', bodyColor);
    $('#hintBlock').css('color', linkColor);

    function loadPhrases(language, lessonId, currentLanguage) {
        $.ajax({
            url: '../load_phrases.php',
            method: 'GET', // Изменено на GET, так как сервер ожидает GET-запрос
            data: { language: language, lesson_id: lessonId, interfaceLanguage: currentLanguage },
            dataType: 'json',
            success: function (response) {
                console.log('Full response:', JSON.stringify(response, null, 2));

                // Проверка, что данные существуют и являются массивами с нужными элементами
                if (!response || !Array.isArray(response.questions) || !Array.isArray(response.answers)) {
                    console.error('Invalid data structure:', response);
                    return;
                }


                if (response.questions.length === 0 || response.answers.length === 0) {
                    console.error('Questions or answers array is empty.');
                    return;
                }

                const firstQuestion = response.questions[0];
                const firstAnswer = response.answers[0];


                if (!firstQuestion.text || !firstAnswer.word_russian) {
                    console.error('Missing required fields in questions or answers.');
                    return;
                }

                // Если всё корректно, назначаем data
                data = response; 
                displayWindow(currentIndex);


            },
            error: function (xhr, status, error) {
                console.error('Error loading phrases:', error);
                console.log('Full response:', JSON.stringify(response, null, 2));
            }
        });
    }


    function displayWindow(index) {

      console.log('displayWindow called with index:', index);

        // Обработка индекса -1 для отображения блока с резюме
        if (index === -1) {
            var summaryContent = data.summary ? data.summary : 'Начните урок';

            $('#textInput').hide();
            $('#progressBar').hide();

            $('.summaryBlock').css('display', 'flex').each(function () {
                $(this).html(`
                    <a href="#">
                        <svg width="24" height="24" class="library-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7l10 5 10-5L12 2z"/>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <span class="closeSummaryPopup">&times;</span>
                    <div>${summaryContent}</div>
                `).css({
                    'border': `10px solid ${linkColor} !important`,
                    'color': profilePageTextColor
                }).addClass('visible');

                $('#nextBtn').show().text('Начать урок').off('click').on('click', function () {
                    // Скрываем блок резюме, возвращая класс 'display-none'
                    $('.summaryBlock').addClass('display-none').removeClass('visible');

                    // Переходим к первому заданию
                    currentIndex = 0;
                    displayWindow(currentIndex);
                });
            });

            return;
        }

        // Далее идет основная логика обработки заданий
        if (index >= data.questions.length) {
            showFinalResults();
            return;
        }
        
        const currentQuestion = data.questions[index];
        const currentAnswer = data.answers[index];

        if (!currentQuestion || !currentQuestion.text || !currentAnswer || !currentAnswer.word_russian) {
            console.error('Missing question or answer fields for index:', index);
            return;
        }



        var windowContainer = $('#windowsContainer');
        var answerOptionsContainer = $('#answerOptionsContainer');
        windowContainer.empty();
        answerOptionsContainer.empty();

        // Теперь данные из PHP включают price, chance и rating
        console.log('Price:', currentQuestion.price);  // Выводим цену вопроса
        console.log('Chance:', currentQuestion.chance);  // Выводим шанс
        console.log('Rating:', currentQuestion.rating);  // Выводим рейтинг


       $('#windowsContainer').on('click', '.window', function () {
            // Вместо объекта вставляем конкретное значение поля, например, word_russian
            $('#hintBlock').text(currentAnswer.word_russian).show();
        });

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
                    score += questionPrice;
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
                                score += questionPrice;
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
                var questionPrice = parseInt(currentQuestion.price) || 0; 


                if (checkAnswer(userAnswer, correctAnswer)) {
                    correctAnswersCount++;
                    correctAnswersTotal++;
                    score += questionPrice;
                }

                currentIndex++;
                if (currentIndex < data.questions.length) {
                    updateProgressBar(currentIndex, data.questions.length);
                    displayWindow(currentIndex);
                } else {
                    showFinalResults();
                }
                $('#textInput').val('');
                $('#hintBlock').hide();
            });
        }
    }

    $('#nextBtn').on('click', function () {
        console.log('Next button clicked');

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

        var summaryPopup = $('#summaryPopup');
        if (summaryPopup.length) {
            console.log('Summary popup found, hiding it');
            summaryPopup.css('display', 'none');
        } else {
            console.log('Summary popup not found');
        }
    });
    
    function showFinalResults() {
        $('.main-block').addClass('hidden'); // Скрыть основное содержимое
        $('.success-message').removeClass('hidden'); // Показать блок с результатами
        $('#correctAnswersCount').text(correctAnswersTotal);
        $('#scoreCount').text(score);
        getUserId(lessonId, language);
    }


    function getUserId(lessonId, language) {
        $.ajax({
            type: "POST",
            url: "../getUserId.php",
            data: {},
            success: function (response) {
                console.log("User ID:", response.user_id);
                const topicId = currentTopicData.topic_id;
                updateTopicProgress(response.user_id, topicId, lessonId, score, language);
            },
            error: function (xhr, status, error) {
                console.error("Ошибка при получении ID пользователя:", error);
            }
        });
    }

    function updateTopicProgress(userId, topicId, lessonId, newScore, language) {
        console.log("Отправка данных в updateTopicProgress:", {
            user_id: userId,
            topic_id: topicId,
            lesson_id: lessonId,
            new_score: newScore,
            language: language
        });

        $.ajax({
            type: "POST",
            url: "../update_topic_progress.php",
            data: {
                user_id: userId,
                topic_id: topicId,
                new_score: newScore,
                language: language
            },
            success: function (response) {
                console.log("Прогресс успешно обновлен:", response);
            },
            error: function (xhr, status, error) {
                console.error("Ошибка при обновлении прогресса:", error);
            }
        });
    }

    loadPhrases(language, lessonId, currentLanguage);
});

function checkAnswer(userInput, correctAnswer) {
    var correctAnswers = correctAnswer.split(',').map(answer => answer.trim().toLowerCase());
    return correctAnswers.includes(userInput.toLowerCase()) || userInput === ".";
}
