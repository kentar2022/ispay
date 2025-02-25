// course_init.js
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const language = params.get('language');
    const userId = params.get('user_id');

    if (!language || !userId) {
        window.location.href = 'index.html';
        return;
    }

    // Устанавливаем заголовок и флаг
    document.querySelector('#languageTitle').textContent = 
        language.charAt(0).toUpperCase() + language.slice(1);
    
    // Устанавливаем изображение флага
    const flagImage = document.querySelector('.language-flag');
    if (flagImage) {
        flagImage.src = `courses_flags/${language}.png`;
        flagImage.alt = `${language} flag`;
    }

    // Загружаем данные курса
    fetch(`get_course_data.php?language=${language}&user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            displayCourseData(data);
        })
        .catch(error => {
            console.error('Error loading course data:', error);
            const container = document.getElementById('courseContent');
            if (container) {
                container.innerHTML = `<div class="alert alert-danger">Ошибка загрузки курса: ${error.message}</div>`;
            }
        });

    // Обработчик кнопки "Назад"
    const backButton = document.querySelector('#backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
});