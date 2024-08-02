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
                        
                        // Обновляем индекс уроков в формате "lessons_completed/total_lessons"
                        $(this).find('.lesson-completed').text(`${lesson.completed_lessons_per_topic}/${lesson.lessons_per_topic}`);

                         $(this).find('.lesson-index').text(`${lesson.lessons_completed}/${lesson.total_lessons}`);
                        

                        // Обновляем процент выполнения
                        $(this).find('.lesson-progress span').text(`${lesson.completion_percentage}%`);
                        
                        // Обновляем количество уроков в теме и количество пройденных уроков в теме
                        $(this).find('.lesson-per-topic').text(lesson.lessons_per_topic);
                        $(this).find('.completed-lessons-per-topic').text(lesson.completed_lessons_per_topic);
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
