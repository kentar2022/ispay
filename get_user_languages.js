document.addEventListener('DOMContentLoaded', function() {
    // Сначала получаем user_id с помощью запроса к getUserId.php
    fetch('getUserId.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }
            
            const userId = data.user_id;
            console.log('User ID retrieved:', userId); // Отладочное сообщение

            // Далее используем user_id для получения начатых языков
            fetch(`get_user_languages.php?user_id=${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error fetching languages:', data.error);
                        return;
                    }
                    
                    console.log('Data received from get_user_languages.php:', data); // Отладочное сообщение
                    
                    const options = document.querySelectorAll('#languageSelect option');

                    // Скрываем курсы, которые не были начаты
                    options.forEach(option => {
                        if (option.value !== 'none' && !data.languages.includes(option.value)) {
                            option.style.display = 'none';  // Скрываем, если язык не в списке
                        } else {
                            option.style.display = '';  // Показываем, если язык в списке
                        }
                    });
                })
                .catch(error => console.error('Error fetching languages:', error));
        })
        .catch(error => console.error('Error fetching user ID:', error));
});
