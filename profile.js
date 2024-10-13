document.addEventListener('DOMContentLoaded', function() {
    // Находим кнопки для открытия модальных окон
    const openModalButtons = document.querySelectorAll('.btn-primary');
    const closeModalButtons = document.querySelectorAll('.close');
    const modals = document.querySelectorAll('.modal');

    // Открытие модального окна
    openModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalType = this.closest('.small-screen-profile-info') ? '.small-screen-modal' : '.large-screen-modal';
            const modal = document.querySelector(modalType);
            modal.style.display = 'block';
            getUserInfo(updateModalInfo);  // Загрузка данных пользователя в модальное окно
        });
    });

    // Закрытие модальных окон при нажатии на крестик
    closeModalButtons.forEach(closeButton => {
        closeButton.addEventListener('click', function() {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Обработка двойного клика для редактирования полей
    document.querySelectorAll('.editable').forEach(item => {
        item.addEventListener('dblclick', function() {
            const span = this.querySelector('span');
            const field = span.classList[0];
            const value = span.textContent;
            const form = this.closest('.modal-content').querySelector('.updateForm');
            const inputField = form.querySelector('.field');
            const inputValue = form.querySelector('.value');
            
            inputValue.value = value;
            inputField.value = field;
            form.style.display = 'block';
            inputValue.focus();
        });
    });




    // Функция для обновления видимости блоков курсов
    function updateCourseBlocksVisibility(user) {
        const userLanguages = user.languages; // Получаем список языков пользователя из ответа PHP

        // Получаем все элементы курсов
        const courseBlocks = document.querySelectorAll('.profile-course');

        // Перебираем все элементы курсов и скрываем те, которые не входят в список языков пользователя
        courseBlocks.forEach(courseBlock => {
            const courseLanguage = courseBlock.dataset.language; // Получаем значение из data-language
            if (userLanguages.includes(courseLanguage)) {
                courseBlock.style.display = 'block'; // Показываем блок
            } else {
                courseBlock.style.display = 'none'; // Скрываем блок
            }
        });
    }

    getUserInfo(updateCourseBlocksVisibility);


});


function updateUserInfo(user) {
    // Обновляем текстовые данные на странице для всех экранов
    document.querySelectorAll('.mainNickname').forEach(element => {
        element.textContent = user.nickname;
    });
    document.querySelectorAll('.mainEmail').forEach(element => {
        element.textContent = user.email;
    });
    document.querySelectorAll('.mainCountry').forEach(element => {
        element.textContent = user.country;
    });

    // Обновляем аватар для всех экранов
    document.querySelectorAll('img[id^="userAvatar"]').forEach(element => {
        if (user.avatar && user.avatar !== '') {
            element.src = user.avatar;
        } else {
            element.src = 'images/avatar.png';  // Путь к дефолтной аватарке
        }
    });
}




function updateModalInfo(user) {
    document.querySelectorAll('.nickname').forEach(element => {
        element.textContent = user.nickname;
    });
    document.querySelectorAll('.email').forEach(element => {
        element.textContent = user.email;
    });
    document.querySelectorAll('.country').forEach(element => {
        element.textContent = user.country;
    });

    document.querySelectorAll('.profile-avatar').forEach(avatar => {
        avatar.src = user.avatar || 'images/avatar.png';
    });
}


$(document).ready(function() {
    // При клике на аватарку открываем диалог для выбора файла
    $('#profileAvatar').on('click', function() {
        $('#avatarUpload').click();
    });

    // При выборе файла, сразу отправляем форму
    $('#avatarUpload').on('change', function() {
        if (this.files && this.files[0]) {
            // Предварительный просмотр выбранного изображения
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#profileAvatar').attr('src', e.target.result);
            };
            reader.readAsDataURL(this.files[0]);

            // Отправка формы для обновления аватарки
            $('#updateForm').attr('enctype', 'multipart/form-data');
            $('#field').val('avatar');
            $('#value').val(''); // В этом случае значение не нужно, так как отправляется файл
            $('#updateForm').submit();
        }
    });
});



// Функция для получения информации о пользователе
function getUserInfo(callback) {
    var xhr = new XMLHttpRequest();
    var userId = 1;  // Замените на актуальный userId
    xhr.open('GET', 'login/profile.php?userId=' + userId, true);
    xhr.onload = function() {
        if (xhr.status == 200) {
            var user = JSON.parse(xhr.responseText);
            callback(user);
        } else {
            console.error('Ошибка получения информации о пользователе: ' + xhr.statusText);
        }
    };
    xhr.onerror = function() {
        console.error('Ошибка отправки запроса');
    };
    xhr.send();
}



document.addEventListener('DOMContentLoaded', function() {
    // Проверка сессии при загрузке страницы
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'login/profile.php', true);
    xhr.onload = function() {
        if (xhr.status == 200) {
            var user = JSON.parse(xhr.responseText);
            updateUserInfo(user);
            updateModalInfo(user);
        } else {
            console.error('Сессия не активна');
            window.location.href = 'login/login.html';
        }
    };
    xhr.onerror = function() {
        console.error('Ошибка проверки сессии');
        window.location.href = 'login/login.html';
    };
    xhr.send();
});



