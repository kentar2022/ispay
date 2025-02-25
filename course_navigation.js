// Функция для получения параметров URL
function getUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    return {
        language: params.get('language'),
        userId: params.get('user_id')
    };
}

function initCoursePage() {
    const languageNames = {
        'chechen': 'Чеченский',
        'ingush': 'Ингушский',
        'adyge': 'Адыгейский',
        'udmurt': 'Удмуртский',
        'tatar': 'Татарский',
        'chuvash': 'Чувашский',
        'lezgin': 'Лезгинский',
        'moksha': 'Мокшанский',
        'bashkort': 'Башкирский'
    };
    
    const params = getUrlParameters();
    console.log('URL Parameters:', params);

    if (!params.language || !params.userId) {
        console.error('Missing required parameters');
        window.location.href = 'index.html';
        return;
    }

    // Устанавливаем название языка на русском
    const languageName = languageNames[params.language] || params.language;
    $('#languageTitle').text(`${languageName} язык`);
    
    // Устанавливаем флаг
    const flagImage = document.querySelector('img');
    if (flagImage) {
        flagImage.src = `courses_flags/${params.language}.png`;
        flagImage.alt = `${languageName} flag`;
    }

    // Загружаем данные курса
    fetch(`get_course_data.php?language=${params.language}&user_id=${params.userId}`)
        .then(response => response.json())
        .then(courseData => {
            if (courseData.error) throw new Error(courseData.error);
            displayCourseData(courseData);
        })
        .catch(error => {
            console.error('Error loading course data:', error);
            const container = document.getElementById('courseContent');
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-danger">
                        Ошибка загрузки курса: ${error.message}
                    </div>`;
            }
        });

    // Добавляем обработчик для кнопки "Назад"
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
}

// Инициализируем страницу после загрузки документа
document.addEventListener('DOMContentLoaded', initCoursePage);