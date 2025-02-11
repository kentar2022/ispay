// Функции обновления данных
function updateUserInfo(user) {
    /*console.log('Updating user info:', user);*/
    
    // Обновляем текстовые данные
    document.querySelectorAll('.mainNickname').forEach(element => {
        /*console.log('Updating nickname element:', element);*/
        element.textContent = user.nickname || user.email || 'Пользователь';
    });

    document.querySelectorAll('.mainEmail').forEach(element => {
        /*console.log('Updating email element:', element);*/
        element.textContent = user.email || '';
    });

    document.querySelectorAll('.mainCountry').forEach(element => {
        /*console.log('Updating country element:', element);*/
        element.textContent = user.country || 'Не указано';
    });

    // Обновляем аватар
    document.querySelectorAll('img[id^="userAvatar"]').forEach(element => {
        /*console.log('Updating avatar element:', element);*/
        if (user.avatar && user.avatar !== '') {
           /* console.log('Setting avatar src to:', user.avatar);*/
            element.src = user.avatar;
        } else {
           /* console.log('Using default avatar');*/
            element.src = 'images/avatar.png';
        }
        element.onerror = function() {
            /*console.log('Avatar load error, using default');*/
            this.src = 'images/avatar.png';
        };
    });
}

function updateModalInfo(user) {
    /*console.log('Updating modal info:', user);*/
    
    document.querySelectorAll('.nickname').forEach(element => {
        /*console.log('Updating modal nickname element:', element);*/
        element.textContent = user.nickname || user.email || 'Пользователь';
    });

    document.querySelectorAll('.email').forEach(element => {
        /*console.log('Updating modal email element:', element);*/
        element.textContent = user.email || '';
    });

    document.querySelectorAll('.country').forEach(element => {
        /*console.log('Updating modal country element:', element);*/
        element.textContent = user.country || 'Не указано';
    });

    document.querySelectorAll('.profile-avatar').forEach(avatar => {
        /*console.log('Updating modal avatar element:', avatar);*/
        avatar.src = user.avatar || 'images/avatar.png';
        avatar.onerror = function() {
            /*console.log('Modal avatar load error, using default');*/
            this.src = 'images/avatar.png';
        };
    });
}

function getUserInfo(callback) {
    /*console.log('Getting user info...');*/
    fetch('login/profile.php')
        .then(response => {
            /*console.log('Profile response status:', response.status);*/
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            /*console.log('Received user data:', data);*/
            if (data.error === 'Unauthorized') {
                /*console.log('User unauthorized');*/
                window.location.href = 'login/login.html';
                return;
            }
            if (callback) {
                /*console.log('Executing callback with data');*/
                callback(data);
            }
        })
        .catch(error => {
            console.error('Error getting user info:', error);
            if (error.message.includes('Unauthorized')) {
                window.location.href = 'login/login.html';
            }
        });
}

function updateCourseBlocksVisibility(user) {
    /*console.log('Updating course blocks visibility:', user);*/
    const userLanguages = user.languages;
    /*console.log('User languages:', userLanguages);*/

    const courseBlocks = document.querySelectorAll('.profile-course');
    /*console.log('Found course blocks:', courseBlocks.length);*/

    courseBlocks.forEach(courseBlock => {
        const courseLanguage = courseBlock.dataset.language;
        /*console.log('Processing course:', courseLanguage);*/
        if (userLanguages && userLanguages.includes(courseLanguage)) {
            /*console.log('Showing course:', courseLanguage);*/
            courseBlock.style.display = 'block';
        } else {
            /*console.log('Hiding course:', courseLanguage);*/
            courseBlock.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    /*console.log('DOM loaded, initializing...');*/




// Добавьте эти стили в ваш CSS
const styles = `
.avatar-loading {
    position: relative;
}

.avatar-loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
}

.avatar-loading::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    z-index: 1;
}

@keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}
`;

// Добавляем стили на страницу
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Обновленный обработчик загрузки аватара
function initAvatarUpload() {
    document.querySelectorAll('.profile-avatar').forEach(avatar => {
        avatar.addEventListener('click', function() {
            const fileInput = this.parentElement.querySelector('.avatar-upload');
            fileInput.click();
        });
    });

    document.querySelectorAll('.avatar-upload').forEach(input => {
        input.addEventListener('change', async function(e) {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                
                if (!file.type.startsWith('image/')) {
                    alert('Пожалуйста, выберите изображение');
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    alert('Файл слишком большой. Максимальный размер 5MB');
                    return;
                }

                const avatars = document.querySelectorAll('.profile-avatar');
                avatars.forEach(avatar => avatar.parentElement.classList.add('avatar-loading'));

                try {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        avatars.forEach(avatar => {
                            avatar.src = e.target.result;
                        });
                    };
                    reader.readAsDataURL(file);

                    const formData = new FormData();
                    formData.append('avatar', file);
                    formData.append('field', 'avatar');
                    formData.append('csrf_token', document.querySelector('input[name="csrf_token"]').value);

                    const response = await fetch('login/update_profile.php', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();

                    if (data.success) {
                        /*console.log('Аватар обновлен:', data.avatar_path);*/
                        // Обновляем информацию на странице без перезагрузки
                        getUserInfo((userData) => {
                            updateUserInfo(userData);
                            updateModalInfo(userData);
                        });
                    } else {
                        throw new Error(data.error || 'Ошибка при обновлении аватара');
                    }

                } catch (error) {
                    console.error('Ошибка:', error);
                    alert(error.message || 'Ошибка при загрузке аватара');
                    avatars.forEach(avatar => {
                        avatar.src = avatar.getAttribute('data-original-src') || 'images/avatar.png';
                    });
                } finally {
                    avatars.forEach(avatar => avatar.parentElement.classList.remove('avatar-loading'));
                }
            }
        });
    });

    document.querySelectorAll('.profile-avatar').forEach(avatar => {
        avatar.setAttribute('data-original-src', avatar.src);
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initAvatarUpload);    

    // Инициализация модальных окон
    const openModalButtons = document.querySelectorAll('.btn-primary');
    /*console.log('Found modal buttons:', openModalButtons.length);*/
    
    const closeModalButtons = document.querySelectorAll('.close');
    /*console.log('Found close buttons:', closeModalButtons.length);*/
    
    const modals = document.querySelectorAll('.modal');
    /*console.log('Found modals:', modals.length);*/


    document.querySelectorAll('.profile-avatar').forEach(avatar => {
        avatar.addEventListener('click', function() {
            // Находим ближайший input file
            const fileInput = this.parentElement.querySelector('.avatar-upload');
            fileInput.click();
        });
    });

    document.querySelectorAll('.avatar-upload').forEach(input => {
        input.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                
                // Проверка типа файла
                if (!file.type.startsWith('image/')) {
                    alert('Пожалуйста, выберите изображение');
                    return;
                }

                // Проверка размера файла (например, не более 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Файл слишком большой. Максимальный размер 5MB');
                    return;
                }

                // Создаем FormData
                const formData = new FormData();
                formData.append('avatar', file);
                formData.append('field', 'avatar');
                formData.append('csrf_token', document.querySelector('input[name="csrf_token"]').value);

                // Показываем превью
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.querySelectorAll('.profile-avatar').forEach(avatar => {
                        avatar.src = e.target.result;
                    });
                };
                reader.readAsDataURL(file);

                // Отправляем файл на сервер
                fetch('login/update_profile.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('Аватар успешно обновлен');
                    } else {
                        alert(data.error || 'Ошибка при обновлении аватара');
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Ошибка при загрузке аватара');
                });
            }
        });
    });     

    // Открытие модального окна
    openModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            /*console.log('Modal button clicked');*/
            const modalType = this.closest('.small-screen-profile-info') ? 
                '.small-screen-modal' : '.large-screen-modal';
           /* console.log('Modal type:', modalType);*/
            const modal = document.querySelector(modalType);
           /* console.log('Found modal:', modal);*/
            if (modal) {
                modal.style.display = 'block';
                getUserInfo(updateModalInfo);
            } else {
                console.error('Modal not found for type:', modalType);
            }
        });
    });

    // Закрытие модальных окон
    closeModalButtons.forEach(closeButton => {
        closeButton.addEventListener('click', function() {
            /*console.log('Close button clicked');*/
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Закрытие по клику вне окна
    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                /*console.log('Closing modal by outside click');*/
                modal.style.display = 'none';
            }
        });
    });

// Обработка одиночного клика
const editableElements = document.querySelectorAll('.editable');
/*console.log('Found editable elements:', editableElements.length);*/

editableElements.forEach(item => {
    item.addEventListener('click', function() {
        /*console.log('Click on editable element');*/
        const span = this.querySelector('span');
        if (!span) {
            console.error('Span not found in editable element');
            return;
        }

        const modalContent = this.closest('.modal-content');
        if (!modalContent) {
            console.error('Modal content not found');
            return;
        }

        const form = modalContent.querySelector('.updateForm');
        if (!form) {
            console.error('Update form not found');
            return;
        }

        const inputField = form.querySelector('#field');
        const inputValue = form.querySelector('#value');
        
        if (!inputField || !inputValue) {
            console.error('Form inputs not found');
            return;
        }

        const field = span.classList[0];
        const value = span.textContent;
        
        /*console.log('Setting form values:', { field, value });*/
        try {
            inputValue.value = value;
            inputField.value = field;
            form.style.display = 'block';
            inputValue.focus();
        } catch (error) {
            console.error('Error setting form values:', error);
        }
    });
});

    // Обработка форм обновления
    document.querySelectorAll('.updateForm').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            try {
                const response = await fetch('login/update_profile.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    location.reload(); // Перезагружаем страницу после успешного обновления
                } else {
                    throw new Error(data.error || 'Ошибка при обновлении данных');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert(error.message || 'Ошибка при обновлении данных');
            }
        });
    });    

    // Обработка аватара
    const profileAvatar = $('#profileAvatar');
    /*console.log('Profile avatar element:', profileAvatar.length ? 'found' : 'not found');*/

    profileAvatar.on('click', function() {
        console.log('Avatar clicked');
        $('#avatarUpload').click();
    });

    $('#avatarUpload').on('change', function() {
        /*console.log('File selected');*/
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                /*console.log('File read complete');*/
                $('#profileAvatar').attr('src', e.target.result);
            };
            reader.readAsDataURL(this.files[0]);

            const form = $('#updateForm');
           /* console.log('Update form:', form.length ? 'found' : 'not found');*/
            form.attr('enctype', 'multipart/form-data');
            $('#field').val('avatar');
            $('#value').val('');
            form.submit();
        }
    });

    // Начальная загрузка данных
    /*console.log('Starting initial data load');*/
    fetch('login/profile.php')
        .then(response => {
            /*console.log('Initial profile response:', response.status);*/
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(user => {
           /* console.log('Initial user data received:', user);*/
            if (user.error === 'Unauthorized') {
                /*console.log('Initial check: unauthorized, redirecting');*/
                window.location.href = 'login.html';
                return;
            }
            updateUserInfo(user);
            updateModalInfo(user);
            updateCourseBlocksVisibility(user);
            document.body.style.visibility = 'visible';
        })
        .catch(error => {
            console.error('Error in initial load:', error);
            window.location.href = 'login/login.html';
        });
});