document.addEventListener('DOMContentLoaded', function() {
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    const selectedSection = localStorage.getItem('selectedSection');

    if (selectedLanguage && selectedSection) {
        console.log(`Selected Language: ${selectedLanguage}`);
        console.log(`Selected Section: ${selectedSection}`);

        // Показать выбранный язык
        const languageContent = document.getElementById(selectedLanguage);
        if (languageContent) {
            languageContent.style.display = 'block';
        } else {
            console.error('Selected language content not found');
        }

        // Показать выбранный раздел
        const sectionContent = document.querySelector(`#${selectedLanguage}-${selectedSection}`);
        if (sectionContent) {
            sectionContent.classList.add('active');
        } else {
            console.error('Selected section content not found');
        }
    } else {
        console.error('Language or section not found in localStorage');
    }
});



function showSection(language, section) {
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    
    if (selectedLanguage === language) {
        localStorage.setItem('selectedSection', section);
        
        const activeSection = document.querySelector(`#${selectedLanguage}-${section}`);
        if (activeSection) {
            // Удалить класс 'active' у всех info-block в выбранном языке
            const activeLanguage = document.getElementById(selectedLanguage);
            if (activeLanguage) {
                const allSections = activeLanguage.querySelectorAll('.info-block');
                allSections.forEach(block => block.classList.remove('active'));
            }
            
            // Добавить класс 'active' к выбранному section
            activeSection.classList.add('active');
        } else {
            console.error(`Section ${section} not found for language ${language}`);
        }
    } else {
        console.error('Selected language does not match');
    }
}
