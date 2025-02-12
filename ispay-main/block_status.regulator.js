$(document).ready(function() {
    // Функция для загрузки статуса уроков и сохранения их в localStorage
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

                // Выводим user_id в консоль
                const userId = response.user_id;
                console.log(`User ID: ${userId}`);

                const themeData = response.theme_data;

                // Обновляем интерфейс для каждого блока уроков
                $(".lesson-block").each(function() {
                    const themeId = $(this).data('lesson-id');
                    const theme = themeData.find(t => t.theme_id == themeId);

                    if (theme) {
                        $(this).find('.lesson-title').text(theme.theme_name);
                        $(this).find('.lesson-index').text(`${theme.progress?.completed_topics || 0} / ${theme.total_topics}`);

                        // Обновляем информацию о прогрессе
                        const progressPercentage = theme.progress?.progress_percentage || 0;
                        $(this).find('.lesson-progress span').text(`${progressPercentage}%`);

                        // Обновляем содержание тем в topic-container
                        const lessonContent = $(this).find('.lesson-content');
                        lessonContent.empty(); // Очищаем содержимое контейнера

                        theme.topics.forEach(topic => {
                            const topicId = topic.topic_id;
                            const topicName = topic.topic_name;
                            const totalLessons = topic.total_lessons;
                            const completedLessons = theme.topic_progress[topicId]?.completed_lessons || 0;

                            const topicHtml = `
                                <p data-topic-id="${topicId}" class="topic-link" style="display: inline;">
                                    ${topicName} ${completedLessons} / ${totalLessons}
                                </p>
                                <div class="topic-container"></div>`;
                            
                            lessonContent.append(topicHtml);
                        });
                    }
                });

                // Добавляем обработчик клика на каждую тему
                $('.topic-link').on('click', function() {
                    const topicId = $(this).data('topic-id');
                    // Находим соответствующую тему и извлекаем значение completed_lessons
                    let completedLessons = 0;
                    themeData.forEach(theme => {
                        const topicProgress = theme.topic_progress[topicId];
                        if (topicProgress) {
                            completedLessons = topicProgress.completed_lessons;
                        }
                    });

                    console.log(`Клик по теме с ID: ${topicId}, Уроки завершены: ${completedLessons}`);

                    // Получаем текущий язык
                    const language = localStorage.getItem('language') || 'chechen';

                    // Перенаправление на страницу урока с передачей completedLessons, topicId и language
                    window.location.href = `lessons_pages/chechen_lesson.html?topicId=${topicId}&completedLessons=${completedLessons}&language=${language}`;
                });
            },
            error: function(xhr, status, error) {
                console.error('Ошибка загрузки данных темы:', error);
                console.log('Текст ответа:', xhr.responseText);
            }
        });
    }

    // Загружаем статус тем при загрузке страницы
    var language = localStorage.getItem('language');
    if (language !== null) {
        loadLessonStatus(language);
    }

    // Обновляем статус тем при выборе нового языка
    $('#languageSelect').on('change', function() {
        var selectedLanguage = $(this).val();
        localStorage.setItem('language', selectedLanguage);
        loadLessonStatus(selectedLanguage);
    });
});
