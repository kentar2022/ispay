function updateProgressBar(index, total) {
    var progressWidth = ((index + 1) / total) * 100;
    $('.progress').css('width', progressWidth + '%');
}