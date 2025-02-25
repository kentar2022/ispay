function displayWindow(index) {
    console.log('displayWindow called with index:', index);

    if (!isLessonLoaded()) {
        console.error('No lesson data available');
        return;
    }

    if (!window.lessonState.data || !window.lessonState.data.questions) {
        console.error('No lesson data available');
        return;
    }
    
    if (index === -1) {
        showStartScreen();
        return;
    }

    /*if (index >= window.lessonState.data.questions.length && window.lessonState.failedQuestions.size > 0) {
        handleFailedQuestions();
        return;
    }*/

    const currentQuestion = window.lessonState.data.questions[index];
    if (!currentQuestion) {
        console.error('Question not found for index:', index);
        showFinalResults();
        return;
    }

    const currentAnswer = currentQuestion.task_type !== 'matches' 
        ? window.lessonState.data.answers.find(a => a.id === currentQuestion.id)
        : null;

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

    setupQuestionDisplay(currentQuestion, currentAnswer);
    updateProgressBar(index, window.lessonState.data.questions.length);
}

function showStartScreen() {
    const summaryContent = window.lessonState.data.summary ? window.lessonState.data.summary : 'Начните урок';
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
            'border': `10px solid ${window.lessonState.settings.linkColor} !important`,
            'color': window.lessonState.settings.profilePageTextColor
        })
        .addClass('visible');

    $('#nextBtn')
        .show()
        .text('Начать урок')
        .off('click')
        .on('click', function() {
            $('.summaryBlock').addClass('hidden').removeClass('visible');
            window.lessonState.currentIndex = 0;
            displayWindow(window.lessonState.currentIndex);
        });
}

/*function handleFailedQuestions() {
    const failedQuestionsArray = [...window.lessonState.failedQuestions];
    window.lessonState.failedQuestions.clear();
    
    window.lessonState.data.questions = [
        ...window.lessonState.originalQuestionsOrder.filter((_, i) => !failedQuestionsArray.includes(i)),
        ...failedQuestionsArray.map(i => window.lessonState.originalQuestionsOrder[i])
    ];
    
    window.lessonState.currentIndex = window.lessonState.data.questions.length - failedQuestionsArray.length;
    displayWindow(window.lessonState.currentIndex);
}*/

function setupQuestionDisplay(currentQuestion, currentAnswer) {
    const windowContainer = $('#windowsContainer');
    const answerOptionsContainer = $('#answerOptionsContainer');
    windowContainer.empty().off('click', '.window');
    answerOptionsContainer.empty();
    $('#hintBlock').hide();

    const currentWindow = $('<div>')
        .attr('id', currentQuestion.id)
        .addClass('window active')
        .text(currentQuestion.text);
    
    windowContainer.append(currentWindow);

    if (currentQuestion.task_type !== 'matches') {
        windowContainer.on('click', '.window', function() {
            if (currentAnswer && currentAnswer.answer) {
                $('#hintBlock').text(currentAnswer.answer).show();
            }
        });
    }

    if (currentQuestion.task_type === "multiple_choice" && currentQuestion.possible_answers) {
        handleMultipleChoice(currentQuestion, windowContainer, answerOptionsContainer);
    }
    else if (currentQuestion.task_type === "matches" && currentQuestion.matches) {
        handleMatches(currentQuestion, windowContainer, answerOptionsContainer);
    }
    else {
        handleDefaultQuestion(currentQuestion, currentAnswer, windowContainer);
    }
}

function handleNextButton() {
    console.log('Next button clicked');

    const data = window.lessonState.data;
    const currentIndex = window.lessonState.currentIndex;

    if (!data || !data.questions || !data.answers || !data.questions[currentIndex] || !data.answers[currentIndex]) {
        console.error('No data or invalid index:', data, currentIndex);
        return;
    }

    var currentQuestion = data.questions[currentIndex];
    var currentAnswerColumn = "word_" + window.lessonState.settings.currentLanguage.toLowerCase();
    var currentAnswer = data.answers[currentIndex][currentAnswerColumn];

    $('#hintBlock').text(currentAnswer).hide();

    if (currentQuestion.task_type !== "matches") {
        var userInput = $('#textInput').val().trim();
        window.lessonState.answersCount++;

        if (checkAnswer(userInput, currentAnswer)) {
            var price = parseInt(currentQuestion.price) || 0;
            console.log('Price:', price);
            window.lessonState.score += price;
            console.log('Updated score:', window.lessonState.score);
            window.lessonState.correctAnswersTotal++;
            updateProgressBar(currentIndex + 1, data.questions.length);
            window.lessonState.currentIndex++;
            if (window.lessonState.currentIndex >= data.questions.length) {
                showFinalResults();
            } else {
                displayWindow(window.lessonState.currentIndex);
            }
        } else {
            $('#hintBlock').text(currentAnswer).show();
        }

        if (window.lessonState.answersCount === window.lessonState.requiredCorrectAnswers) {
            showFinalResults();
            return;
        }

        if (window.lessonState.currentIndex >= data.questions.length) {
            showFinalResults();
        }
        $('#textInput').val('');
        $('#hintBlock').hide();
    }

    var summaryPopup = $('#summaryPopup');
    if (summaryPopup.length) {
        console.log('Summary popup found, hiding it');
        summaryPopup.css('display', 'none');
    }
}

// Добавляем обработчики событий
$('#nextBtn').on('click', handleNextButton);