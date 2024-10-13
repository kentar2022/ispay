$(document).ready(function() {
    // Функция загрузки статуса уроков и обновления интерфейса
    function loadLessonStatus(language) {
        $.ajax({
            url: 'get_lesson_status.php',
            method: 'POST',
            data: { language: language },
            dataType: 'json',
            success: function(response) {
                if (response.error) {
                    console.error('Ошибка:', response.error);
                    return;
                }

                const themeData = response.theme_data;

                $(".lesson-block").each(function() {
                    const themeId = $(this).data('lesson-id');
                    const theme = themeData.find(t => t.theme_id == themeId);

                    if (theme) {
                        $(this).find('.lesson-title').text(theme.theme_name);
                        $(this).find('.lesson-index').text(`${theme.progress?.completed_topics || 0} / ${theme.total_topics}`);
                        const progressPercentage = theme.progress?.progress_percentage || 0;
                        $(this).find('.lesson-progress span').text(`${progressPercentage}%`);

                        const lessonContent = $(this).find('.lesson-content');
                        lessonContent.empty();

                        theme.topics.forEach(topic => {
                            const topicId = topic.topic_id;
                            const topicName = topic.topic_name;
                            const totalLessons = topic.total_lessons;
                            const completedLessons = theme.topic_progress[topicId]?.completed_lessons || 0;

                            const topicHtml = `
                                <p data-topic-id="${topicId}" class="topic-link" style="cursor: pointer;">
                                    ${topicName} ${completedLessons} / ${totalLessons}
                                </p>`;
                            
                            lessonContent.append(topicHtml);
                        });
                    }
                });

                // Добавляем обработчик клика на каждую тему для перенаправления
                $('.topic-link').on('click touchstart', function() {
                    const topicId = $(this).data('topic-id');
                    let completedLessons = 0;

                    themeData.forEach(theme => {
                        const topicProgress = theme.topic_progress[topicId];
                        if (topicProgress) {
                            completedLessons = topicProgress.completed_lessons;
                        }
                    });

                    const language = localStorage.getItem('language') || 'chechen';
                    window.location.href = `lessons_pages/${language}_lesson.html?topicId=${topicId}&completedLessons=${completedLessons}&language=${language}`;
                });
            },
            error: function(xhr, status, error) {
                console.error('Ошибка загрузки данных темы:', error);
            }
        });
    }

    // Инициализация при загрузке страницы
    var language = localStorage.getItem('language');
    if (language !== null) {
        loadLessonStatus(language);
    }

    $('#languageSelect').on('change', function() {
        var selectedLanguage = $(this).val();
        localStorage.setItem('language', selectedLanguage);
        loadLessonStatus(selectedLanguage);
    });
});

// Функция открытия и закрытия содержимого урока
function toggleContent(element) {
    const content = $(element).closest('.lesson-block').find('.lesson-content');
    content.slideToggle();
}
