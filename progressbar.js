/*document.addEventListener('DOMContentLoaded', function() {
    var progressContainer = document.querySelector('.progress-container');
    var progress = document.getElementById('progress');
    var increaseButton = document.getElementById('increaseButton');
    var filledSteps = 0;

    function createProgressSteps() {
        for (var i = 0; i < 15; i++) {
            var step = document.createElement('div');
            step.classList.add('progress-step');
            step.style.height = (100 / 15) + '%';
            progressContainer.appendChild(step);
        }
    }

    function increaseProgress() {
        if (filledSteps < 15) {
            filledSteps++;
            var currentProgress = filledSteps * (100 / 15); 
            progress.style.height = currentProgress + '%';
        }
    }

    createProgressSteps();

    increaseButton.addEventListener('click', increaseProgress);
});
*/