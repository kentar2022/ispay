// Переменные для элементов управления темой
var themeLight = document.getElementById('themeLight');
var themeDark = document.getElementById('themeDark');
var themeDark2 = document.getElementById('themeDark2');

// Переменные для ссылок, иконок SVG и текстовых элементов
var links = document.querySelectorAll('a, .a');
var svgIcons = document.querySelectorAll('svg');
var settingsPageText = document.querySelectorAll('.settingsPage *');
var coursesPageLinks = document.querySelectorAll('.courses a');
var profilePageElements = document.querySelectorAll('.profilePage *');
var selectLanguages = document.querySelectorAll('select > option, #languageSelect');


// Функция для применения стилей в соответствии с текущей темой
function applyStyles(bodyColor, linkColor, fillColor, settingsPageTextColor, coursesPageColor, profilePageTextColor) {
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
    coursesPageLinks.forEach(function(link) {
        link.style.color = coursesPageColor;
    });
    profilePageElements.forEach(function(element) {
        element.style.color = profilePageTextColor;
    });
    selectLanguages.forEach(function(element) {
        element.style.backgroundColor = bodyColor;
    });
    
    document.getElementById('languageSelectContainer').style.backgroundColor = bodyColor;

    // Сохраняем выбранные цвета в локальном хранилище
    localStorage.setItem('bodyColor', bodyColor);
    localStorage.setItem('linkColor', linkColor);
    localStorage.setItem('fillColor', fillColor);
    localStorage.setItem('settingsPageTextColor', settingsPageTextColor);
    localStorage.setItem('coursesPageColor', coursesPageColor);
    localStorage.setItem('profilePageTextColor', profilePageTextColor);
}

// Функция для установки темы "Светлая тема"
function setThemeLight() {
    var bodyColor = '#ffffff';
    var linkColor = '#000000';
    var fillColor = '#000000';
    var settingsPageTextColor = '#000000'; 
    var coursesPageColor = '#000000';
    var profilePageTextColor = '#000000';

    applyStyles(bodyColor, linkColor, fillColor, settingsPageTextColor, coursesPageColor, profilePageTextColor);
}

// Функция для установки темы "Темная тема"
function setThemeDark() {
    var bodyColor = '#293133';
    var linkColor = '#15E670';
    var fillColor = '#15E670';
    var settingsPageTextColor = '#ffffff'; 
    var coursesPageColor = '#ffffff';
    var profilePageTextColor = '#ffffff';

    applyStyles(bodyColor, linkColor, fillColor, settingsPageTextColor, coursesPageColor, profilePageTextColor);
}

// Функция для установки темы "Темная тема 2"
function setThemeDark2() {
    var bodyColor = '#293133';
    var linkColor = '#f3166b';
    var fillColor = '#f3166b';
    var settingsPageTextColor = '#ffffff'; 
    var coursesPageColor = '#ffffff';
    var profilePageTextColor = '#ffffff';

    applyStyles(bodyColor, linkColor, fillColor, settingsPageTextColor, coursesPageColor, profilePageTextColor);
}

// Функция для установки темы
function setTheme() {
    if (themeLight.checked) {
        setThemeLight();
        localStorage.setItem('currentTheme', 'light');
    } else if (themeDark.checked) {
        setThemeDark();
        localStorage.setItem('currentTheme', 'dark');
    } else if (themeDark2.checked) {
        setThemeDark2();
        localStorage.setItem('currentTheme', 'dark2');
    }
}

// Функция для загрузки темы при загрузке страницы
function loadTheme() {
    var savedTheme = localStorage.getItem('currentTheme');

    // Применяем сохраненную тему при загрузке страницы, если она есть
    if (savedTheme) {
        if (savedTheme === 'dark') {
            setThemeDark();
        } else if (savedTheme === 'dark2') {
            setThemeDark2();
        } else {
            setThemeLight();
        }
    }
}

// Вызываем функцию загрузки темы при загрузке страницы
window.onload = function() {
    loadTheme();
    loadLanguage();
};

// Добавляем слушатели событий для элементов выбора темы
themeLight.addEventListener('change', setTheme);
themeDark.addEventListener('change', setTheme);
themeDark2.addEventListener('change', setTheme);



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
        settingsLangSelection: "Выбор языка страницы:",
        settingsThemeLight: "Светлая тема",
        settingsThemeDark: "Темная тема",
        settingsThemeDark2: "Темная тема 2",
        courseChechen: "Чеченский язык",
        courseIngush: "Ингушский язык",
        courseAdyge: "Черкесский язык",
        courseUdmurt: "Удмуртский язык",
        courseTatar: "Татарский язык",
        courseChuvash: "Чувашский язык",
        userInfoHeader: "Информация о пользователе",
        userName: "Имя: Username",
        userEmail: "Email: user@example.com",
        userCountry: "Страна: Страна пользователя",
        coursesHeader: "Курсы",
        aboutHeader: "О себе",
        aboutDescription: "Краткое описание пользователя. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit amet purus diam.",
        statsHeader: "Статистика",
        score: "Количество очков: 1000",
        completedLessons: "Количество пройденных уроков: 50",
        globalRank: "Место в общей статистике: 10 из 1000",
        dailyGiftsHeader: "Ежедневные подарки",
        premiumOffer: "Получите доступ к дополнительным возможностям с премиум подпиской!",
        subscribeBtn: "Подписаться на премиум",
        giftElement: "День"

    },
    english: {
        menu: "Profile",
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
        settingsLangSelection: "Choose page language:",
        settingsThemeLight: "Light Theme",
        settingsThemeDark: "Dark Theme",
        settingsThemeDark2: "Dark Theme 2",
        courseChechen: "Chechen Language",
        courseIngush: "Ingush Language",
        courseAdyge: "Adyghe Language",
        courseUdmurt: "Udmurt Language",
        courseTatar: "Tatar Language",
        courseChuvash: "Chuvash Language",
        userInfoHeader: "User Information",
        userName: "Name: Username",
        userEmail: "Email: user@example.com",
        userCountry: "Country: User Country",
        coursesHeader: "Courses",
        aboutHeader: "About Me",
        aboutDescription: "Brief user description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit amet purus diam.",
        statsHeader: "Statistics",
        score: "Score: 1000",
        completedLessons: "Completed Lessons: 50",
        globalRank: "Global Rank: 10 out of 1000",
        dailyGiftsHeader: "Daily Gifts",
        premiumOffer: "Unlock additional features with a premium subscription!",
        subscribeBtn: "Subscribe to Premium",
        giftElement: "Day"
    },
    french: {
        menu: "Profile",
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
        settingsLangSelection: "Choix de la langue de la page :",
        settingsThemeLight: "Thème clair",
        settingsThemeDark: "Thème sombre",
        settingsThemeDark2: "Thème sombre 2",
        courseChechen: "Langue tchétchène",
        courseIngush: "Langue ingouche",
        courseAdyge: "Langue adyghéenne",
        courseUdmurt: "Langue oudmourte",
        courseTatar: "Langue tatare",
        courseChuvash: "Langue tchouvache",
        userInfoHeader: "Informations sur l'utilisateur",
        userName: "Nom: Nom d'utilisateur",
        userEmail: "Email: utilisateur@example.com",
        userCountry: "Pays: Pays de l'utilisateur",
        coursesHeader: "Cours",
        aboutHeader: "À propos de moi",
        aboutDescription: "Description succincte de l'utilisateur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit amet purus diam.",
        statsHeader: "Statistiques",
        score: "Score: 1000",
        completedLessons: "Leçons terminées: 50",
        globalRank: "Classement mondial: 10 sur 1000",
        dailyGiftsHeader: "Cadeaux quotidiens",
        premiumOffer: "Débloquez des fonctionnalités supplémentaires avec un abonnement premium !",
        subscribeBtn: "Souscrire à Premium",
        giftElement: "Jour"
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
    document.getElementById("settingsLangSelectionTranslation").innerText = texts[language].settingsLangSelection;
    document.getElementById("settingsThemeLightTranslation").innerText = texts[language].settingsThemeLight;
    document.getElementById("settingsThemeDarkTranslation").innerText = texts[language].settingsThemeDark;
    document.getElementById("settingsThemeDark2Translation").innerText = texts[language].settingsThemeDark2;

    document.getElementById("courseChechenTranslation").innerText = texts[language].courseChechen;
    document.getElementById("courseIngushTranslation").innerText = texts[language].courseIngush;
    document.getElementById("courseAdygeTranslation").innerText = texts[language].courseAdyge;
    document.getElementById("courseUdmurtTranslation").innerText = texts[language].courseUdmurt;
    document.getElementById("courseTatarTranslation").innerText = texts[language].courseTatar;
    document.getElementById("courseChuvashTranslation").innerText = texts[language].courseChuvash;

    document.getElementById("profileChechenTranslation").innerText = texts[language].courseChechen;
    document.getElementById("profileIngushTranslation").innerText = texts[language].courseIngush;
    document.getElementById("profileAdygeTranslation").innerText = texts[language].courseAdyge;
    document.getElementById("profileUdmurtTranslation").innerText = texts[language].courseUdmurt;
  /*  document.getElementById("profileTatarTranslation").innerText = texts[language].courseTatar;
    document.getElementById("profileChuvashTranslation").innerText = texts[language].courseChuvash;*/

    document.getElementById("userInfoHeaderTranslation").innerText = texts[language].userInfoHeader;
    document.getElementById("userNameTranslation").innerText = texts[language].userName;
    document.getElementById("userEmailTranslation").innerText = texts[language].userEmail;
    document.getElementById("userCountryTranslation").innerText = texts[language].userCountry;

    document.getElementById("coursesHeaderTranslation").innerText = texts[language].coursesHeader;

    document.getElementById("aboutHeaderTranslation").innerText = texts[language].aboutHeader;
    document.getElementById("aboutDescriptionTranslation").innerText = texts[language].aboutDescription;

    document.getElementById("statsHeaderTranslation").innerText = texts[language].statsHeader;
    document.getElementById("scoreTranslation").innerText = texts[language].score;
    document.getElementById("completedLessonsTranslation").innerText = texts[language].completedLessons;
    document.getElementById("globalRankTranslation").innerText = texts[language].globalRank;

    document.getElementById("dailyGiftsHeaderTranslation").innerText = texts[language].dailyGiftsHeader;

    document.getElementById("premiumOfferTranslation").innerText = texts[language].premiumOffer;
    document.getElementById("subscribeBtnTranslation").innerText = texts[language].subscribeBtn;

    document.getElementById('giftItemTranslation1').innerText = texts[language].giftElement;
    document.getElementById('giftItemTranslation2').innerText = texts[language].giftElement;
    document.getElementById('giftItemTranslation3').innerText = texts[language].giftElement;
    document.getElementById('giftItemTranslation4').innerText = texts[language].giftElement;
    document.getElementById('giftItemTranslation5').innerText = texts[language].giftElement;
    document.getElementById('giftItemTranslation6').innerText = texts[language].giftElement;
    document.getElementById('giftItemTranslation7').innerText = texts[language].giftElement;

    localStorage.setItem('currentLanguage', language);
}

function setLanguage(language) {
    changeLanguage(language);
    localStorage.setItem('currentLanguage', language);
}

function loadLanguage() {
    var savedLanguage = localStorage.getItem('currentLanguage');

    if (savedLanguage) {
        changeLanguage(savedLanguage);
    }
}