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
    var lessonsPage = document.getElementById("lessonsPage");
    var coursesPage = document.getElementById("coursesPage");
    var settingsPage = document.getElementById("settingsPage");

    if (pageId === "lessonsPage") {
        lessonsPage.classList.remove("hidden");
        coursesPage.classList.add("hidden");
        settingsPage.classList.add("hidden");
    } else if (pageId === "coursesPage") {
        lessonsPage.classList.add("hidden");
        coursesPage.classList.remove("hidden");
        settingsPage.classList.add("hidden");
    } else if (pageId === "settingsPage") {
        lessonsPage.classList.add("hidden");
        coursesPage.classList.add("hidden");
        settingsPage.classList.remove("hidden");
    }
}
