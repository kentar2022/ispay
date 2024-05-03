function setTheme() {
    var themeLight = document.getElementById('themeLight');
    var themeDark = document.getElementById('themeDark');
    var themeDark2 = document.getElementById('themeDark2');
    var links = document.querySelectorAll('.aside-item a');
    var svgIcons = document.querySelectorAll('.aside-item svg');
    var mainBlock = document.querySelector('.main-block');
    var settingsPageText = document.querySelectorAll('.settingsPage *');
    var coursesPageLinks = document.querySelectorAll('.courses a');


    
    var bodyColor = '#ffffff';
    var linkColor = '#000000';
    var fillColor = '#000000';
    var settingsPageTextColor = '#000000'; 
    var coursesPageColor = '#000000';

    
    if (themeLight.checked) {
        bodyColor = '#ffffff';
        linkColor = '#000000';
        fillColor = '#000000';
        settingsPageTextColor = '#000000'; 
    } else if (themeDark.checked) {
        bodyColor = '#293133';
        linkColor = '#15E670';
        fillColor = '#15E670';
        mainBlock.style.backgroundColor = '#15E670'; 
        settingsPageTextColor = '#ffffff'; 
        coursesPageColor = '#ffffff';
    } else if (themeDark2.checked) {
        bodyColor = '#293133';
        linkColor = '#f3166b';
        fillColor = '#f3166b';
        coursesPageColor = '#ffffff';
        settingsPageTextColor = '#ffffff';
        mainBlock.style.backgroundColor = '#f3166b';
    }


    document.body.style.backgroundColor = bodyColor;
    coursesPageLinks.forEach(function(link) {
        link.style.color = coursesPageColor;
    });

    document.body.style.backgroundColor = bodyColor;
    links.forEach(function(link) {
        link.style.color = linkColor;
    });
    svgIcons.forEach(function(svgIcon) {
        svgIcon.setAttribute('fill', fillColor);
    });
    settingsPageText.forEach(function(element) {
        element.style.color = settingsPageTextColor;
    });
}


var texts = {
    russian: {
        menu: "Меню",
        coursesPage: "Список курсов",
        ratingsPage: "Рейтинги",
        lessonsPage: "Задания",
        settingsPage: "Настройки",
        shop: "Магазин",
        settingsHeaderText: "Настройки",
        settingsLangRussian: "Русский",
        settingsLangEnglish: "Английский",
        settingsLangFrench: "Французский",
        settingsThemeSelection: "Выбор темы страницы:",
        settingsThemeLight: "Светлая тема",
        settingsThemeDark: "Темная тема",
        settingsThemeDark2: "Темная тема 2",
        courseChechen: "Чеченский язык 1",
        courseIngush: "Ингушский язык",
        courseAdyge: "Черкесский язык",
        courseUdmurt: "Удмуртский язык",
        courseTatar: "Татарский язык",
        courseChuvash: "Чувашский язык"
    },
    english: {
        menu: "Menu",
        coursesPage: "Course List",
        ratingsPage: "Ratings",
        lessonsPage: "Assignments",
        settingsPage: "Settings",
        shop: "Shop",
        settingsHeaderText: "Settings",
        settingsLangRussian: "Russian",
        settingsLangEnglish: "English",
        settingsLangFrench: "French",
        settingsThemeSelection: "Choose page theme:",
        settingsThemeLight: "Light Theme",
        settingsThemeDark: "Dark Theme",
        settingsThemeDark2: "Dark Theme 2",
        courseChechen: "Chechen Language 1",
        courseIngush: "Ingush Language",
        courseAdyge: "Adyghe Language",
        courseUdmurt: "Udmurt Language",
        courseTatar: "Tatar Language",
        courseChuvash: "Chuvash Language"
    },
    french: {
        menu: "Menu",
        coursesPage: "Liste des cours",
        ratingsPage: "Classements",
        lessonsPage: "Devoirs",
        settingsPage: "Paramètres",
        shop: "Magasin",
        settingsHeaderText: "Paramètres",
        settingsLangRussian: "Russe",
        settingsLangEnglish: "Anglais",
        settingsLangFrench: "Français",
        settingsThemeSelection: "Choix du thème de la page :",
        settingsThemeLight: "Thème clair",
        settingsThemeDark: "Thème sombre",
        settingsThemeDark2: "Thème sombre 2",
        courseChechen: "Langue tchétchène 1",
        courseIngush: "Langue ingouche",
        courseAdyge: "Langue adyghéenne",
        courseUdmurt: "Langue oudmourte",
        courseTatar: "Langue tatare",
        courseChuvash: "Langue tchouvache"
    }
};

function changeLanguage(language) {
    document.getElementById("menuTextTranslation").innerText = texts[language].menu;
    document.getElementById("coursesPageTextTranslation").innerText = texts[language].coursesPage;
    document.getElementById("ratingsPageTextTranslation").innerText = texts[language].ratingsPage;
    document.getElementById("lessonsPageTextTranslation").innerText = texts[language].lessonsPage;
    document.getElementById("settingsPageTextTranslation").innerText = texts[language].settingsPage;
    document.getElementById("shopTextTranslation").innerText = texts[language].shop;

    document.getElementById("settingsHeaderTextTranslation").innerText = texts[language].settingsHeaderText;
    document.getElementById("settingsLangRussianTranslation").innerText = texts[language].settingsLangRussian;
    document.getElementById("settingsLangEnglishTranslation").innerText = texts[language].settingsLangEnglish;
    document.getElementById("settingsLangFrenchTranslation").innerText = texts[language].settingsLangFrench;
    document.getElementById("settingsThemeSelectionTranslation").innerText = texts[language].settingsThemeSelection;
    document.getElementById("settingsThemeLightTranslation").innerText = texts[language].settingsThemeLight;
    document.getElementById("settingsThemeDarkTranslation").innerText = texts[language].settingsThemeDark;
    document.getElementById("settingsThemeDark2Translation").innerText = texts[language].settingsThemeDark2;

    document.getElementById("courseChechenTranslation").innerText = texts[language].courseChechen;
    document.getElementById("courseIngushTranslation").innerText = texts[language].courseIngush;
    document.getElementById("courseAdygeTranslation").innerText = texts[language].courseAdyge;
    document.getElementById("courseUdmurtTranslation").innerText = texts[language].courseUdmurt;
    document.getElementById("courseTatarTranslation").innerText = texts[language].courseTatar;
    document.getElementById("courseChuvashTranslation").innerText = texts[language].courseChuvash;
}
