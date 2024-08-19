$(document).ready(function() {
    console.log('Документ загружен, начинаем процесс получения userId.');

    // Сначала получаем userId
    $.ajax({
        url: 'getUserId.php',
        type: 'GET',
        dataType: 'json',
        success: function(userData) {
            console.log('Ответ от getUserId.php получен:', userData);

            if (userData.error) {
                console.error('Ошибка: ' + userData.error);
                return;
            }

            var userId = userData.user_id;
            console.log('Полученный userId:', userId);

            // После получения userId, делаем запрос к getProfileStats.php
            $.ajax({
                url: 'getProfileStats.php',
                type: 'GET',
                dataType: 'json',
                data: { userId: userId },
                success: function(data) {
                    console.log('Ответ от getProfileStats.php получен:', data);

                    // Обновляем значения статистики
                    $('#score').text(data.score);
                    $('#lessonsCompleted').text(data.lessonsCompleted);
                    $('#overallRank').text(data.overallRank);

                    // Обновляем значения кристаллов и монет
                    $('.crystals').text(data.crystals);
                    $('.coins').text(data.coins);
                    
                    console.log('Данные успешно обновлены на странице.');
                },
                error: function(xhr, status, error) {
                    console.error('Ошибка при загрузке данных из getProfileStats.php:', error);
                    console.log('Статус:', status);
                    console.log('Ответ сервера:', xhr.responseText);
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при получении userId из getUserId.php:', error);
            console.log('Статус:', status);
            console.log('Ответ сервера:', xhr.responseText);
        }
    });
});
