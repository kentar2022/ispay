// Список доступных курсов
const availableCourses = [
    {
        id: 'chechen',
        name: 'Чеченский язык',
        flag: 'courses_flags/chechen.png'
    },
    {
        id: 'lezgin',
        name: 'Лезгинский язык',
        flag: 'courses_flags/lezgin.png'
    },
    {
        id: 'ingush',
        name: 'Ингушский язык',
        flag: 'courses_flags/ingush.png'
    },
    {
        id: 'adyge',
        name: 'Черкесский язык',
        flag: 'courses_flags/adyge.png'
    },
    {
        id: 'udmurt',
        name: 'Удмуртский язык',
        flag: 'courses_flags/udmurt.png'
    },
    {
        id: 'tatar',
        name: 'Татарский язык',
        flag: 'courses_flags/tatar.png'
    },
    {
        id: 'chuvash',
        name: 'Чувашский язык',
        flag: 'courses_flags/chuvash.png'
    },
    {
        id: 'bashkort',
        name: 'Башкирский язык',
        flag: 'courses_flags/bashkort.png'
    },
    {
        id: 'moksha',
        name: 'Мокшанский язык',
        flag: 'courses_flags/moksha.png'
    }
];

// Функции для работы с курсами отключены
function openAddCourseModal() {}
function closeAddCourseModal() {}
function createCourseElement() {}
function handleAddCourse() {}
function showNotification() {}

// Функция для создания выпадающего меню
function createDropdownMenu() {
    console.log('Создание выпадающего меню...');
    const dropdown = document.createElement('div');
    dropdown.className = 'courses-dropdown';
    dropdown.innerHTML = `
        <div class="courses-dropdown-header">
            <h3>Выберите язык</h3>
        </div>
        <div class="courses-list"></div>
        <div class="courses-dropdown-footer">
            <button class="add-language-btn">Добавить язык</button>
        </div>
    `;
    document.body.appendChild(dropdown);
    console.log('Выпадающее меню создано');
    return dropdown;
}

// Функция для создания элемента курса
function createCourseElement(course) {
    const div = document.createElement('div');
    div.className = 'course-item-dropdown';
    div.setAttribute('data-value', course.id);
    div.innerHTML = `
        <img src="${course.flag}" alt="${course.name}">
        <span>${course.name}</span>
    `;
    return div;
}

// Функция для обновления списка курсов
function updateCoursesList() {
    const coursesList = document.querySelector('.courses-list');
    if (!coursesList) return;
    
    coursesList.innerHTML = '';
    
    // Получаем список языков пользователя
    fetch('getUserId.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }
            
            const userId = data.user_id;
            
            // Получаем языки пользователя
            fetch(`get_user_languages.php?user_id=${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error fetching languages:', data.error);
                        return;
                    }

                    const userLanguages = data.languages;
                    console.log('Языки пользователя из БД:', userLanguages);
                    
                    // Добавляем только те курсы, которые есть у пользователя
                    availableCourses.forEach(course => {
                        if (userLanguages.includes(course.id)) {
                            const element = createCourseElement(course);
                            coursesList.appendChild(element);
                        }
                    });
                })
                .catch(error => console.error('Error fetching languages:', error));
        })
        .catch(error => console.error('Error fetching user ID:', error));
}

// Функция для переключения видимости меню
function toggleDropdown() {
    const dropdown = document.querySelector('.courses-dropdown');
    if (!dropdown) return;
    
    dropdown.classList.toggle('show');
    if (dropdown.classList.contains('show')) {
        updateCoursesList();
    }
}

// Функция для обновления стилей кнопки
function updateButtonStyles() {
    const addLanguageBtn = document.querySelector('.add-language-btn');
    if (!addLanguageBtn) return;

    // Сначала очищаем все inline стили
    addLanguageBtn.style.cssText = '';
    
    // Добавляем базовые стили
    addLanguageBtn.style.padding = '8px 16px';
    addLanguageBtn.style.cursor = 'pointer';
    addLanguageBtn.style.fontSize = '14px';
    addLanguageBtn.style.width = '100%';
    addLanguageBtn.style.borderRadius = '0';
    addLanguageBtn.style.backgroundColor = 'transparent';
    addLanguageBtn.style.border = '1px solid';
    
    // Устанавливаем цвета в зависимости от темы
    if (document.body.classList.contains('light-theme')) {
        addLanguageBtn.style.color = '#293133';
        addLanguageBtn.style.borderColor = 'rgba(41, 49, 51, 0.1)';
    } else {
        addLanguageBtn.style.color = '#15E670';
        addLanguageBtn.style.borderColor = 'rgba(21, 230, 112, 0.1)';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, начинаем инициализацию...');
    
    // Получаем существующие элементы
    const coursesToggle = document.querySelector('.courses-toggle');
    const coursesDropdown = document.querySelector('.courses-dropdown');
    const coursesList = document.querySelector('.courses-list');
    
    if (!coursesToggle || !coursesDropdown || !coursesList) {
        console.error('Не найдены необходимые элементы');
        return;
    }

    // Добавляем footer с кнопкой, если его нет
    if (!coursesDropdown.querySelector('.courses-dropdown-footer')) {
        console.log('Добавление footer с кнопкой...');
        const footer = document.createElement('div');
        footer.className = 'courses-dropdown-footer';
        footer.innerHTML = '<hr><button class="add-language-btn">Добавить язык</button>';
        coursesDropdown.appendChild(footer);
        
        // Применяем стили к кнопке
        updateButtonStyles();
    }

    // Добавляем наблюдатель за изменениями класса body
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                updateButtonStyles();
            }
        });
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Обработчик клика по кнопке
    coursesToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Клик по кнопке переключения');
        coursesDropdown.classList.toggle('show');
        if (coursesDropdown.classList.contains('show')) {
            updateCoursesList();
        }
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!coursesToggle.contains(e.target) && !coursesDropdown.contains(e.target)) {
            coursesDropdown.classList.remove('show');
        }
    });

    // Обработка выбора языка
    coursesDropdown.addEventListener('click', function(e) {
        const courseItem = e.target.closest('.course-item-dropdown');
        if (courseItem) {
            const language = courseItem.getAttribute('data-value');
            showLanguage(language);
            selectLanguage(language);
            coursesDropdown.classList.remove('show');
        }
    });

    // Обработчик кнопки "Добавить язык"
    const addLanguageBtn = coursesDropdown.querySelector('.add-language-btn');
    if (addLanguageBtn) {
        console.log('Обработчик кнопки "Добавить язык" добавлен');
        addLanguageBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            window.location.href = 'courses.html';
        });
    } else {
        console.error('Кнопка "Добавить язык" не найдена');
    }
}); 