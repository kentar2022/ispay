
$(document).ready(function() {
    var userId = 1; 
    $.ajax({
        url: 'getProfileStats.php',
        type: 'GET',
        dataType: 'json',
        data: { userId: userId },
        success: function(data) {
            
            $('#score').text(data.score);
            $('#lessonsCompleted').text(data.lessonsCompleted);
            $('#overallRank').text(data.overallRank);
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при загрузке данных:', error);
        }
    });
});
