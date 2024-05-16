$(document).ready(function() {
    function loadLessonStatus() {
        $.ajax({
            url: "get_lesson_status.php",
            method: "GET",
            dataType: "json",
            success: function(lessonData) {
                $(".lesson-block").each(function(index) {
                    var lessonId = index + 1;
                    var status = lessonData[lessonId] ? lessonData[lessonId] : "0"; 
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
                console.error("Ошибка при загрузке данных: " + error);
            }
        });
    }


    loadLessonStatus();
});
