$(document).ready(function () {
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
                console.log('Получены данные:', data);
                displayWindow(currentIndex); 
            },
            error: function (error) {
                console.error('Ошибка при получении данных:', error);
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

        updateProgressBar(index);
        
        // Найти значение word_russian в строке с соответствующим ID
        var currentData = data.find(item => item.id === $('#' + data[index].id).attr('id'));
        var wordRussian = currentData ? currentData.word_russian : 'Соответствующая строка не найдена';
        console.log('Слово на русском:', wordRussian);
    }

    $('#nextBtn').on('click', function () {
        var userInput = $('#textInput').val().trim(); // Получаем введенное пользователем значение
        var currentWordRussian = data[currentIndex].word_russian.toLowerCase(); // Получаем перевод из данных и приводим его к нижнему регистру

        if (userInput.toLowerCase() === currentWordRussian) { 
            currentIndex++;
            if (currentIndex >= data.length) {
                currentIndex = 0;
            }
            displayWindow(currentIndex);
        } else {
            alert('Неверный перевод фразы.');
        }
    });

    function updateProgressBar(index) {
        var progressHeight = (index + 1) * (100 / data.length);
        $('#progress').css('height', progressHeight + '%');
    }

});
