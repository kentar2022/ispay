/*$(document).ready(function () {
    $('.lesson-block').click(function () {
        var lessonId = $(this).attr('id');
        localStorage.setItem('lessonId', lessonId); 
        window.location.href = 'Validator.js'; 
    });
});*/

/*function toggleContent(element) {
    var content = element.parentElement.querySelector('.lesson-content');
    content.classList.toggle('show');
}*/



function toggleHiddenBlock(language) {
    const mainBlocks = document.querySelectorAll('.main-block');
    mainBlocks.forEach(mainBlock => {
        if (mainBlock.dataset.language === language) {
            mainBlock.classList.toggle('active');
        }
    });
}


function togglePages(pageId) {
    /*console.log(pageId);*/
    var settingsPage = document.getElementById("settingsPage");
    var profilePage = document.getElementById("profilePage");
    var profilePageSmall = document.getElementById("profilePageSmall");
    var coursesPage = document.getElementById("coursesPage");
    /*var shopPage = document.getElementById("shopPage");*/
    var friendsPage = document.getElementById("friendsPage");
    var languagesContainer = document.getElementById("languagesContainer");

    // Скрываем все страницы
    languagesContainer.classList.add("hidden");
    settingsPage.classList.add("hidden");
    /*shopPage.classList.add("hidden");*/
    friendsPage.classList.add("hidden");
    profilePage.classList.add("hidden");
    coursesPage.classList.add("hidden");

    if (pageId === "profilePage") {
        if (window.innerWidth <= 1350 && profilePageSmall) {
            // Показать профиль для маленьких экранов
            showSmallProfile();
        } else {
            // Показать профиль для больших экранов
            profilePage.classList.remove('hidden');
        }
    } else {
        // Показываем выбранную страницу, кроме профиля
        document.getElementById(pageId).classList.remove('hidden');
    }
}

function showLanguage(languageId) {
    var settingsPage = document.getElementById("settingsPage");
    var profilePage = document.getElementById("profilePage");
    var profilePageSmall = document.getElementById("profilePageSmall"); 
    var coursesPage = document.getElementById("coursesPage");
    /*var shopPage = document.getElementById("shopPage");*/
    var friendsPage = document.getElementById("friendsPage");
    var languagesContainer = document.getElementById("languagesContainer");

    
    if (settingsPage) settingsPage.classList.add('hidden');
    /*if (shopPage) shopPage.classList.add('hidden');*/
    if (friendsPage) friendsPage.classList.add('hidden');
    if (profilePage) profilePage.classList.add('hidden');
    if (profilePageSmall) profilePageSmall.classList.add('hidden');
    if (coursesPage) coursesPage.classList.add('hidden');

    
    if (languagesContainer && languagesContainer.classList.contains('hidden')) {
        languagesContainer.classList.remove('hidden');
        /*console.log('Класс hidden был удалён у блока languagesContainer');*/
    } else if (languagesContainer) {
        /*console.log('Блок languagesContainer уже видим');*/
    } else {
        console.error("Блок languagesContainer не найден.");
    }

    
    var allLessonBlocks = document.querySelectorAll('#languagesContainer > div');
    allLessonBlocks.forEach(function(block) {
        block.classList.add('hidden'); // Скрываем все блоки
    });

    // Определяем, какой блок показать в зависимости от ширины экрана
    var blockToShow;
    if (window.innerWidth <= 1330) {
        // Мобильная версия: выбираем блок для маленьких экранов
        blockToShow = document.getElementById('smallScreenLessonsPage' + languageId);
    } else {
        // Десктопная версия: выбираем блок для больших экранов
        blockToShow = document.getElementById('lessonsPage' + languageId);
    }

    // Если найден нужный блок, показываем его
    if (blockToShow) {
        blockToShow.classList.remove('hidden');
        /*console.log('Показан блок для языка: ' + languageId);*/
    } else {
        console.error("Блок урока для выбранного языка не найден.");
    }
}
