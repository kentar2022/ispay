$(document).ready(function() {
    // Функция для загрузки статуса уроков и сохранения их в localStorage
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

                // Сохраняем полученные данные в localStorage
                localStorage.setItem('lessonData', JSON.stringify(lessonData));

                // Обновляем интерфейс
                $(".lesson-block").each(function(index) {
                    if (index < lessonData.length) {
                        const lesson = lessonData[index];
                        $(this).find('.lesson-index').text(`${lesson.lessons_completed}/${lesson.total_lessons}`);
                        $(this).find('.lesson-progress span').text(`${lesson.completion_percentage}%`);

                        const topics = lesson.topics;
                        $(this).find('.lesson-content p').each(function(i) {
                            if (i < topics.length) {
                                const topic = topics[i];
                                $(this).html(`${topic.topic_name} ${topic.completed_lessons_per_topic}/${topic.lessons_per_topic}`);
                            } else {
                                $(this).remove(); // Удалить лишние параграфы, если данных меньше
                            }
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

    
    // Обработчик клика на элементы с data-topic-id
    $('.lesson-content p').on('click', function() {
        var topicId = $(this).data('topic-id');
        console.log('Clicked topic ID:', topicId);

        // Получаем данные из localStorage
        var lessonData = JSON.parse(localStorage.getItem('lessonData'));
        console.log('Lesson Data from localStorage:', lessonData);

        // Находим соответствующую тему в данных
        var topicData = null;
        lessonData.forEach(lesson => {
            var foundTopic = lesson.topics.find(topic => topic.topic_name.includes("Тематика " + topicId));
            if (foundTopic) {
                topicData = foundTopic;
                // Присваиваем lessonId, если он нужен
                topicData.lesson_id = lesson.id; // Используйте правильное свойство
            }
        });

        if (topicData) {
            // Передаем данные в Validator.js через localStorage
            localStorage.setItem('currentTopicData', JSON.stringify(topicData));
            console.log('Current Topic Data:', topicData);
            
            // Перенаправляем на другую страницу
            window.location.href = 'lessons_pages/chechen_lesson.html?language=chechen';
        } else {
            console.error('No data found for topic ID:', topicId);
        }
    });



});
