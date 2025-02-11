document.addEventListener('DOMContentLoaded', function() {
    fetch('getUserId.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }
            
            const userId = data.user_id;
            console.log('User ID retrieved:', userId); 

            // Получаем начатые языки
            fetch(`get_user_languages.php?user_id=${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error fetching languages:', data.error);
                        return;
                    }

                    /*console.log('Data received from get_user_languages.php:', data);*/
                    
                    
                    const options = document.querySelectorAll('#languageSelect option');
                    options.forEach(option => {
                        if (option.value !== 'none' && !data.languages.includes(option.value)) {
                            option.style.display = 'none';  
                        } else {
                            option.style.display = '';  
                        }
                    });

                    const mobileOptions = document.querySelectorAll('#mobileLanguageDropdown .language-option');
                    mobileOptions.forEach(option => {
                        const value = option.getAttribute('data-value');
                        if (value !== 'none' && !data.languages.includes(value)) {
                            option.style.display = 'none';  
                        } else {
                            option.style.display = '';  
                        }
                    });                    

                    
                    const largeCourses = document.querySelectorAll('.profile-course');
                    largeCourses.forEach(course => {
                        const language = course.getAttribute('data-language');
                        if (!data.languages.includes(language)) {
                            course.style.display = 'none';  
                        } else {
                            course.style.display = '';  
                        }
                    });

                    
                    const smallCourses = document.querySelectorAll('.small-screen-course-item');
                    smallCourses.forEach(course => {
                        const language = course.getAttribute('data-language');
                        if (!data.languages.includes(language)) {
                            course.style.display = 'none';  
                        } else {
                            course.style.display = ''; 
                        }
                    });
                })
                .catch(error => console.error('Error fetching languages:', error));
        })
        .catch(error => console.error('Error fetching user ID:', error));
});

/*
function addLanguage(language) {
    fetch('getUserId.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }

            const userId = data.user_id;
            
            // Отправляем запрос с user_id и языком
            fetch('add_language.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,  // Передаем user_id
                    language: language
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload(); // Перезагружаем текущую страницу
                } else {
                    console.error('Error adding language:', data.error);
                }
            })
            .catch(error => console.error('Error:', error));
        })
        .catch(error => console.error('Error fetching user ID:', error));
}
*/
