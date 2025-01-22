$(document).ready(function() {
    // Обработка отправки заявки в друзья
    $('#addFriendForm').on('submit', function(e) {
        e.preventDefault();
        
        var friendId = $('#friendIdInput').val().trim();

        if (!friendId) {
            alert('Пожалуйста, введите ID друга');
            return;
        }

        if (!/^\d+$/.test(friendId)) {
            alert('ID друга должен быть числом');
            return;
        }

        $.ajax({
            url: 'sendFriendRequest.php', // Меняем URL с addFriend.php на sendFriendRequest.php
            type: 'POST',
            dataType: 'json',
            data: { friend_id: friendId },
            success: function(response) {
                if (response.success) {
                    alert('Заявка в друзья отправлена!');
                    $('#addFriendModal').fadeOut(function() {
                        $(this).addClass('hidden');
                        $('#friendIdInput').val('');
                    });
                } else {
                    alert(response.message || 'Ошибка при отправке заявки');
                }
            },
            error: function(xhr, status, error) {
                console.error('Ошибка запроса:', {
                    status: status,
                    error: error,
                    response: xhr.responseText
                });
                alert('Ошибка при отправке заявки');
            }
        });
    });

    $('#addFriendButton').on('click', function() {
        $('#addFriendModal').removeClass('hidden').fadeIn();
        $('#friendIdInput').focus();
    });    


    // Загрузка входящих заявок в друзья
    function loadFriendRequests() {
        console.log('Загрузка заявок в друзья...');
        $.ajax({
            url: 'getFriendRequests.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                console.log('Ответ от сервера:', response);
                if (response.success) {
                    var $requestsList = $('#friendRequestsList');
                    $requestsList.empty();

                    if (response.requests && response.requests.length > 0) {
                        response.requests.forEach(function(request) {
                            var requestHtml = `
                                <div class="friend-request-item" data-request-id="${request.id}">
                                    <div class="friend-info">
                                        <img src="${request.sender_avatar}" alt="Avatar" class="friend-avatar" onerror="this.src='images/avatar.png'">
                                        <span class="friend-name">${request.sender_nickname}</span>
                                        <span class="friend-id">id${request.sender_id}</span>
                                    </div>
                                    <div class="request-actions">
                                        <button class="accept-request-btn" data-user-id="${request.sender_id}">Принять</button>
                                        <button class="reject-request-btn" data-user-id="${request.sender_id}">Отклонить</button>
                                    </div>
                                </div>
                            `;
                            $requestsList.append(requestHtml);
                        });
                        
                        initializeRequestButtons();
                    } else {
                        $requestsList.html('<p>Нет входящих заявок в друзья</p>');
                    }
                }
            },
        error: function(xhr, status, error) {
            console.error('Ошибка при загрузке заявок:', {
                status: status,
                error: error,
                response: xhr.responseText
            });
            $('#friendRequestsList').html('<p>Ошибка при загрузке заявок</p>');
        }
        });
    }

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

    // Инициализация кнопок принятия/отклонения заявок
    function initializeRequestButtons() {
        $('.accept-request-btn').off('click').on('click', function() {
            var userId = $(this).data('user-id');
            var $requestItem = $(this).closest('.friend-request-item');
            
            $.ajax({
                url: 'respondToFriendRequest.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    user_id: userId,
                    action: 'accept'
                },
                success: function(response) {
                    if (response.success) {
                        $requestItem.fadeOut(400, function() {
                            $(this).remove();
                            loadFriends(); // Обновляем список друзей
                            if ($('#friendRequestsList').children().length === 0) {
                                $('#friendRequestsList').html('<p>Нет входящих заявок в друзья</p>');
                            }
                        });
                    } else {
                        alert(response.message || 'Ошибка при принятии заявки');
                    }
                },
                error: function() {
                    alert('Ошибка при обработке заявки');
                }
            });
        });

        $('.reject-request-btn').off('click').on('click', function() {
            var userId = $(this).data('user-id');
            var $requestItem = $(this).closest('.friend-request-item');
            
            $.ajax({
                url: 'respondToFriendRequest.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    user_id: userId,
                    action: 'reject'
                },
                success: function(response) {
                    if (response.success) {
                        $requestItem.fadeOut(400, function() {
                            $(this).remove();
                            if ($('#friendRequestsList').children().length === 0) {
                                $('#friendRequestsList').html('<p>Нет входящих заявок в друзья</p>');
                            }
                        });
                    } else {
                        alert(response.message || 'Ошибка при отклонении заявки');
                    }
                },
                error: function() {
                    alert('Ошибка при обработке заявки');
                }
            });
        });
    }

    function initializeDeleteButtons() {
        $('.delete-friend-button').off('click').on('click', function() {
            var $friendItem = $(this).closest('.friend-item-container');
            var friendId = $friendItem.data('friend-id');

            if (confirm('Вы уверены, что хотите удалить этого друга?')) {
                $.ajax({
                    url: 'deleteFriend.php',
                    type: 'POST',
                    dataType: 'json',
                    data: { friend_id: friendId },
                    success: function(response) {
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

    // Загружаем друзей и заявки при загрузке страницы
    loadFriends();
    loadFriendRequests();
});

