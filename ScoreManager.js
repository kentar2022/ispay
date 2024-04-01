$(document).ready(function () {
    var totalPrice = 0;
    var currentIndex = 0;
    var data; // Переместил определение переменной data

    fetchData();

    function fetchData() {
        $.ajax({
            url: 'load_phrases.php',
            method: 'GET',
            dataType: 'json',
            success: function (responseData) {
                console.log('Получены данные:', responseData);
                data = responseData; // Обновил данные
                displayWindow(currentIndex);
            },
            error: function (error) {
                console.error('Ошибка при загрузке фраз:', error);
            }
        });
    }

    function displayWindow(index) {
        var windowContainer = $('#windowsContainer');
        windowContainer.empty();
        var currentWindow = $('#' + data[index].id); 

        if (currentWindow.length > 0) {
            currentWindow.text(data[index].text);
        } else {
            var windowContent = '<div id="' + data[index].id + '" class="window active">' + data[index].text + '</div>';
            windowContainer.append(windowContent);
        }

        $('.window').removeClass('active');
        $('#' + data[index].id).addClass('active');

        updateProgressBar(index, data.length);
    }

    $('#nextBtn').on('click', function () {
        currentIndex++;

        if (currentIndex >= data.length) {
            currentIndex = 0;
        }

        displayWindow(currentIndex);
    });

    function updateProgressBar(index, length) {
        var progressHeight = (index + 1) * (100 / length);
        $('#progress').css('height', progressHeight + '%');
    }
});
