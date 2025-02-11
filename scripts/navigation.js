function showSection(section) {
    const language = event.currentTarget.closest('.page').id.replace('lessonsPage', '');
    
    // Сохранение языка и раздела в localStorage
    localStorage.setItem('selectedLanguage', language);
    localStorage.setItem('selectedSection', section);
    
    // Перенаправление на library.html
    window.location.href = 'library.html';
}



// Пример функции для обработки нажатия на вкладки
function handleTabClick(event) {
    const tab = event.currentTarget;
    const language = tab.closest('.page').id.replace('lessonsPage', '');
    const section = tab.dataset.section;
    
    showSection(language, section);
}
