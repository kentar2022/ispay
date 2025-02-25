function updateUserProgress(userId, topicId, newScore, language) {
    console.log("Отправка данных в updateUserProgress:", {
        user_id: userId,
        topic_id: topicId,
        new_score: newScore,
        language: language
    });

    const currentLessonId = parseInt(window.lessonState.completedLessons, 10);
    const nextLessonId = currentLessonId + 1;

    $.ajax({
        type: "POST",
        url: "../update_user_progress.php",
        data: {
            user_id: userId,
            topic_id: topicId,
            new_score: newScore,
            language: language,
            completed_lessons: nextLessonId
        },
        success: function (response) {
            console.log("Прогресс успешно обновлен:", response);
            setTimeout(() => {
                window.location.href = `/course_roadmap.html?language=${language}`;
            }, 2000);
        },
        error: function (xhr, status, error) {
            console.error("Ошибка при обновлении прогресса:", error);
        }
    });
}

function getUserId(lessonId, language) {
    $.ajax({
        type: "POST",
        url: "../getUserId.php",
        data: {},
        success: function (response) {
            window.lessonState.currentUserId = response.user_id;
            console.log("User ID:", response.user_id);
            const urlTopicId = window.lessonState.urlParams.get('topicId');
            updateUserProgress(
                response.user_id, 
                urlTopicId, 
                window.lessonState.score, 
                language
            );
        },
        error: function (xhr, status, error) {
            console.error("Ошибка при получении ID пользователя:", error);
        }
    });
}

function saveLearnedWord(wordRussian, wordForeign, language) {
    console.log('saveLearnedWord вызван с параметрами:', {
        wordRussian,
        wordForeign,
        language,
        currentUserId: window.lessonState.currentUserId
    });
    $.ajax({
        type: "POST",
        url: "../learned_words/add_word.php",
        data: {
            user_id: window.lessonState.currentUserId,
            word_russian: wordRussian, 
            word_foreign: wordForeign,
            language: language,
            date_learned: new Date().toISOString().split('T')[0],
            repetition_count: 1,
            progress: 0.2
        },
        success: function(response) {
            console.log("Слово добавлено:", response);
        },
        error: function(xhr, status, error) {
            console.error("Ошибка при добавлении слова:", error);
            console.log("Сырой ответ сервера:", xhr.responseText);
        }
    });
}

function showFinalResults() {
    $('.main-block').addClass('hidden'); 
    $('.success-message').removeClass('hidden'); 
    $('#correctAnswersCount').text(window.lessonState.correctAnswersTotal);
    $('#scoreCount').text(window.lessonState.score);
    getUserId(window.lessonState.lessonId, window.lessonState.language);
}