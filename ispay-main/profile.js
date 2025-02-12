document.addEventListener('DOMContentLoaded', function() {
    // Элементы модального окна и кнопки
    var modal = document.getElementById("profileModal");
    var btn = document.getElementById("editProfileBtn");
    var span = document.getElementsByClassName("close")[0];

    // Открытие модального окна и загрузка информации о пользователе
    btn.onclick = function() {
        modal.style.display = "block";
        getUserInfo(updateModalInfo);
    }

    // Закрытие модального окна при нажатии на крестик
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Закрытие модального окна при клике вне его
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Проверка сессии при загрузке страницы
    checkSession();

    // Обработка двойного клика для редактирования полей
    document.querySelectorAll('.editable').forEach(item => {
        item.addEventListener('dblclick', function() {
            const span = this.querySelector('span');
            const field = span.id;
            const value = span.textContent;
            const input = document.getElementById('value');
            input.value = value;
            document.getElementById('field').value = field;
            document.getElementById('updateForm').style.display = 'block';
            input.focus();
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
    // Обновляем текстовые данные на основной странице
    document.querySelector('.mainNickname').textContent = user.nickname;
    document.querySelector('.mainEmail').textContent = user.email;
    document.querySelector('.mainCountry').textContent = user.country;

    // Сохраняем данные в localStorage
    localStorage.setItem('nickname', user.nickname);
    localStorage.setItem('email', user.email);
    localStorage.setItem('country', user.country);

    // Обновляем путь к аватарке на основной странице
    var userAvatar = document.querySelector('#userAvatar');
    if (user.avatar && user.avatar !== '') {
        userAvatar.src = user.avatar;
    } else {
        userAvatar.src = 'images/avatar.png';  // Путь к дефолтной аватарке
    }
}


function updateModalInfo(user) {
    // Обновляем текстовые данные в модальном окне
    document.querySelector('.nickname').textContent = user.nickname;
    document.querySelector('.email').textContent = user.email;
    document.querySelector('.country').textContent = user.country;

    // Обновляем путь к аватарке в модальном окне
    var profileAvatar = document.querySelector('#profileAvatar');
    if (user.avatar && user.avatar !== '') {
        profileAvatar.src = user.avatar;
    } else {
        profileAvatar.src = 'images/avatar.png';  // Путь к дефолтной аватарке
    }
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
    var userId = 1; // Замените на актуальный userId
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



