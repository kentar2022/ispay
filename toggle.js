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

function navigateToCourse(language) {
    // Проверяем, авторизован ли пользователь
    fetch('getUserId.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }
            
            const userId = data.user_id;

            // Проверяем доступ к языку
            fetch(`get_user_languages.php?user_id=${userId}`)
                .then(response => response.json())
                .then(languageData => {
                    if (languageData.error) {
                        console.error('Error:', languageData.error);
                        return;
                    }

                    // Проверяем, есть ли у пользователя доступ к этому языку
                    if (languageData.languages.includes(language)) {
                        // Перенаправляем на страницу курса с параметрами
                        window.location.href = `course_roadmap.html?language=${language}&user_id=${userId}`;
                    } else {
                        console.error('Access denied to this language');
                    }
                })
                .catch(error => console.error('Error:', error));
        })
        .catch(error => console.error('Error:', error));
}

function showLanguage(language) {
    // Перенаправляем на страницу курса
    navigateToCourse(language);
}

function selectMobileLanguage(language) {
    // Закрываем дропдаун
    document.getElementById('mobileLanguageDropdown').style.display = 'none';
    // Перенаправляем на страницу курса
    navigateToCourse(language);
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