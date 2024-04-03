$(document).ready(function () {
    var data;
    var currentProgress = 0;
    var currentIndex = 0;
    $('#progress').css('height', '0%');
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

        updateProgressBar(index, data.length);

       
        var currentData = data.find(item => item.id === $('#' + data[index].id).attr('id'));
        var wordRussian = currentData ? currentData.word_russian : 'Соответствующая строка не найдена';
        console.log('Слово на русском:', wordRussian);
    }

$('#nextBtn').on('click', function () {
    var userInput = $('#textInput').val().trim(); 
    var currentWordRussian = data[currentIndex].word_russian.toLowerCase(); 

    if (userInput === '.' || userInput.toLowerCase() === currentWordRussian) {
        currentIndex++;
        if (currentIndex >= data.length) {
            currentIndex = 0;
        }
        displayWindow(currentIndex);
        // Очищаем строку ввода после правильного ответа
        $('#textInput').val('');
    } else {
        alert('Неверный перевод фразы.');
    }
});

});
