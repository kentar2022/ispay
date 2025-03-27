// Список доступных курсов
const availableCourses = [
    {
        id: 'chechen',
        name: 'Чеченский язык',
        flag: 'courses_flags/chechen.png',
        description: 'Изучайте чеченский язык с нуля'
    },
    {
        id: 'lezgin',
        name: 'Лезгинский язык',
        flag: 'courses_flags/lezgin.png',
        description: 'Изучайте лезгинский язык с нуля'
    },
    {
        id: 'ingush',
        name: 'Ингушский язык',
        flag: 'courses_flags/ingush.png',
        description: 'Изучайте ингушский язык с нуля'
    },
    {
        id: 'adyge',
        name: 'Черкесский язык',
        flag: 'courses_flags/adyge.png',
        description: 'Изучайте черкесский язык с нуля'
    },
    {
        id: 'udmurt',
        name: 'Удмуртский язык',
        flag: 'courses_flags/udmurt.png',
        description: 'Изучайте удмуртский язык с нуля'
    },
    {
        id: 'tatar',
        name: 'Татарский язык',
        flag: 'courses_flags/tatar.png',
        description: 'Изучайте татарский язык с нуля'
    },
    {
        id: 'chuvash',
        name: 'Чувашский язык',
        flag: 'courses_flags/chuvash.png',
        description: 'Изучайте чувашский язык с нуля'
    },
    {
        id: 'bashkort',
        name: 'Башкирский язык',
        flag: 'courses_flags/bashkort.png',
        description: 'Изучайте башкирский язык с нуля'
    },
    {
        id: 'moksha',
        name: 'Мокшанский язык',
        flag: 'courses_flags/moksha.png',
        description: 'Изучайте мокшанский язык с нуля'
    }
];

// Функция для открытия модального окна
function openAddCourseModal() {
    const modal = document.getElementById('addCourseModal');
    const availableCoursesContainer = document.querySelector('.available-courses');
    
    // Очищаем контейнер
    availableCoursesContainer.innerHTML = '';
    
    // Добавляем доступные курсы
    availableCourses.forEach(course => {
        const courseElement = createCourseElement(course);
        availableCoursesContainer.appendChild(courseElement);
    });
    
    modal.style.display = 'block';
}

// Функция для закрытия модального окна
function closeAddCourseModal() {
    const modal = document.getElementById('addCourseModal');
    modal.style.display = 'none';
}

// Функция для создания элемента курса
function createCourseElement(course) {
    const div = document.createElement('div');
    div.className = 'course-item';
    div.innerHTML = `
        <img src="${course.flag}" alt="${course.name}">
        <h3>${course.name}</h3>
        <p>${course.description}</p>
    `;
    
    div.addEventListener('click', () => handleAddCourse(course));
    
    return div;
}

// Функция для обработки добавления курса
async function handleAddCourse(course) {
    try {
        const response = await fetch('scripts/add_language_to_profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `language=${encodeURIComponent(course.id)}`
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Инициализируем таблицы прогресса для нового языка
            await initializeProgressTables();
            
            // Создаем и добавляем новый курс на страницу
            const coursesContainer = document.querySelector('.courses');
            const newCourse = createCourseElement(course);
            coursesContainer.appendChild(newCourse);
            
            // Закрываем модальное окно
            closeAddCourseModal();
            
            // Показываем уведомление об успехе
            showNotification('Курс успешно добавлен!');
        } else {
            console.error('Ошибка при добавлении курса:', data.error);
            showNotification('Ошибка при добавлении курса', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Произошла ошибка', 'error');
    }
}

// Функция для показа уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Закрытие модального окна при клике вне его области
window.onclick = function(event) {
    const modal = document.getElementById('addCourseModal');
    if (event.target === modal) {
        closeAddCourseModal();
    }
}

// Добавляем обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    const addCourseBtn = document.getElementById('addCourseBtn');
    const closeBtn = document.querySelector('.close');
    const courseForm = document.querySelector('.course-form');
    
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', openAddCourseModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddCourseModal);
    }
    
    if (courseForm) {
        courseForm.addEventListener('submit', handleAddCourse);
    }
    
    // Закрываем модальное окно при клике вне его
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('addCourseModal');
        if (event.target === modal) {
            closeAddCourseModal();
        }
    });
}); 