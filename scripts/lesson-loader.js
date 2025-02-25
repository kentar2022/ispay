function loadLesson(language, lessonId, topicId) {
    if (!window.lessonState.completedLessons || window.lessonState.completedLessons === '0') {
        window.lessonState.lessonId = 1;
        console.log('completedLessons is 0 or not set, defaulting to lessonId: 1');
    } else {
        window.lessonState.lessonId = parseInt(window.lessonState.completedLessons, 10);
        console.log('Lesson ID from URL:', window.lessonState.lessonId);
    }

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
    window.lessonState.data = null;
    window.lessonState.currentIndex = -1;

    console.log('=== Debug loadLesson ===');
    console.log('Trying to load lesson with params:', {
        language: language,
        lessonId: window.lessonState.lessonId,
        topicId: topicId,
        fullUrl: window.location.href
    });
    console.log('Ajax URL will be:', '../load_phrases.php');
    console.log('=== Debug End ===');        

    $.ajax({
        url: '../load_phrases.php',
        method: 'GET',
        data: { 
            language: language, 
            lesson_id: window.lessonState.lessonId, 
            topic_id: topicId 
        },
        dataType: 'json',
        success: function (response) {
            console.log('Full response:', response);
            $('#loadingIndicator').remove();

            if (response.error) {
                console.error('Server error:', response.error);
                showError(`Ошибка: ${response.error}`);
                return;
            }

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

            window.lessonState.data = {
                ...response,
                questions: validQuestions
            };

            window.lessonState.currentIndex = -1;
            displayWindow(window.lessonState.currentIndex);
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

function isLessonLoaded() {
    return window.lessonState.data !== null && 
           Array.isArray(window.lessonState.data.questions) && 
           window.lessonState.data.questions.length > 0;
}