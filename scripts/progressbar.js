function updateProgressBar(index, total) {
    var progressValue = (index / total) * 100;
    
    // Определяем ширину экрана
    if (window.innerWidth < 880) {
        // Для экранов меньше 880px - изменяем ширину (горизонтальный прогрессбар)
        $('#progress').css('width', progressValue + '%');
        $('#progress').css('height', '100%'); // Высота фиксирована на 100% для горизонтального прогресса
    } else {
        // Для больших экранов - изменяем высоту (вертикальный прогрессбар)
        $('#progress').css('height', progressValue + '%');
        $('#progress').css('width', '100%'); // Ширина фиксирована на 100% для вертикального прогресса
    }
}
