$(document).ready(function() {
    // Функция для выполнения AJAX запроса к серверу и обновления стилей блоков
    function fetchData() {
        $.ajax({
            url: 'load_lessons_status.php',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                console.log(data); // Выводим полученные данные в консоль
                applyStyles(data); // Применяем стили к блокам на основе полученных данных
            },
            error: function(xhr, status, error) {
                console.error('Ошибка при получении данных: ' + error);
            }
        });
    }

    // Функция для применения стилей к блокам в соответствии с данными
    function applyStyles(data) {
        $('.lesson-block').each(function(index) {
            var status = data[index] && data[index].status; // Проверяем, существует ли объект и его свойство "status"

            // Устанавливаем цвет в соответствии со статусом
            switch (status) {
                case 1:
                    $(this).css('background-color', '#808080'); // Серый
                    break;
                case 2:
                    $(this).css('background-color', '#FFB6C1'); // Светло-розовый
                    break;
                case 3:
                    $(this).css('background-color', '#FF00FF'); // Фуксия
                    break;
                default:
                    $(this).css('background-color', '#f0f0f0'); // Задаем стандартный цвет
            }
        });
    }

    // Вызываем функцию для получения и обработки данных
    fetchData();
});
