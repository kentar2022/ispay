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
    console.log(pageId);
    var settingsPage = document.getElementById("settingsPage");
    var profilePage = document.getElementById("profilePage");
    var coursesPage = document.getElementById("coursesPage");
    var languagesContainer = document.getElementById("languagesContainer");

    if (pageId === "coursesPage") {
        languagesContainer.classList.add("hidden");
        settingsPage.classList.add("hidden");
        profilePage.classList.add("hidden");
    } else if (pageId === "settingsPage") {
        languagesContainer.classList.add("hidden");
        settingsPage.classList.remove("hidden");
        profilePage.classList.add("hidden");
    } else if (pageId === "profilePage") {
        languagesContainer.classList.add("hidden");
        settingsPage.classList.add("hidden");
        profilePage.classList.remove("hidden");
    } else if (pageId === "languagesContainer") {
        settingsPage.classList.add("hidden");
        profilePage.classList.add("hidden");
        languagesContainer.classList.remove("hidden");
    }
}




function showLanguage(languageId) {
    console.log("languageId:" + languageId);
    var languageBlockToShow = document.getElementById('lessonsPage' + languageId);
    var languagesContainer = document.getElementById("languagesContainer");

    languagesContainer.classList.remove("hidden");
    console.log(languageBlockToShow);
    // Показываем выбранный блок языка
    if (languageBlockToShow) {
        languageBlockToShow.classList.remove("hidden");
    }

    // Скрываем остальные блоки, кроме languagesContainer
    var allLanguageBlocks = document.querySelectorAll(".lessonsPage");
    allLanguageBlocks.forEach(function(block) {
        if (block !== languageBlockToShow && block !== languagesContainer) {
            block.classList.add("hidden");
        }
    });

    // Вызываем функцию togglePages() для скрытия других страниц
    togglePages('languagesContainer');
}
