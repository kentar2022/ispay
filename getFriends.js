$(document).ready(function() {
    /*console.log('Инициализация загрузки друзей...');*/

    $('#addFriendForm').on('submit', function(e) {
        e.preventDefault();
        /*console.log('Форма отправлена');*/
        
        var friendId = $('#friendIdInput').val().trim();
        /*console.log('ID друга:', friendId);*/

        if (!friendId) {
            alert('Пожалуйста, введите ID друга');
            return;
        }

        // Проверка на числовое значение
        if (!/^\d+$/.test(friendId)) {
            alert('ID друга должен быть числом');
            return;
        }

        $.ajax({
            url: 'addFriend.php',
            type: 'POST',
            dataType: 'json',
            data: { friend_id: friendId },
            success: function(response) {
               /* console.log('Ответ сервера:', response);*/
                if (response.success) {
                    alert('Друг успешно добавлен!');
                    loadFriends(); // Перезагружаем список друзей
                    $('#addFriendModal').fadeOut(function() {
                        $(this).addClass('hidden');
                        $('#friendIdInput').val(''); // Очищаем поле ввода
                    });
                } else {
                    alert(response.message || 'Ошибка при добавлении друга');
                }
            },
            error: function(xhr, status, error) {
                console.error('Ошибка запроса:', {
                    status: status,
                    error: error,
                    response: xhr.responseText
                });
                alert('Ошибка при добавлении друга');
            }
        });
    });

    function loadFriends() {
        /*console.log('Загружаем список друзей...');*/
        
        $.ajax({
            url: 'getFriends.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
               /* console.log('Получен ответ:', response);*/

                if (response.error) {
                    console.error('Ошибка:', response.error);
                    $('#friendsList').html('<p>Ошибка загрузки списка друзей</p>');
                    return;
                }

                var friends = response;
                var $friendsList = $('#friendsList');
                $friendsList.empty();

                if (friends && friends.length > 0) {
                    /*console.log('Найдено друзей:', friends.length);*/
                    
                    friends.forEach(function(friend) {
                        /*console.log('Обработка друга:', friend);*/
                        var friendHtml = `
                            <div class="friend-item-container" data-friend-id="${friend.id}">
                                <img src="${friend.avatar}" alt="Avatar" class="friend-avatar" onerror="this.src='images/avatar.png'">
                                <span class="friend-name text">${friend.nickname}</span>
                                <button class="delete-friend-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="red">
                                        <path d="M19 13H5V11H19V13Z"/>
                                    </svg>
                                </button>
                                <span class="friend-id">id${friend.id}</span>
                            </div>
                        `;
                        $friendsList.append(friendHtml);
                    });

                    // Привязываем обработчики после добавления элементов
                    initializeDeleteButtons();
                } else {
                    /*console.log('Друзья не найдены');*/
                    $friendsList.append('<p>У вас пока нет друзей</p>');
                }
            },
            error: function(xhr, status, error) {
                console.error('Ошибка AJAX:', {
                    status: status,
                    error: error,
                    response: xhr.responseText
                });
                $('#friendsList').html('<p>Ошибка загрузки списка друзей</p>');
            }
        });
    }

    function initializeDeleteButtons() {
        $('.delete-friend-button').off('click').on('click', function() {
            var $friendItem = $(this).closest('.friend-item-container');
            var friendId = $friendItem.data('friend-id');
            /*console.log('Попытка удаления друга:', friendId);*/

            if (confirm('Вы уверены, что хотите удалить этого друга?')) {
                $.ajax({
                    url: 'deleteFriend.php',
                    type: 'POST',
                    dataType: 'json',
                    data: { friend_id: friendId },
                    success: function(response) {
                        /*console.log('Ответ на удаление:', response);*/
                        if (response.success) {
                            $friendItem.fadeOut(400, function() {
                                $(this).remove();
                                if ($('#friendsList').children().length === 0) {
                                    $('#friendsList').append('<p>У вас пока нет друзей</p>');
                                }
                            });
                        } else {
                            alert(response.message || 'Ошибка при удалении друга');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Ошибка при удалении:', {
                            status: status,
                            error: error,
                            response: xhr.responseText
                        });
                        alert('Ошибка при удалении друга');
                    }
                });
            }
        });
    }

    // Открытие модального окна
    $('#addFriendButton').on('click', function() {
        /*console.log('Открытие модального окна');*/
        $('#addFriendModal').removeClass('hidden').fadeIn();
        $('#friendIdInput').focus(); // Фокус на поле ввода
    });

    // Закрытие модального окна
    $('.close-button').on('click', function() {
        /*console.log('Закрытие модального окна');*/
        $('#addFriendModal').fadeOut(function() {
            $(this).addClass('hidden');
            $('#friendIdInput').val(''); // Очищаем поле при закрытии
        });
    });

    // Закрытие по клику вне модального окна
    $(window).on('click', function(event) {
        if ($(event.target).is('#addFriendModal')) {
            $('#addFriendModal').fadeOut(function() {
                $(this).addClass('hidden');
                $('#friendIdInput').val('');
            });
        }
    });


    // Загружаем друзей при загрузке страницы
    loadFriends();
});