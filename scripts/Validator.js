$(document).ready(function () {
    var data;
    var currentIndex = -1;
    var correctAnswersCount = 0;
    var requiredCorrectAnswers = 15;
    var score = 0;
    var correctAnswersTotal = 0;
    var answersCount = 0;
    let selectedBlock = null;
    let failedQuestions = new Set();
    let originalQuestionsOrder = [];
    window.courseData = {};

    // Извлечение параметров из URL
    var urlParams = new URLSearchParams(window.location.search);
    var language = urlParams.get('language');
    var completedLessons = urlParams.get('completedLessons');
    var topicId = urlParams.get('topicId');

    console.log('URL parameters:', { language, topicId, completedLessons });


    // Проверяем, что language присутствует в URL
    if (language) {
        console.log('Language from URL:', language);
    } else {
        console.error('No language found in URL.');
        return;
    }

    if (topicId) {
        console.log('Topic ID from URL:', topicId);
    } else {
        console.error('No topicId found in URL.');
        return;  // Прекращаем выполнение, если topicId отсутствует
    }

    // Проверяем, что completedLessons присутствует в URL
    var lessonId;
    if (completedLessons) {
        lessonId = parseInt(completedLessons, 10);
        console.log('Lesson ID from URL:', lessonId);
    } else {
        console.error('No completedLessons found in URL.');
    }

    // Отображаем данные на странице, если это необходимо
    if (lessonId) {
        $('#completedLessons').text(lessonId);
    }

    if (lessonId) {
        $('#completedLessons').text(lessonId);
    }

    // Функция для загрузки урока
    loadLesson(language, lessonId, topicId);

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

    function loadLesson(language, lessonId, topicId) {
        // Показываем индикатор загрузки
        $('.main-block').append('<div id="loadingIndicator">Загрузка урока...</div>');
        $('#loadingIndicator').css({
            'position': 'fixed',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'background-color': '#fff',
            'padding': '20px',
            'border-radius': '5px',
            'box-shadow': '0 0 10px rgba(0,0,0,0.2)',
            'z-index': 1000
        });

        // Очищаем предыдущие данные
        data = null;
        currentIndex = -1;

        console.log('=== Debug loadLesson ===');
        console.log('Trying to load lesson with params:', {
            language: language,
            lessonId: lessonId,
            topicId: topicId,
            fullUrl: window.location.href
        });
        console.log('Ajax URL will be:', '../load_phrases.php');
        console.log('Current script location:', document.currentScript?.src);
        console.log('=== Debug End ===');        

        $.ajax({
            url: '../load_phrases.php',
            method: 'GET',
            data: { language: language, lesson_id: lessonId, topic_id: topicId },
            dataType: 'json',
            success: function (response) {
                console.log('Full response:', response);
                $('#loadingIndicator').remove();

                // Проверяем, есть ли сообщение об ошибке от сервера
                if (response.error) {
                    console.error('Server error:', response.error);
                    showError(`Ошибка: ${response.error}`);
                    return;
                }

                // Проверяем структуру данных
                if (!response.questions || !Array.isArray(response.questions)) {
                    console.error('Invalid questions data:', response);
                    showError('Ошибка в структуре данных урока');
                    return;
                }

                if (!response.answers || !Array.isArray(response.answers)) {
                    console.error('Invalid answers data:', response);
                    showError('Ошибка в структуре ответов');
                    return;
                }

                if (response.questions.length === 0) {
                    console.error('No questions in lesson');
                    showError('В уроке нет заданий');
                    return;
                }

                // Проверяем каждый вопрос на валидность
                const validQuestions = response.questions.filter(q => {
                    if (!q || !q.text || !q.task_type) {
                        console.warn('Invalid question format:', q);
                        return false;
                    }
                    return true;
                });

                if (validQuestions.length === 0) {
                    console.error('No valid questions found');
                    showError('Не найдено корректных заданий');
                    return;
                }

                // Сохраняем только валидные данные
                data = {
                    ...response,
                    questions: validQuestions
                };

                // Начинаем урок
                currentIndex = -1;
                displayWindow(currentIndex);
                console.log('Lesson loaded successfully with', validQuestions.length, 'questions');
            },
            error: function (xhr, status, error) {
                console.error('AJAX error:', { xhr, status, error });
                $('#loadingIndicator').remove();
                showError('Ошибка при загрузке урока. Пожалуйста, попробуйте позже.');
            }
        });
    }

    function showError(message) {
        // Убираем предыдущие сообщения об ошибках, если они есть
        $('#errorMessage, #loadingIndicator').remove();
        
        const errorDiv = $('<div>')
            .attr('id', 'errorMessage')
            .css({
                'position': 'fixed',
                'top': '50%',
                'left': '50%',
                'transform': 'translate(-50%, -50%)',
                'background-color': '#ffebee',
                'color': '#c62828',
                'padding': '20px',
                'border-radius': '5px',
                'box-shadow': '0 0 10px rgba(0,0,0,0.2)',
                'z-index': 1000,
                'text-align': 'center'
            })
            .html(`
                <div style="margin-bottom: 15px">${message}</div>
                <button onclick="location.reload()" style="margin-right: 10px">Повторить</button>
                <button onclick="window.history.back()" style="background-color: #666">Назад</button>
            `);

        $('.main-block').append(errorDiv);

        // Стилизуем кнопки
        $('#errorMessage button').css({
            'padding': '8px 15px',
            'border': 'none',
            'border-radius': '3px',
            'background-color': '#c62828',
            'color': 'white',
            'cursor': 'pointer',
            'margin': '0 5px'
        });
    }

    // Также добавим функцию для проверки состояния загрузки
    function isLessonLoaded() {
        return data !== null && Array.isArray(data.questions) && data.questions.length > 0;
    }


    // Обработчик multiple choice заданий
    function handleMultipleChoice(currentQuestion, windowContainer, answerOptionsContainer) {
        console.log('Displaying multiple choice question');
        $('#textInput, #nextBtn').hide();

        const possibleAnswers = typeof currentQuestion.possible_answers === 'string' 
            ? currentQuestion.possible_answers.split(',') 
            : currentQuestion.possible_answers;

        const correctAnswer = currentQuestion.answer;
        console.log('Question:', currentQuestion.text);
        console.log('Possible answers:', possibleAnswers);
        console.log('Correct answer:', correctAnswer);

        possibleAnswers.forEach(answer => {
            const isCorrect = answer.trim() === correctAnswer;
            const answerBlock = $('<div>')
                .addClass('answer-block')
                .text(answer.trim())
                .attr('data-correct', isCorrect);

            answerOptionsContainer.append(answerBlock);
        });

        $('.answer-block').on('click', function() {
            const $this = $(this);
            const isCorrect = $this.attr('data-correct') === 'true';

            if (isCorrect) {
                const wordRussian = currentQuestion.text; 
                const wordChechen = correctAnswer; 
                const userId = 1;

                saveLearnedWord(userId, wordRussian, wordChechen);
                $this.addClass('correct');
                correctAnswersCount++;
                correctAnswersTotal++;
                score += parseInt(currentQuestion.price) || 0;

                setTimeout(() => {
                    currentIndex++;
                    // Добавляем обновление прогресс-бара
                    updateProgressBar(currentIndex, data.questions.length);
                    
                    // Проверяем, нужно ли показывать финальные результаты
                    if (currentIndex >= data.questions.length) {
                        showFinalResults();
                    } else {
                        // Проверяем следующий вопрос перед его отображением
                        const nextQuestion = data.questions[currentIndex];
                        if (!nextQuestion) {
                            console.error('Next question not found:', currentIndex);
                            showFinalResults();
                            return;
                        }
                        displayWindow(currentIndex);
                    }
                }, 1000);
            } else {
                handleWrongAnswer(currentIndex);
                $this.addClass('incorrect');
                $('#hintBlock').text(correctAnswer).show();
            }
        });
    }


    // Функция для управления порядком вопросов
    function handleWrongAnswer(currentIndex) {
        failedQuestions.add(currentIndex);
        
        // Если это первая ошибка, сохраняем оригинальный порядок
        if (originalQuestionsOrder.length === 0) {
            originalQuestionsOrder = [...data.questions];
        }
    }

    function calculateStringSimilarity(str1, str2) {
        // Приводим строки к нижнему регистру и убираем пробелы по краям
        str1 = str1.toLowerCase().trim();
        str2 = str2.toLowerCase().trim();
        
        if (str1 === str2) return 1.0; // Полное совпадение
        if (str1.length < 2 || str2.length < 2) return 0.0;

        // Создаем массивы биграмм (пар символов)
        let bigrams1 = new Set();
        let bigrams2 = new Set();
        
        for (let i = 0; i < str1.length - 1; i++) {
            bigrams1.add(str1.slice(i, i + 2));
        }
        
        for (let i = 0; i < str2.length - 1; i++) {
            bigrams2.add(str2.slice(i, i + 2));
        }

        // Находим пересечение биграмм
        let intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
        
        // Вычисляем коэффициент схожести
        return (2.0 * intersection.size) / (bigrams1.size + bigrams2.size);
    }

    // Обработчик matches заданий
    function handleMatches(currentQuestion, windowContainer, answerOptionsContainer) {
        console.log('Processing matches question:', currentQuestion);
        $('#textInput, #nextBtn').hide();

        const state = {
            selectedBlock: null,
            matchedPairs: new Set(),
            totalPairs: currentQuestion.matches.questions.length,
            isAnimating: false
        };

        // Создание структуры для matches
        const matchesContainer = $('<div>').addClass('matches-container');
        const questionsCol = $('<div>').addClass('matches-questions');
        const answersCol = $('<div>').addClass('matches-answers');

        // Создание вопросов
        currentQuestion.matches.questions.forEach((question, idx) => {
            $('<div>')
                .addClass('answer-block')
                .attr({
                    'data-type': 'question',
                    'data-id': idx,
                    'data-status': 'unmatched'
                })
                .text(question)
                .appendTo(questionsCol);
        });

        // Создание и перемешивание ответов
        const shuffledAnswers = [...currentQuestion.matches.answers];
        for (let i = shuffledAnswers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
        }

        shuffledAnswers.forEach((answer, idx) => {
            $('<div>')
                .addClass('answer-block')
                .attr({
                    'data-type': 'answer',
                    'data-id': currentQuestion.matches.answers.indexOf(answer),
                    'data-status': 'unmatched'
                })
                .text(answer)
                .appendTo(answersCol);
        });

        matchesContainer.append(questionsCol, answersCol);
        answerOptionsContainer.append(matchesContainer);

        // Вспомогательные функции
        const helpers = {
            canInteract: (block) => {
                return !state.isAnimating && 
                       block.attr('data-status') !== 'matched' &&
                       (!state.selectedBlock || !state.selectedBlock.is(block));
            },

            animateIncorrect: (block) => {
                state.isAnimating = true;
                block.removeClass('selected').addClass('incorrect');
                setTimeout(() => {
                    block.removeClass('incorrect');
                    state.isAnimating = false;
                }, 1000);
            },

            handleMatch: (block1, block2) => {
                const pairId = block1.attr('data-id');
                state.matchedPairs.add(pairId);
                
                block1.removeClass('selected');
                block2.removeClass('selected');
                
                setTimeout(() => {
                    block1.attr('data-status', 'matched').addClass('correct');
                    block2.attr('data-status', 'matched').addClass('correct');

                    if (state.matchedPairs.size === state.totalPairs) {
                        score += parseInt(currentQuestion.price) || 0;
                        correctAnswersTotal++;
                        setTimeout(() => {
                            currentIndex++;
                            displayWindow(currentIndex);
                        }, 1000);
                    }
                }, 50);
            }
        };

        // Обработчики событий
        $('.answer-block').on('click', function() {
            const $this = $(this);
            
            if (!helpers.canInteract($this)) return;

            if (!state.selectedBlock) {
                state.selectedBlock = $this;
                $this.addClass('selected');
                return;
            }

            if ($this.attr('data-type') === state.selectedBlock.attr('data-type')) {
                state.selectedBlock.removeClass('selected');
                state.selectedBlock = $this;
                $this.addClass('selected');
                return;
            }

            const firstId = parseInt(state.selectedBlock.attr('data-id'));
            const secondId = parseInt($this.attr('data-id'));

            if (firstId === secondId) {
                helpers.handleMatch(state.selectedBlock, $this);
            } else {
                helpers.animateIncorrect(state.selectedBlock);
                helpers.animateIncorrect($this);
            }
            
            state.selectedBlock = null;
        });

        // Эффекты при наведении
        $('.answer-block')
            .on('mouseenter', function() {
                if ($(this).attr('data-status') !== 'matched') {
                    $(this).addClass('hover');
                }
            })
            .on('mouseleave', function() {
                $(this).removeClass('hover');
            });
    }

    // Обработчик обычных заданий
    function handleDefaultQuestion(currentQuestion, currentAnswer, windowContainer) {
        $('#textInput').show().val('');
        $('#nextBtn').show().text('Далее').off('click').on('click', function() {
            const userAnswer = $('#textInput').val().trim();
            if (checkAnswer(userAnswer, currentAnswer.answer)) {
                correctAnswersCount++;
                correctAnswersTotal++;
                score += parseInt(currentQuestion.price) || 0;
                currentIndex++;
                updateProgressBar(currentIndex, data.questions.length);
                displayWindow(currentIndex);
            } else {
                handleWrongAnswer(currentIndex);
                $('#hintBlock').text(currentAnswer.answer).show();
            }
            $('#textInput').val('');
        });
    }


    function displayWindow(index) {

        console.log('displayWindow called with index:', index);


        if (!isLessonLoaded()) {
            console.error('No lesson data available');
            return;
        }

        // Проверка наличия данных
        if (!data || !data.questions) {
            console.error('No lesson data available');
            return;
        }
        
        // Обработка начального экрана (index === -1)
        if (index === -1) {
            const summaryContent = data.summary ? data.summary : 'Начните урок';
            $('#textInput, #progressBar').hide();

            $('.summaryBlock')
                .css('display', 'flex')
                .html(`
                    <a href="#">
                        <svg width="24" height="24" class="library-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7l10 5 10-5L12 2z"/>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <span class="closeSummaryPopup">&times;</span>
                    <div>${summaryContent}</div>
                `)
                .css({
                    'border': `10px solid ${linkColor} !important`,
                    'color': profilePageTextColor
                })
                .addClass('visible');

            $('#nextBtn')
                .show()
                .text('Начать урок')
                .off('click')
                .on('click', function() {
                    $('.summaryBlock').addClass('hidden').removeClass('visible');
                    currentIndex = 0;
                    displayWindow(currentIndex);
                });

            return;
        }

        // Если дошли до конца обычных вопросов, показываем вопросы с ошибками
        if (index >= data.questions.length && failedQuestions.size > 0) {
            const failedQuestionsArray = [...failedQuestions];
            // Очищаем Set, чтобы можно было снова добавлять новые ошибки
            failedQuestions.clear();
            
            // Добавляем вопросы с ошибками в конец
            data.questions = [
                ...originalQuestionsOrder.filter((_, i) => !failedQuestionsArray.includes(i)),
                ...failedQuestionsArray.map(i => originalQuestionsOrder[i])
            ];
            
            // Обновляем индекс, чтобы показать первый из перенесенных вопросов
            currentIndex = data.questions.length - failedQuestionsArray.length;
            return displayWindow(currentIndex);
        }

        // Подготовка данных текущего вопроса
        const currentQuestion = data.questions[index];
        if (!currentQuestion) {
            console.error('Question not found for index:', index);
            showFinalResults();
            return;
        }

        // Для не-matches заданий нужен ответ
        const currentAnswer = currentQuestion.task_type !== 'matches' 
            ? data.answers.find(a => a.id === currentQuestion.id)
            : null;

        // Проверки валидности данных
        if (!currentQuestion.text) {
            console.error('Question has no text, index:', index);
            showFinalResults();
            return;
        }

        if (currentQuestion.task_type !== 'matches' && (!currentAnswer || !currentAnswer.answer)) {
            console.error('Answer not found for question:', currentQuestion.id);
            showFinalResults();
            return;
        }

        // Подготовка контейнеров
        const windowContainer = $('#windowsContainer');
        const answerOptionsContainer = $('#answerOptionsContainer');
        windowContainer.empty().off('click', '.window');
        answerOptionsContainer.empty();
        $('#hintBlock').hide();

        // Добавление текста вопроса
        const currentWindow = $('<div>')
            .attr('id', currentQuestion.id)
            .addClass('window active')
            .text(currentQuestion.text);
        
        windowContainer.append(currentWindow);

        // Настройка подсказок для не-matches заданий
        if (currentQuestion.task_type !== 'matches') {
            windowContainer.on('click', '.window', function() {
                if (currentAnswer && currentAnswer.answer) {
                    $('#hintBlock').text(currentAnswer.answer).show();
                }
            });
        }

        // Обработка разных типов заданий
        if (currentQuestion.task_type === "multiple_choice" && currentQuestion.possible_answers) {
            handleMultipleChoice(currentQuestion, windowContainer, answerOptionsContainer);
        }
        else if (currentQuestion.task_type === "matches" && currentQuestion.matches) {
            handleMatches(currentQuestion, windowContainer, answerOptionsContainer);
        }
        else {
            handleDefaultQuestion(currentQuestion, currentAnswer, windowContainer);
        }

        // Обновляем прогресс-бар
        updateProgressBar(index, data.questions.length);
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
        $('.main-block').addClass('hidden'); 
        $('.success-message').removeClass('hidden'); 
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
                // Используем topicId из URL параметров
                const urlTopicId = urlParams.get('topicId');
                updateTopicProgress(response.user_id, urlTopicId, score, language);
            },
            error: function (xhr, status, error) {
                console.error("Ошибка при получении ID пользователя:", error);
            }
        });
    }

    function updateTopicProgress(userId, topicId, newScore, language) {
        console.log("Отправка данных в updateTopicProgress:", {
            user_id: userId,
            topic_id: topicId,
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

    function checkAnswer(userInput, correctAnswer) {
        // Если это точка (пропуск), сразу возвращаем true
        if (userInput === ".") return true;

        // Разбиваем правильный ответ на варианты
        const correctAnswers = correctAnswer.split(',').map(answer => answer.trim());
        
        // Проверяем каждый вариант ответа
        return correctAnswers.some(answer => {
            const similarity = calculateStringSimilarity(userInput, answer);
            console.log(`Similarity between "${userInput}" and "${answer}": ${similarity}`);
            return similarity >= 0.7; // 80% схожесть
        });
    }

    });

function saveLearnedWord(userId, wordRussian, wordChechen) {
    $.ajax({
        type: "POST",
        url: "../learned_words/add_word.php", // Серверный скрипт для добавления слова
        data: {
            user_id: userId,
            word_russian: wordRussian,
            word_chechen: wordChechen,
            date_learned: new Date().toISOString().split('T')[0], // Текущая дата
            repetition_count: 1, // Начальное количество повторений
            last_reviewed: null,
            progress: 1.0 // Начальный прогресс
        },
        success: function(response) {
            console.log("Слово добавлено:", response);
        },
        error: function(xhr, status, error) {
            console.error("Ошибка при добавлении слова:", error);
        }
    });
}



/*
(function() {
    // Находим наш блок для вывода сообщений
    var consoleOutput = document.getElementById('consoleOutput');

    // Сохраняем оригинальные методы console
    var originalConsoleLog = console.log;
    var originalConsoleError = console.error;

    // Функция для безопасного отображения объектов
    function formatOutput(args) {
        return args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2); // Форматируем объект как JSON
                } catch (error) {
                    return String(arg); // Если объект не может быть преобразован в строку, возвращаем его как есть
                }
            } else {
                return String(arg); // Для обычных строк и чисел
            }
        }).join(' ');
    }

    // Переопределяем console.log для вывода в наш блок
    console.log = function(...args) {
        originalConsoleLog.apply(console, args); // Вызываем оригинальный console.log
        var formattedMessage = formatOutput(args);
        consoleOutput.innerHTML += '<div>' + formattedMessage + '</div>';
        consoleOutput.scrollTop = consoleOutput.scrollHeight; // Прокручиваем вниз
    };

    // Переопределяем console.error для вывода ошибок
    console.error = function(...args) {
        originalConsoleError.apply(console, args); // Вызываем оригинальный console.error
        var formattedMessage = formatOutput(args);
        consoleOutput.innerHTML += '<div style="color: red;">' + formattedMessage + '</div>';
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    };

})();*/



