// Обработка выпадающего меню языков
document.addEventListener('DOMContentLoaded', function() {
    const coursesToggle = document.querySelector('.courses-toggle');
    const coursesDropdown = document.querySelector('.courses-dropdown');
    const courseItems = document.querySelectorAll('.course-item-dropdown');

    if (!coursesToggle || !coursesDropdown) {
        console.error('Не найдены элементы выпадающего меню');
        return;
    }

    // Показать/скрыть выпадающее меню при клике на кнопку
    coursesToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        coursesDropdown.classList.toggle('show');
    });

    // Закрыть выпадающее меню при клике вне его
    document.addEventListener('click', function(event) {
        if (!coursesToggle.contains(event.target) && !coursesDropdown.contains(event.target)) {
            coursesDropdown.classList.remove('show');
        }
    });

    // Обработка выбора языка
    courseItems.forEach(item => {
        item.addEventListener('click', function() {
            const language = this.getAttribute('data-value');
            // Вызываем существующие функции для обработки выбранного языка
            showLanguage(language);
            selectLanguage(language);
            coursesDropdown.classList.remove('show');
        });
    });
});

function displayCourseData(data) {
    const container = document.getElementById('courseContent');
    if (!container) {
        console.error('Container not found');
        return;
    }

    console.log('Course data received:', data);

    // Считаем общий прогресс курса
    let totalLessons = 0;
    let completedLessons = 0;
    
    data.forEach(theme => {
        theme.topics.forEach(topic => {
            totalLessons += parseInt(topic.total_lessons);
            completedLessons += parseInt(topic.completed_lessons || 0);
        });
    });
    
    // Вычисляем процент прогресса
    const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Обновляем прогресс-бар и текст
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.text-muted');
    
    if (progressBar && progressText) {
        progressBar.style.width = `${courseProgress}%`;
        progressBar.setAttribute('aria-valuenow', courseProgress);
        progressText.textContent = `${courseProgress}% завершено`;
    }

    // Очищаем контейнер
    container.innerHTML = '';

    // Добавляем линию времени
    const timelineLine = document.createElement('div');
    timelineLine.className = 'timeline-line';
    container.appendChild(timelineLine);

    // Загружаем статус уроков
    $.ajax({
        url: 'get_lesson_status.php',
        method: 'POST',
        data: { language: getUrlParameters().language },
        dataType: 'json',
        success: function(statusData) {
            console.log('Status data received:', statusData);
            
            data.forEach((theme, index) => {
                const section = createTimelineItem(theme, theme.theme_progress, index);
                container.appendChild(section);
            });
        },
        error: function(error) {
            console.error('Error loading lesson status:', error);
            data.forEach((theme, index) => {
                const section = createTimelineItem(theme, null, index);
                container.appendChild(section);
            });
        }
    });
}

function createTimelineItem(theme, themeProgress, index) {
    // Правильный расчет общего количества уроков и завершенных уроков
    const totalLessonsInTheme = theme.topics.reduce((sum, topic) => sum + parseInt(topic.total_lessons), 0);
    const completedLessonsInTheme = theme.topics.reduce((sum, topic) => sum + (parseInt(topic.completed_lessons) || 0), 0);
    const progressPercentage = Math.round((completedLessonsInTheme / totalLessonsInTheme) * 100);

    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';

    const point = document.createElement('div');
    point.className = `timeline-point border-${getColorClass(index)}`;
    timelineItem.appendChild(point);

    const content = document.createElement('div');
    content.className = 'timeline-content';

    const card = document.createElement('div');
    card.className = 'card section-card shadow-sm';
    card.innerHTML = `
        <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="h4 mb-0">
                    <i class="bi ${getThemeIcon(theme.theme_name)} text-${getColorClass(index)} me-2"></i>
                    ${theme.theme_name}
                </h3>
                <span class="badge bg-${getColorClass(index)}">${progressPercentage}%</span>
            </div>
            <div class="progress mb-3">
                <div class="progress-bar bg-${getColorClass(index)}" role="progressbar" 
                     style="width: ${progressPercentage}%">
                </div>
            </div>
            <div class="lessons-count mb-3">
                ${completedLessonsInTheme}/${totalLessonsInTheme} уроков
            </div>
            <div class="topics">
                ${createTopicsList(theme.topics)}
            </div>
        </div>
    `;

    content.appendChild(card);
    timelineItem.appendChild(content);
    return timelineItem;
}


function createTopicsList(topics) {
    if (!topics || !Array.isArray(topics)) return '';
    
    let previousTopicCompleted = true;
    
    return topics.map(topic => {
        const completedLessons = topic.completed_lessons || 0;
        const isLocked = !previousTopicCompleted;
        const isCompleted = completedLessons === topic.total_lessons;
        const progressPercent = Math.round((completedLessons / topic.total_lessons) * 100);
        
        previousTopicCompleted = isCompleted;
        
        return `
            <div class="topic-item ${isCompleted ? 'completed-topic' : ''} ${isLocked ? 'locked-topic' : ''}" 
                 data-topic-id="${topic.id}"
                 data-completed-lessons="${completedLessons}"
            >
                <div class="d-flex justify-content-between align-items-center flex-wrap w-100">
                    <div class="topic-title mb-1">
                        <i class="bi ${isLocked ? 'bi-lock-fill' : getTopicIcon(completedLessons, topic.total_lessons)} me-2"></i>
                        ${topic.topic_name}
                    </div>
                    <div class="d-flex align-items-center progress-container">
                        <div class="progress me-2" style="width: 100px; height: 6px;">
                            <div class="progress-bar bg-${isCompleted ? 'success' : isLocked ? 'secondary' : 'primary'}" 
                                 style="width: ${progressPercent}%">
                            </div>
                        </div>
                        <span class="badge ${getTopicBadgeClass(completedLessons, topic.total_lessons)} rounded-pill">
                            ${completedLessons}/${topic.total_lessons}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getColorClass(index) {
    const colors = ['primary', 'success', 'info', 'warning', 'danger'];
    return colors[index % colors.length];
}

function getThemeIcon(themeName) {
    const icons = {
        'Буквы и звуки': 'bi-music-note',
        'Числа': 'bi-123',
        'Цвета': 'bi-palette',
        'Местоимения': 'bi-person',
        'Существительные': 'bi-box',
        'Прилагательные': 'bi-palette',
        'Числительные': 'bi-123',
        'Предлоги и послелоги': 'bi-arrow-left-right',
        'Настоящее время': 'bi-clock',
        'Прошедшее время': 'bi-clock-history',
        'Будущее время': 'bi-clock-fill',
        'Повелительное наклонение': 'bi-exclamation-circle',
        'Условное наклонение': 'bi-question-circle',
        'Причастия и деепричастия': 'bi-pencil',
        'Бытовые темы': 'bi-house',
        'Природа и окружение': 'bi-tree',
        'Общество': 'bi-people',
        'Человек': 'bi-person'
    };
    return icons[themeName] || 'bi-book';
}

function getTopicIcon(completed, total) {
    if (completed >= total) return 'bi-check-circle-fill text-success';
    if (completed > 0) return 'bi-play-circle text-primary';
    return 'bi-lock text-muted';
}

function getTopicBadgeClass(completed, total) {
    if (completed >= total) return 'bg-success';
    if (completed > 0) return 'bg-primary';
    return 'bg-secondary';
}

// Добавляем обработчик клика для топиков
document.addEventListener('click', function(e) {
    const topicItem = e.target.closest('.topic-item');
    if (topicItem && 
        !topicItem.classList.contains('completed-topic') && 
        !topicItem.classList.contains('locked-topic')) {
        const topicId = topicItem.dataset.topicId;
        const completedLessons = topicItem.dataset.completedLessons;
        const language = getUrlParameters().language;
        if (topicId && language) {
            const lessonId = completedLessons || 0;
            window.location.href = `lesson.html?topicId=${topicId}&language=${language}&completedLessons=${completedLessons || 0}&lesson_id=${lessonId}`;
        }
    }
});