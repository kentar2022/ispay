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

        
        updateProgressBar(index);
    }

    $('#nextBtn').on('click', function () {

        currentIndex++;

        if (currentIndex >= data.length) {
            currentIndex = 0;
        }

        displayWindow(currentIndex);
    });


    function updateProgressBar() {
        var filledSteps = Math.floor((totalPrice / 15) * 100 / (100 / 15));
        $('#progress').css('height', (filledSteps * (100 / 15)) + '%');
    }

    var phrases = [];
    var currentWindowIndex = 0;

    $.ajax({
        url: 'load_phrases.php',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log('Получены данные:', data);
            phrases = data;
            displayWindow(currentWindowIndex);
        },
        error: function (error) {
            console.error('Ошибка при загрузке фраз:', error);
        }
    });

    function updateProgressBar(index) {
        var progressHeight = (index + 1) * (100 / phrases.length);
        $('#progress').css('height', progressHeight + '%');
    }
});