// Переменные для переключателей тем
var themeLight = document.getElementById('themeLight');
var themeDark = document.getElementById('themeDark');
var themeDark2 = document.getElementById('themeDark2');

// Функция для установки темы
function setTheme(theme) {
    console.log(`Setting theme: ${theme}`);
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-dark2');
    document.body.classList.add(theme);
    localStorage.setItem('currentTheme', theme);
    console.log(`Current theme class on body: ${document.body.className}`);
}

// Установка темы по выбору пользователя
themeLight.addEventListener('change', function() {
    console.log('Light theme selected');
    setTheme('theme-light');
});
themeDark.addEventListener('change', function() {
    console.log('Dark theme selected');
    setTheme('theme-dark');
});
themeDark2.addEventListener('change', function() {
    console.log('Dark 2 theme selected');
    setTheme('theme-dark2');
});

// Загрузка темы при загрузке страницы
window.onload = function() {
    console.log('Page loaded');
    var savedTheme = localStorage.getItem('currentTheme');
    console.log(`Saved theme: ${savedTheme}`);
    if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'theme-dark') {
            themeDark.checked = true;
        } else if (savedTheme === 'theme-dark2') {
            themeDark2.checked = true;
        } else {
            themeLight.checked = true;
        }
    } else {
        console.log('No saved theme found, defaulting to light theme');
        themeLight.checked = true;
    }
};
