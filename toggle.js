$(document).ready(function () {
    $('.lesson-block').click(function () {
        var lessonId = $(this).attr('id');
        localStorage.setItem('lessonId', lessonId); 
        window.location.href = 'Validator.js'; 
    });
});



function toggleHiddenBlock() {
    const mainBlock = document.querySelector('.main-block');
    mainBlock.classList.toggle('active');
}



function togglePages(pageId) {
   /* var coursesPage = document.getElementById("coursesPage");*/
    var settingsPage = document.getElementById("settingsPage");
    var profilePage = document.getElementById("profilePage");
    var languagesContainer = document.getElementById("languagesContainer");

    if (pageId === "coursesPage") {
        /*coursesPage.classList.remove("hidden");*/
        settingsPage.classList.add("hidden");
        profilePage.classList.add("hidden");
        languagesContainer.classList.add("hidden");
    } else if (pageId === "settingsPage") {
       /* coursesPage.classList.add("hidden");*/
        settingsPage.classList.remove("hidden");
        profilePage.classList.add("hidden");
        languagesContainer.classList.add("hidden");
    } else if (pageId === "profilePage") {
       /*coursesPage.classList.add("hidden");*/
        settingsPage.classList.add("hidden");
        profilePage.classList.remove("hidden");
        languagesContainer.classList.add("hidden");
    }
}





function showLanguage(languageId) {
    console.log('lessonsPage' + languageId); // Проверяем, что получили правильный languageId

    // Показываем родительский блок languagesContainer
    var languagesContainer = document.getElementById('languagesContainer');
    languagesContainer.classList.remove('hidden');

    // Сначала скрываем все блоки с языками
    var languageBlocks = document.querySelectorAll('.lessonsPage');
    languageBlocks.forEach(function(block) {
        block.classList.add('hidden');
    });

    // Показываем только выбранный блок с языком
    var languageBlockToShow = document.getElementById('lessonsPage' + languageId);
    languageBlockToShow.classList.remove('hidden');
}
