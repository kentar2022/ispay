function updateProgressBar(index, total) {
    var progressHeight = ((index + 1) / total) * 100;
    $('#progress').css('height', progressHeight + '%');
}
