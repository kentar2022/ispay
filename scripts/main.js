// Глобальное состояние
window.lessonState = {
    data: null,
    currentIndex: -1,
    correctAnswersCount: 0,
    requiredCorrectAnswers: 15,
    score: 0,
    correctAnswersTotal: 0,
    answersCount: 0,
    selectedBlock: null,
    /*failedQuestions: new Set(),
    originalQuestionsOrder: [],*/
    currentUserId: null,
    urlParams: new URLSearchParams(window.location.search),
    language: null,
    completedLessons: null,
    topicId: null,
    lessonId: null,
    settings: {
        currentTheme: localStorage.getItem('currentTheme'),
        bodyColor: localStorage.getItem('bodyColor'),
        linkColor: localStorage.getItem('linkColor'),
        fillColor: localStorage.getItem('fillColor'),
        profilePageTextColor: localStorage.getItem('profilePageTextColor'),
        settingsPageTextColor: localStorage.getItem('settingsPageTextColor'),
        coursesPageColor: localStorage.getItem('coursesPageColor'),
        currentLanguage: localStorage.getItem('currentLanguage')
    }
};

$(document).ready(function () {
    // Инициализация URL параметров
    window.lessonState.language = window.lessonState.urlParams.get('language');
    window.lessonState.completedLessons = window.lessonState.urlParams.get('completedLessons');
    window.lessonState.topicId = window.lessonState.urlParams.get('topicId');

    console.log('URL parameters:', { 
        language: window.lessonState.language, 
        topicId: window.lessonState.topicId, 
        completedLessons: window.lessonState.completedLessons 
    });

    // Проверка обязательных параметров
    if (!window.lessonState.language) {
        console.error('No language found in URL.');
        return;
    }

    if (!window.lessonState.topicId) {
        console.error('No topicId found in URL.');
        return;
    }

    // Установка lessonId
    if (window.lessonState.completedLessons) {
        window.lessonState.lessonId = parseInt(window.lessonState.completedLessons, 10);
        console.log('Lesson ID from URL:', window.lessonState.lessonId);
        $('#completedLessons').text(window.lessonState.lessonId);
    } else {
        console.error('No completedLessons found in URL.');
    }

    // Применение стилей из localStorage
    applyStyles();

    // Загрузка урока
    loadLesson(
        window.lessonState.language, 
        window.lessonState.lessonId, 
        window.lessonState.topicId
    );
});

// Функция применения стилей
function applyStyles() {
    const settings = window.lessonState.settings;

    $('body').css('background-color', settings.bodyColor);
    $('#windowsContainer').css('color', settings.profilePageTextColor);
    
    $('#nextBtn')
        .css('background-color', settings.linkColor)
        .css('box-shadow', `0 2px 25px ${settings.linkColor}`);

    $('.progress').css('background-color', settings.linkColor);
    $('.success-message div, .correct-answers').css('color', settings.settingsPageTextColor);
    $('#hintBlock').css('color', settings.linkColor);
    $('.summaryBlock')
        .css('background-color', settings.bodyColor)
        .css('color', settings.profilePageTextColor);
}

// Обработчики событий
$('#textInput').on('keypress', function(event) {
    if (event.which === 13) {
        $('#nextBtn').click();
    }
});

$('.closeButton').on('click', function() {
    window.location.href = '../index.html';
});