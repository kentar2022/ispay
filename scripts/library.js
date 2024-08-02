document.addEventListener('DOMContentLoaded', function() {
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    const selectedSection = localStorage.getItem('selectedSection');

    if (selectedLanguage && selectedSection) {
        console.log(`Selected Language: ${selectedLanguage}`);
        console.log(`Selected Section: ${selectedSection}`);

        // Показать выбранный язык
        const languageContent = document.getElementById(selectedLanguage);
        if (languageContent) {
            languageContent.style.display = 'block';
        } else {
            console.error('Selected language content not found');
        }

        // Показать выбранный раздел
        const sectionContent = document.querySelector(`#${selectedLanguage}-${selectedSection}`);
        if (sectionContent) {
            sectionContent.classList.add('active');
        } else {
            console.error('Selected section content not found');
        }
    } else {
        console.error('Language or section not found in localStorage');
    }
});



function showSection(language, section) {
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    
    if (selectedLanguage === language) {
        localStorage.setItem('selectedSection', section);
        
        const activeSection = document.querySelector(`#${selectedLanguage}-${section}`);
        if (activeSection) {
            // Удалить класс 'active' у всех info-block в выбранном языке
            const activeLanguage = document.getElementById(selectedLanguage);
            if (activeLanguage) {
                const allSections = activeLanguage.querySelectorAll('.info-block');
                allSections.forEach(block => block.classList.remove('active'));
            }
            
            // Добавить класс 'active' к выбранному section
            activeSection.classList.add('active');
        } else {
            console.error(`Section ${section} not found for language ${language}`);
        }
    } else {
        console.error('Selected language does not match');
    }
}

// Функция для применения стилей в соответствии с текущей темой
function applyStyles(bodyColor, cardColor, textColor, borderColor, buttonColor, lineColor, tabFillColor, tableBorderColor, toggleBtnColor, linkColor) {
    document.body.style.backgroundColor = bodyColor;
    document.body.style.color = textColor;  // Устанавливаем цвет текста для всех элементов

    // Применяем стили ко всем элементам с классом .card
    var cards = document.querySelectorAll('.card');
    cards.forEach(function(card) {
        card.style.backgroundColor = cardColor;
        card.style.borderColor = borderColor;
    });

    // Применяем стили к кнопкам
    var buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach(function(button) {
        button.style.backgroundColor = buttonColor;
    });

    // Применяем стили к элементам с классом .line, если они существуют
    var lineElements = document.querySelectorAll('.line');
    lineElements.forEach(function(line) {
        line.style.backgroundColor = lineColor;
    });

    // Применяем цвет текста к заголовкам и меткам форм
    var textElements = document.querySelectorAll('.card-title, .form-label');
    textElements.forEach(function(element) {
        element.style.color = textColor;
    });

    // Применяем цвет к вкладкам
    var tabs = document.querySelectorAll('.tab');
    tabs.forEach(function(tab) {
        tab.style.borderColor = borderColor;
        tab.querySelector('svg').style.fill = tabFillColor;
    });

    // Применяем цвет к таблицам и элементам .alphabet-item
    var tables = document.querySelectorAll('table, .alphabet-item, th, td');
    tables.forEach(function(table) {
        table.style.borderColor = tableBorderColor;
    });

    // Применяем цвет к кнопкам toggle-btn
    var toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(function(button) {
        button.style.backgroundColor = toggleBtnColor;
    });

    // Применяем цвет к блокам навигации
    var navBlocks = document.querySelectorAll('.navigation-block');
    navBlocks.forEach(function(block) {
        block.style.borderColor = borderColor;
    });

    // Применяем цвет к ссылкам в списках
    var links = document.querySelectorAll('ul li a');
    links.forEach(function(link) {
        link.style.color = linkColor;
    });

    // Сохраняем выбранные цвета в локальном хранилище
    localStorage.setItem('bodyColor', bodyColor);
    localStorage.setItem('cardColor', cardColor);
    localStorage.setItem('textColor', textColor);
    localStorage.setItem('borderColor', borderColor);
    localStorage.setItem('buttonColor', buttonColor);
    if (lineColor) localStorage.setItem('lineColor', lineColor);
    localStorage.setItem('tabFillColor', tabFillColor);
    localStorage.setItem('tableBorderColor', tableBorderColor);
    localStorage.setItem('toggleBtnColor', toggleBtnColor);
    localStorage.setItem('linkColor', linkColor);
}

// Функция для установки светлой темы
function setThemeLight() {
    var bodyColor = '#ffffff';
    var cardColor = '#f9f9f9';
    var textColor = '#000000';
    var borderColor = '#f3166b';
    var buttonColor = '#f3166b';
    var lineColor = '#f3166b';
    var tabFillColor = '#f3166b';
    var tableBorderColor = '#f3166b';
    var toggleBtnColor = '#f3166b';
    var linkColor = '#000000';

    applyStyles(bodyColor, cardColor, textColor, borderColor, buttonColor, lineColor, tabFillColor, tableBorderColor, toggleBtnColor, linkColor);
    localStorage.setItem('currentTheme', 'light');
}

// Функция для установки темной темы
function setThemeDark() {
    var bodyColor = '#293133';
    var cardColor = '#434B4D';
    var textColor = '#ffffff';
    var borderColor = '#15E670';
    var buttonColor = '#15E670';
    var lineColor = '#15E670';
    var tabFillColor = '#15E670';
    var tableBorderColor = '#15E670';
    var toggleBtnColor = '#15E670';
    var linkColor = '#ffffff';

    applyStyles(bodyColor, cardColor, textColor, borderColor, buttonColor, lineColor, tabFillColor, tableBorderColor, toggleBtnColor, linkColor);
    localStorage.setItem('currentTheme', 'dark');
}

// Функция для загрузки сохраненной темы
function loadTheme() {
    var savedTheme = localStorage.getItem('currentTheme');

    if (savedTheme) {
        if (savedTheme === 'dark') {
            setThemeDark();
        } else {
            setThemeLight();
        }
    } else {
        setThemeLight(); // Тема по умолчанию
    }
}

// Загружаем тему при загрузке страницы
window.onload = function() {
    loadTheme();
};
