document.addEventListener('DOMContentLoaded', function() {
    var selectedLanguage = localStorage.getItem('language');
    var selectedSection = localStorage.getItem('selectedSection');

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
        const sectionContent = document.querySelector(`#${selectedLanguage} #${selectedSection}`);
        if (sectionContent) {
            sectionContent.classList.add('active');
        } else {
            console.error('Selected section content not found');
        }
    } else {
        console.error('Language or section not found in localStorage');
    }
});

function showSection(section) {
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    
    if (selectedLanguage) {
        localStorage.setItem('selectedSection', section);
        const sectionContent = document.querySelector(`#${selectedLanguage} .info-block.active`);
        if (sectionContent) {
            sectionContent.classList.remove('active');
        }
        const newSectionContent = document.querySelector(`#${selectedLanguage} #${section}`);
        if (newSectionContent) {
            newSectionContent.classList.add('active');
        }
    } else {
        console.error('No selected language in localStorage');
    }
}