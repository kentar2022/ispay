document.querySelectorAll('.add-language-button').forEach(button => {
    const language = button.dataset.language;
    
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            console.log('Starting language addition for:', language);
            
            const userResponse = await fetch('getUserId.php');
            const userData = await userResponse.json();
            
            if (userData.error) {
                console.error('Error:', userData.error);
                return;
            }
            
            const userId = userData.user_id;
            console.log('Got user ID:', userId);
            console.log('Sending data:', { user_id: userId, language: language }); // Добавим лог отправляемых данных
            
            // Отключаем кнопку на время выполнения запроса
            button.disabled = true;
            button.textContent = '...';

            // 1. Добавляем язык в профиль
            const addResponse = await fetch('add_language_to_profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    language: language
                })
            });

            const addResult = await addResponse.json();
            console.log('Add language result:', addResult);

            if (addResult.success) {
                // 2. Инициализируем таблицы прогресса
                const initResponse = await fetch('initialize_progress_tables.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        language: language
                    })
                });

                // Добавим проверку ответа
                if (!initResponse.ok) {
                    throw new Error(`HTTP error! status: ${initResponse.status}`);
                }
                
                const initResult = await initResponse.json();
                console.log('Initialize progress result:', initResult);

                if (initResult.success) {
                    button.textContent = '✓';
                    button.classList.add('added');
                    showNotification('Курс успешно добавлен!', 'success');
                    
                    // Закомментируем редирект для отладки
                    /*setTimeout(() => {
                        window.location.href = `${language}_lessons_menu.html`;
                    }, 1000);*/
                } else {
                    throw new Error(initResult.error || 'Failed to initialize course progress');
                }
            } else {
                throw new Error(addResult.error || 'Failed to add language to profile');
            }

        } catch (error) {
            console.error('Full error details:', error);
            button.disabled = false;
            button.textContent = '+';
            showNotification('Произошла ошибка при добавлении курса. Пожалуйста, попробуйте снова.', 'error');
        }
    });
});

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Добавляем стили
const style = document.createElement('style');
style.textContent = `
    .add-language-button {
        transition: all 0.3s ease;
    }

    .add-language-button.added {
        background-color: #4CAF50;
        color: white;
        cursor: not-allowed;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    }

    .notification.success {
        background-color: #4CAF50;
    }

    .notification.error {
        background-color: #f44336;
    }

    .notification.info {
        background-color: #2196F3;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);