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
    }

    
    $('#submitButton').on('click', function () {
        var userInput = parseInt($('#textInput').val()); 
        var currentBlockId = $('#' + data[currentIndex].id).attr('id'); 

        if (userInput === parseInt(currentBlockId)) { 
            alert('Фраза найдена в данных!');
        } else {
            alert('Фраза не найдена в данных.');
        }
    });

    
    function updateProgressBar(index) {
        var progressHeight = (index + 1) * (100 / data.length);
        $('#progress').css('height', progressHeight + '%');
    }

    
    $('#nextBtn').on('click', function () {
        currentIndex++;
        if (currentIndex >= data.length) {
            currentIndex = 0;
        }
        displayWindow(currentIndex);
    });
});
