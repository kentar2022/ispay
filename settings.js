// Переменные для элементов управления темой
var themeLight = document.getElementById('themeLight');
var themeDark = document.getElementById('themeDark');

// Переменные для элементов, требующих стилизации
var links = document.querySelectorAll('a, .a');
var svgIcons = document.querySelectorAll('svg');
var friendsPageElements = document.querySelectorAll('.friendsPage *');
var settingsPageText = document.querySelectorAll('.settingsPage *');
var coursesPageLinks = document.querySelectorAll('.courses_titles');
var profilePageElements = document.querySelectorAll('.profilePage *');
var selectLanguages = document.querySelectorAll('select > option, #languageSelect');
var buttons = document.querySelectorAll('.button, .btn');
var mainBlocks = document.querySelectorAll('.main-block'); 
var statsBlock = document.querySelectorAll('.stat-item-mobile span'); 
var asides = document.querySelectorAll('.aside');
var giftItems = document.querySelectorAll('.gift-item'); 
var centerAnimation = document.getElementById('center-animation');

// Дополнительные элементы для страниц транслитерации и курсов
var transliteratorElements = document.querySelectorAll('.transliterator-container, .transliterator-input, .transliterator-output, .card, .language-button, textarea, .copy-button');
var courseCards = document.querySelectorAll('.course-card');
var courseTitles = document.querySelectorAll('.course-title');
var courseDescriptions = document.querySelectorAll('.course-description');
var addLanguageButtons = document.querySelectorAll('.add-language-btn');

// Функция для применения стилей в соответствии с текущей темой
function applyStyles(bodyColor, linkColor, fillColor, settingsPageTextColor, coursesPageColor, profilePageTextColor, buttonColor, buttonTextColor, mainBlockColor, scrollbarColor, statBorderColor, giftItemColor, centerAnimationBorderColor, centerAnimationBgColor) {
    document.body.style.backgroundColor = bodyColor;

    links.forEach(function(link) {
        link.style.color = linkColor;
    });
    
    svgIcons.forEach(function(svgIcon) {
        svgIcon.setAttribute('fill', fillColor);
    });
    
    friendsPageElements.forEach(function(element) {
        element.style.color = settingsPageTextColor;
        element.style.backgroundColor = bodyColor;
        element.style.border = `1px solid ${linkColor}`;
    });
    
    settingsPageText.forEach(function(element) {
        element.style.color = settingsPageTextColor;
    });
    
    coursesPageLinks.forEach(function(link) {
        link.style.color = coursesPageColor;
    });
    
    profilePageElements.forEach(function(element) {
        element.style.color = profilePageTextColor;
    });
    
    selectLanguages.forEach(function(element) {
        element.style.backgroundColor = bodyColor;
    });
    
    buttons.forEach(function(button) {
        button.style.backgroundColor = buttonColor;
        button.style.color = buttonTextColor;
    });
    
    mainBlocks.forEach(function(block) {
        block.style.backgroundColor = bodyColor;
        block.style.color = settingsPageTextColor;
    });
    
    statsBlock.forEach(function(element) {
        element.style.backgroundColor = bodyColor;
        element.style.border = `2px solid ${statBorderColor}`;  
    });
    
    asides.forEach(function(aside) {
        aside.style.backgroundColor = bodyColor;
    });
    
    giftItems.forEach(function(giftItem) {
        giftItem.style.backgroundColor = bodyColor;
    });

    // Применяем стили к элементам транслитерации
    transliteratorElements.forEach(function(element) {
        if (element.classList.contains('card')) {
            element.style.backgroundColor = bodyColor;
            element.style.color = settingsPageTextColor;
            element.style.border = `1px solid ${linkColor}`;
        } else if (element.classList.contains('language-button')) {
            element.style.backgroundColor = bodyColor;
            element.style.color = settingsPageTextColor;
            element.style.border = `1px solid ${linkColor}`;
        } else if (element.classList.contains('textarea')) {
            element.style.backgroundColor = bodyColor;
            element.style.color = settingsPageTextColor;
            element.style.border = `1px solid ${linkColor}`;
        } else if (element.classList.contains('copy-button')) {
            element.style.backgroundColor = bodyColor;
            element.style.color = linkColor;
            element.style.border = `1px solid ${linkColor}`;
        }
    });

    // Применяем стили к карточкам курсов
    courseCards.forEach(function(card) {
        card.style.backgroundColor = bodyColor;
        card.style.border = `1px solid ${linkColor}`;
    });

    courseTitles.forEach(function(title) {
        title.style.color = settingsPageTextColor;
    });

    courseDescriptions.forEach(function(description) {
        description.style.color = settingsPageTextColor;
    });

    // Применяем стили к кнопкам добавления языка
    addLanguageButtons.forEach(function(button) {
        button.style.backgroundColor = bodyColor;
        button.style.color = linkColor;
        button.style.border = `1px solid ${linkColor}`;
    });

    if (document.getElementById('languageSelectContainer')) {
        document.getElementById('languageSelectContainer').style.backgroundColor = bodyColor;
        document.getElementById('languageSelectContainer').style.border = `1px solid ${linkColor}`;
    }

    document.documentElement.style.setProperty('--scrollbar-thumb-color', scrollbarColor);
    document.documentElement.style.setProperty('--scrollbar-track-color', bodyColor);
    
    if (centerAnimation) {
        centerAnimation.style.borderColor = centerAnimationBorderColor;
        centerAnimation.style.backgroundColor = centerAnimationBgColor;
    }

    localStorage.setItem('bodyColor', bodyColor);
    localStorage.setItem('linkColor', linkColor);
    localStorage.setItem('fillColor', fillColor);
    localStorage.setItem('settingsPageTextColor', settingsPageTextColor);
    localStorage.setItem('coursesPageColor', coursesPageColor);
    localStorage.setItem('profilePageTextColor', profilePageTextColor);
    localStorage.setItem('buttonColor', buttonColor);
    localStorage.setItem('buttonTextColor', buttonTextColor);
    localStorage.setItem('mainBlockColor', mainBlockColor);
    localStorage.setItem('scrollbarColor', scrollbarColor);
    localStorage.setItem('statBorderColor', statBorderColor);
    localStorage.setItem('giftItemColor', giftItemColor); 
    localStorage.setItem('centerAnimationBorderColor', centerAnimationBorderColor);
    localStorage.setItem('centerAnimationBgColor', centerAnimationBgColor);
}

// Функция для установки светлой темы
function setThemeLight() {
    var bodyColor = '#ffffff';
    var linkColor = '#f3166b'; // Фиолетовый цвет для светлой темы
    var fillColor = '#f3166b';
    var settingsPageTextColor = '#000000'; // Чёрный текст на светлом фоне
    var coursesPageColor = '#000000';
    var profilePageTextColor = '#000000';
    var buttonColor = '#f3166b';
    var buttonTextColor = '#ffffff';
    var mainBlockColor = '#f3166b';
    var scrollbarColor = '#f3166b';
    var statBorderColor = '#f3166b';
    var giftItemColor = '#ffffff'; 
    var centerAnimationBorderColor = '#f3166b';
    var centerAnimationBgColor = 'rgba(255, 255, 255, 0.9)';

    document.body.setAttribute('data-theme', 'light');
    applyStyles(bodyColor, linkColor, fillColor, settingsPageTextColor, coursesPageColor, profilePageTextColor, buttonColor, buttonTextColor, mainBlockColor, scrollbarColor, statBorderColor, giftItemColor, centerAnimationBorderColor, centerAnimationBgColor);
}

// Функция для установки темной темы
function setThemeDark() {
    var bodyColor = '#293133';
    var linkColor = '#15E670'; // Зелёный цвет для тёмной темы
    var fillColor = '#15E670';
    var settingsPageTextColor = '#ffffff'; // Белый текст на тёмном фоне
    var coursesPageColor = '#ffffff';
    var profilePageTextColor = '#ffffff';
    var buttonColor = '#15E670';
    var buttonTextColor = '#293133';
    var mainBlockColor = '#15E670';
    var scrollbarColor = '#15E670';
    var statBorderColor = '#15E670';
    var giftItemColor = '#293133';
    var centerAnimationBorderColor = '#15E670';
    var centerAnimationBgColor = 'rgba(41, 49, 51, 0.9)';

    document.body.setAttribute('data-theme', 'dark');
    applyStyles(bodyColor, linkColor, fillColor, settingsPageTextColor, coursesPageColor, profilePageTextColor, buttonColor, buttonTextColor, mainBlockColor, scrollbarColor, statBorderColor, giftItemColor, centerAnimationBorderColor, centerAnimationBgColor);
}

// Функция для установки темы
function setTheme() {
    if (themeLight && themeLight.checked) {
        setThemeLight();
        localStorage.setItem('theme', 'light');
    } else if (themeDark && themeDark.checked) {
        setThemeDark();
        localStorage.setItem('theme', 'dark');
    }
}

// Функция для загрузки темы при загрузке страницы
function loadTheme() {
    var savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        if (savedTheme === 'dark') {
            setThemeDark();
            if (themeDark) themeDark.checked = true;
        } else {
            setThemeLight();
            if (themeLight) themeLight.checked = true;
        }
    }
}

// Инициализация при загрузке страницы
window.onload = function() {
    loadTheme();
};

// Добавляем слушатели событий для элементов выбора темы, если они существуют
if (themeLight) themeLight.addEventListener('change', setTheme);
if (themeDark) themeDark.addEventListener('change', setTheme);