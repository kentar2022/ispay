var lessonId = 1;
var language = localStorage.getItem('language');


if (lessonId !== null) {
    console.log('Received lesson ID:', lessonId);
    console.log('Received language:', language);
    loadLesson(language, lessonId);
} else {
    console.log('No lesson ID found.');
}


localStorage.removeItem('lessonId');
localStorage.removeItem('language');
