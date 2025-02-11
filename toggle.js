function toggleHiddenBlock() {
    const hiddenBlock = document.querySelector('.hidden-block');
    if (hiddenBlock) {
        hiddenBlock.classList.toggle('show');
    }
}

function togglePages(pageId) {
    const pages = {
        settingsPage: document.getElementById("settingsPage"),
        profilePage: document.getElementById("profilePage"),
        profilePageSmall: document.getElementById("profilePageSmall"),
        coursesPage: document.getElementById("coursesPage"),
        friendsPage: document.getElementById("friendsPage"),
        languagesContainer: document.getElementById("languagesContainer")
    };

    // Скрываем все страницы
    Object.values(pages).forEach(page => {
        if (page) page.classList.add("hidden");
    });

    // Показываем нужную страницу
    if (pageId === "profilePage") {
        if (window.innerWidth <= 1350 && pages.profilePageSmall) {
            showSmallProfile();
        } else if (pages.profilePage) {
            pages.profilePage.classList.remove('hidden');
        }
    } else {
        const targetPage = document.getElementById(pageId);
        if (targetPage) targetPage.classList.remove('hidden');
    }
}

function showLanguage(language) {
    // Показываем контейнер языков
    const languagesContainer = document.getElementById('languagesContainer');
    if (!languagesContainer) {
        console.error('Languages container not found');
        return;
    }

    // Скрываем все страницы
    togglePages('languagesContainer');

    // Скрываем все страницы уроков
    document.querySelectorAll('.lessonsPage').forEach(page => {
        page.classList.add('hidden');
    });

    // Определяем нужный контейнер
    const isSmallScreen = window.innerWidth <= 1330;
    const pageId = isSmallScreen ? 'smallScreenLessonsPage' : 'lessonsPage';
    const contentId = isSmallScreen ? 'smallScreenContent' : 'content';

    // Показываем нужный контейнер уроков
    const pageContainer = document.getElementById(pageId);
    if (!pageContainer) {
        console.error(`Lesson page container ${pageId} not found`);
        return;
    }

    // Показываем контейнер
    pageContainer.classList.remove('hidden');

    // Устанавливаем флаг
    const flagImg = pageContainer.querySelector('img');
    if (flagImg) {
        flagImg.src = `courses_flags/${language}.png`;
    }

    // Очищаем контейнер контента
    const contentContainer = document.getElementById(contentId);
    if (!contentContainer) {
        console.error(`Content container ${contentId} not found`);
        return;
    }
    contentContainer.innerHTML = '';

    // Загружаем данные курса
    fetch('getUserId.php')
        .then(response => response.json())
        .then(userData => {
            if (userData.error) throw new Error(userData.error);
            return fetch(`get_course_data.php?language=${language}&user_id=${userData.user_id}`);
        })
        .then(response => response.json())
        .then(courseData => {
            if (courseData.error) throw new Error(courseData.error);
            displayCourseData(courseData, contentId);
        })
        .catch(error => {
            console.error('Error loading course data:', error);
            if (contentContainer) {
                contentContainer.innerHTML = `<div class="error-message">Ошибка загрузки курса: ${error.message}</div>`;
            }
        });
}

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
    const languagesContainer = document.getElementById('languagesContainer');
    if (languagesContainer && !languagesContainer.classList.contains('hidden')) {
        const currentLanguage = document.querySelector('.language-active');
        if (currentLanguage) {
            const language = currentLanguage.getAttribute('data-language');
            if (language) {
                showLanguage(language);
            }
        }
    }
});