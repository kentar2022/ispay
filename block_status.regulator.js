$(document).ready(function() {
    function loadLessonStatus(language) {
        $.ajax({
            url: 'get_lesson_status.php',
            method: 'POST',
            data: { language: language },
            dataType: 'json',
            success: function(lessonData) {
                if (lessonData.error) {
                    console.error('Error:', lessonData.error);
                    return;
                }

                $(".lesson-block").each(function(index) {
                    if (index < lessonData.length) {
                        const lesson = lessonData[index];

                        // Обновляем количество пройденных уроков и общее количество уроков
                        $(this).find('.lesson-index').text(`${lesson.lessons_completed}/${lesson.total_lessons}`);
                        $(this).find('.lesson-progress span').text(`${lesson.completion_percentage}%`);

                        // Обновляем информацию о тематиках
                        const topics = lesson.topics;
                        $(this).find('.lesson-content').each(function() {
                            $(this).find('p').each(function(i) {
                                if (i < topics.length) {
                                    const topic = topics[i];
                                    $(this).html(`${topic.topic_name} ${topic.completed_lessons_per_topic}/${topic.lessons_per_topic}`);
                                } else {
                                    $(this).remove(); // Удалить лишние параграфы, если данных меньше
                                }
                            });
                        });
                    }
                });
            },
            error: function(xhr, status, error) {
                console.error('Error loading lesson data:', error);
                console.log('Response Text:', xhr.responseText);
            }
        });
    }

    // Загружаем статус уроков при загрузке страницы
    var language = localStorage.getItem('language');
    if (language !== null) {
        loadLessonStatus(language);
    }

    // Обновляем статус уроков при выборе нового языка
    $('#languageSelect').on('change', function() {
        var selectedLanguage = $(this).val();
        localStorage.setItem('language', selectedLanguage);
        loadLessonStatus(selectedLanguage);
    });
});
