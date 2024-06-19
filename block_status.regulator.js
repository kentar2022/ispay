$(document).ready(function() {

    function loadLessonStatus(language) {
       /* console.log('Loading lesson status for language:', language); // Debugging line*/
        $.ajax({
            url: 'get_lesson_status.php',
            method: 'POST',
            data: { language: language },
            dataType: 'json',
            success: function(lessonData) {
               /* console.log('Lesson data received:', lessonData); // Debugging line*/
                if (lessonData.error) {
                    console.error('Error:', lessonData.error);
                    return;
                }
                // Выбираем только блоки уроков с выбранным языком
                $(".lesson-block[data-language='" + language + "']").each(function() {
                    var lessonId = $(this).attr('data-lang-id'); // Получаем значение data-lang-id
                    var status = lessonData[lessonId] ? lessonData[lessonId] : "0";
                    /*console.log('Lesson ID:', lessonId, 'Status:', status); // Debugging line*/
                    switch (status) {
                        case "1":
                            $(this).css("background-color", "#f3166b");
                            break;
                        case "2":
                            $(this).css("background-color", "rgb(21, 230, 112)");
                            break;
                        case "3":
                            $(this).css("background-color", "#ffff00");
                            break;
                        default:
                            $(this).replaceWith(function() {
                                return $("<div>", {html: $(this).html(), class: $(this).attr("class")});
                            });
                            break;
                    }
                });
            },
            error: function(xhr, status, error) {
                console.error('Error loading lesson data:', error); // Debugging line
                console.log('Response Text:', xhr.responseText); // Debugging line
            }
        });
    }

    $(document).ready(function() {
        var language = localStorage.getItem('language');
        if (language !== null) {
            loadLessonStatus(language);
        }

        $('#languageSelect').on('change', function() {
            var selectedLanguage = $(this).val();
            localStorage.setItem('language', selectedLanguage);
            loadLessonStatus(selectedLanguage); // Обновление статуса уроков при выборе нового языка
        });
    });

});
