function displayCourseData(data, containerId) {
    // Находим контейнер
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id '${containerId}' not found`);
        return;
    }

    // Очищаем контейнер
    container.innerHTML = '';

    // Создаем контейнер для уроков
    const lessonsContainer = document.createElement('div');
    lessonsContainer.className = 'lessons-container';

    // Добавляем каждую тему
    data.forEach(theme => {
        const lessonBlock = createLessonBlock(theme);
        lessonsContainer.appendChild(lessonBlock);
    });

    container.appendChild(lessonsContainer);
}

function createLessonBlock(theme) {
    const block = document.createElement('div');
    block.className = 'lesson-block';
    block.setAttribute('data-lesson-id', theme.id);

    // Создаем заголовок блока
    const header = document.createElement('div');
    header.className = 'lesson-header';
    header.onclick = function() { toggleContent(this); };

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'lesson-toggle-icon';
    toggleIcon.textContent = '▼';

    const title = document.createElement('h2');
    title.className = 'lesson-title';
    title.textContent = theme.name;

    const index = document.createElement('span');
    index.className = 'lesson-index';
    index.textContent = `0 / ${theme.total_topics}`;

    header.appendChild(toggleIcon);
    header.appendChild(title);
    header.appendChild(index);

    // Создаем контент блока
    const content = document.createElement('div');
    content.className = 'lesson-content';

    // Добавляем топики
    if (theme.topics && Array.isArray(theme.topics)) {
        theme.topics.forEach(topic => {
            const topicElement = document.createElement('p');
            topicElement.className = 'topic-link';
            topicElement.setAttribute('data-topic-id', topic.id);
            topicElement.style.cursor = 'pointer';
            topicElement.textContent = `${topic.name} ${topic.completed_lessons || 0} / ${topic.total_lessons}`;
            content.appendChild(topicElement);
        });
    }

    // Создаем прогресс-бар
    const progress = document.createElement('div');
    progress.className = 'lesson-progress';
    const progressSpan = document.createElement('span');
    progressSpan.textContent = '0%';
    progress.appendChild(progressSpan);

    // Собираем все вместе
    block.appendChild(header);
    block.appendChild(content);
    block.appendChild(progress);

    return block;
}

// Функция для переключения видимости контента
function toggleContent(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.lesson-toggle-icon');
    
    if (content && icon) {
        if (content.style.display === 'none' || !content.style.display) {
            content.style.display = 'block';
            icon.textContent = '▼';
        } else {
            content.style.display = 'none';
            icon.textContent = '▶';
        }
    }
}