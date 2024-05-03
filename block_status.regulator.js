function loadLessonStatus() {
    
    $.ajax({
        url: "get_lesson_status.php",
        method: "GET",
        dataType: "json",
        success: function(lessonData) {
            
            $(".lesson-block ").each(function(index) {
                var lessonId = index + 1;
                var status = lessonData[lessonId];
                
                switch (status) {
                    case "1":
                        
                        $(this).css("background-color", "red");
                        break;
                    case "2":
                        
                        $(this).css("background-color", "green");
                        break;
                    case "3":
                        
                        $(this).css("background-color", "#f3166b"); 
                        break;
                    default:
                        
                        break;
                }
            });
        },
        error: function(xhr, status, error) {
            console.error("Ошибка при загрузке данных: " + error);
        }
    });
}


$(document).ready(function() {
    loadLessonStatus();
});
/*#15E670*/