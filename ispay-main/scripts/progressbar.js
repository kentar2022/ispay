function updateProgressBar(index, total) {
    var progressHeight = (index / total) * 100;
    $('#progress').css('height', progressHeight + '%');
}
