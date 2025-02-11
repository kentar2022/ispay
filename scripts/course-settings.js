window.showSummaryPopup = function() {
    console.log('showSummaryPopup function called');
    const summaryPopup = document.getElementById('summaryPopup');
    if (summaryPopup) {
        if (window.courseData.phrases && window.courseData.phrases.questions && window.courseData.phrases.answers) {
            console.log('Data for summary:', window.courseData.phrases);
            // Пример вывода данных
            document.getElementById('summaryContent').innerText = JSON.stringify(window.courseData.phrases);
            summaryPopup.style.display = 'block';
            console.log('Summary popup opened');
        } else {
            console.error('No summary data or invalid structure:', window.courseData.phrases);
            alert('Summary data is not loaded or has an invalid structure.');
        }
    } else {
        console.error('summaryPopup element not found');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    
    // Если функция определена внутри другой функции, вынесите её наружу
    window.showSummaryPopup = function() {
        console.log('showSummaryPopup function called');
        const summaryPopup = document.getElementById('summaryPopup');
        if (summaryPopup) {
            summaryPopup.style.display = 'flex';
            console.log('Summary popup opened');
        } else {
            console.error('summaryPopup element not found');
        }
    };



$(document).on('click', '.closeSummaryPopup', function() {
    console.log('Close button clicked');
    $('#summaryPopup').css('display', 'none');
});

$(document).on('click', '#cancelBtn', function() {
    console.log('Cancel button clicked');
    $('#summaryPopup').css('display', 'none');
});




    // Отладка количества элементов с классом "iconButton"
    const iconButtons = document.querySelectorAll('.iconButton');
    console.log(`Found ${iconButtons.length} elements with class "iconButton"`);
});



function showSettingsPopup() {
    document.getElementById('settings-popup').style.display = 'block';
}

function hideSettingsPopup() {
    document.getElementById('settings-popup').style.display = 'none';
}

