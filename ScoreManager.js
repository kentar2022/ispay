$(document).ready(function () {
    var totalPrice = 0;
    var data;
    var currentIndex = 0;

    fetchData();

    function fetchData() {
        $.ajax({
            url: 'load_phrases.php',
            method: 'GET',
            dataType: 'json',
            success: function (responseData) {
                data = responseData;
                handleData(data);
            },
            error: function (error) {
                console.error('Ошибка при получении данных:', error);
            }
        });
    }

    function handleData(data) {
        displayWindow(0);
    }

    function displayWindow(index) {
        let price = parseInt(data[index].price);
        totalPrice += price;

        let windowContent = '<div class="window">' + data[index].text + '</div>';
        $('#windowsContainer').empty().append(windowContent);

        $('.window').removeClass('active');
        $('.window').eq(index).addClass('active');

        currentIndex = index;
        $('#priceDisplay').text('Total Price: ' + totalPrice);

        // Обновляем шкалу прогресса
        updateProgressBar();
    }

    $('#nextBtn').on('click', function () {
        // Увеличиваем индекс, чтобы перейти к следующей фразе
        currentIndex++;
        // Если достигнут конец массива, переходим к началу
        if (currentIndex >= data.length) {
            currentIndex = 0;
        }
        // Показываем окно с новой фразой
        displayWindow(currentIndex);
    });

    // Функция для обновления шкалы прогресса
    function updateProgressBar() {
        var filledSteps = Math.floor((totalPrice / 15) * 100 / (100 / 15));
        $('#progress').css('height', (filledSteps * (100 / 15)) + '%');
    }
});
