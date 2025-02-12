document.querySelectorAll('.lesson-block').forEach(function(block) {
    block.addEventListener('click', function(event) {
        var language = this.getAttribute('data-language');
        var lessonId = this.getAttribute('data-lang-id');

        localStorage.setItem('language', language);
        localStorage.setItem('lessonId', lessonId);
        // Перенаправляем пользователя на страницу с уроком
    });
});
