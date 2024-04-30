function loadUserProgress() {
    $.ajax({
        url: 'load_lessons_status.php', 
        method: 'GET',
        success: function(response) {
            
            console.log('User progress loaded:', response);
            
            var userProgress = response.find(function(item) {
                return item.user_id === "1"; 
            });
            
            if (!userProgress) {
                console.error('User progress with user_id 1 not found.');
                return;
            }
            
            var userLevel = userProgress.level;
            console.log('User level:', userLevel); 
            
            var lessonTable;
            switch (userLevel) {
                case "1":
                    lessonTable = 'first_lesson';
                    break;
                case "2":
                    lessonTable = 'second_lesson';
                    break;
                case "3":
                    lessonTable = 'third_lesson';
                    break;
                case "4":
                    lessonTable = 'third_lesson';
                    break;
                case "5":
                    lessonTable = 'third_lesson';
                    break;                 
                case "6":
                    lessonTable = 'third_lesson';
                    break;
                case "7":
                    lessonTable = 'third_lesson';
                    break;
                case "8":
                    lessonTable = 'third_lesson';
                    break;
                case "9":
                    lessonTable = 'third_lesson';
                    break;
                case "10":
                    lessonTable = 'third_lesson';
                    break;
                                                                
                                
                default:
                    console.error('Lesson table not found for user level:', userLevel);
                    return;
            }
            
            loadPhrases(lessonTable);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}


function loadPhrases(tableName) {
    $.ajax({
        url: 'load_phrases.php',
        method: 'POST',
        data: { table: tableName }, 
        success: function(response) {
            
            console.log('Phrases loaded:', response);
           
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}


loadUserProgress();
