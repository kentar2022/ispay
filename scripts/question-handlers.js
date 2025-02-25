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
            const wordForeign = correctAnswer; 

            $this.addClass('correct');
            window.lessonState.correctAnswersCount++;
            window.lessonState.correctAnswersTotal++;
            window.lessonState.score += parseInt(currentQuestion.price) || 0;

            setTimeout(() => {
                window.lessonState.currentIndex++;
                updateProgressBar(window.lessonState.currentIndex, window.lessonState.data.questions.length);
                
                if (window.lessonState.currentIndex >= window.lessonState.data.questions.length) {
                    showFinalResults();
                } else {
                    const nextQuestion = window.lessonState.data.questions[window.lessonState.currentIndex];
                    if (!nextQuestion) {
                        console.error('Next question not found:', window.lessonState.currentIndex);
                        showFinalResults();
                        return;
                    }
                    displayWindow(window.lessonState.currentIndex);
                }
            }, 1000);
        } else {
           /*    handleWrongAnswer(window.lessonState.currentIndex);*/
            $this.addClass('incorrect');
            $('#hintBlock').text(correctAnswer).show();
        }
    });
}

function handleWrongAnswer(currentIndex) {
    window.lessonState.failedQuestions.add(currentIndex);
    
    if (window.lessonState.originalQuestionsOrder.length === 0) {
        window.lessonState.originalQuestionsOrder = [...window.lessonState.data.questions];
    }
}

function handleMatches(currentQuestion, windowContainer, answerOptionsContainer) {
    console.log('Processing matches question:', currentQuestion);
    $('#textInput, #nextBtn').hide();

    const state = {
        selectedBlock: null,
        matchedPairs: new Set(),
        totalPairs: currentQuestion.matches.questions.length,
        isAnimating: false
    };

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

    // Перемешивание и создание ответов
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
                    window.lessonState.score += parseInt(currentQuestion.price) || 0;
                    window.lessonState.correctAnswersTotal++;
                    setTimeout(() => {
                        window.lessonState.currentIndex++;
                        displayWindow(window.lessonState.currentIndex);
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

function handleDefaultQuestion(currentQuestion, currentAnswer, windowContainer) {
    console.log('handleDefaultQuestion запущен:', {currentQuestion, currentAnswer});
    $('#textInput').show().val('');
    $('#nextBtn').show().text('Далее').off('click').on('click', function() {
        const userAnswer = $('#textInput').val().trim();
        if (checkAnswer(userAnswer, currentAnswer.answer)) {
            const russianWord = currentQuestion.text;
            const foreignWord = currentAnswer.answer;
            console.log('Отправка слова в словарь:', {
                russianWord,
                foreignWord,
                language: window.lessonState.language,
                currentUserId: window.lessonState.currentUserId
            });
            saveLearnedWord(russianWord, foreignWord, window.lessonState.language);
            window.lessonState.correctAnswersCount++;
            window.lessonState.correctAnswersTotal++;
            window.lessonState.score += parseInt(currentQuestion.price) || 0;
            window.lessonState.currentIndex++;
            updateProgressBar(window.lessonState.currentIndex, window.lessonState.data.questions.length);
            displayWindow(window.lessonState.currentIndex);
        } else {
           /* handleWrongAnswer(window.lessonState.currentIndex);*/
            $('#hintBlock').text(currentAnswer.answer).show();
        }
        $('#textInput').val('');
    });
}

function calculateStringSimilarity(str1, str2) {
    str1 = str1.toLowerCase().trim();
    str2 = str2.toLowerCase().trim();
    
    if (str1 === str2) return 1.0;
    if (str1.length < 2 || str2.length < 2) return 0.0;

    let bigrams1 = new Set();
    let bigrams2 = new Set();
    
    for (let i = 0; i < str1.length - 1; i++) {
        bigrams1.add(str1.slice(i, i + 2));
    }
    
    for (let i = 0; i < str2.length - 1; i++) {
        bigrams2.add(str2.slice(i, i + 2));
    }

    let intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
    
    return (2.0 * intersection.size) / (bigrams1.size + bigrams2.size);
}

function checkAnswer(userInput, correctAnswer) {
    if (userInput === ".") return true;

    const correctAnswers = correctAnswer.split(',').map(answer => answer.trim());
    
    return correctAnswers.some(answer => {
        const similarity = calculateStringSimilarity(userInput, answer);
        console.log(`Similarity between "${userInput}" and "${answer}": ${similarity}`);
        return similarity >= 0.7;
    });
}