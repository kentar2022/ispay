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
    }

    
    $('#nextBtn').on('click', function () {
        
        displayWindow(currentIndex + 1);
    });
});
