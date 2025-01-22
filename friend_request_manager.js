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
            url: 'sendFriendRequest.php',
            type: 'POST',
            dataType: 'json',
            data: { friend_id: friendId },
            success: function(response) {
                if (response.success) {
                    alert('Заявка в друзья отправлена!');
                    loadFriendRequests(); // Загружаем обновленный список заявок
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

    // Загрузка входящих заявок в друзья
    function loadFriendRequests() {
        $.ajax({
            url: 'getFriendRequests.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                var $requestsList = $('#friendRequestsList');
                $requestsList.empty();

                if (response.requests && response.requests.length > 0) {
                    response.requests.forEach(function(request) {
                        var requestHtml = `
                            <div class="friend-request-item" data-request-id="${request.id}">
                                <img src="${request.sender_avatar}" alt="Avatar" class="friend-avatar" onerror="this.src='images/avatar.png'">
                                <span class="friend-name">${request.sender_nickname}</span>
                                <div class="request-actions">
                                    <button class="accept-request-btn" data-user-id="${request.sender_id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="green">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                        </svg>
                                    </button>
                                    <button class="reject-request-btn" data-user-id="${request.sender_id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="red">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        `;
                        $requestsList.append(requestHtml);
                    });

                    initializeRequestButtons();
                } else {
                    $requestsList.append('<p>Нет новых заявок в друзья</p>');
                }
            },
            error: function(xhr, status, error) {
                console.error('Ошибка при загрузке заявок:', error);
                $('#friendRequestsList').html('<p>Ошибка загрузки заявок</p>');
            }
        });
    }

    // Инициализация кнопок принятия/отклонения заявок
    function initializeRequestButtons() {
        $('.accept-request-btn').on('click', function() {
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
                        $requestItem.fadeOut(function() {
                            $(this).remove();
                            loadFriends(); // Обновляем список друзей
                            if ($('#friendRequestsList').children().length === 0) {
                                $('#friendRequestsList').append('<p>Нет новых заявок в друзья</p>');
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

        $('.reject-request-btn').on('click', function() {
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
                        $requestItem.fadeOut(function() {
                            $(this).remove();
                            if ($('#friendRequestsList').children().length === 0) {
                                $('#friendRequestsList').append('<p>Нет новых заявок в друзья</p>');
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

    // Загружаем друзей и заявки при загрузке страницы
    loadFriends();
    loadFriendRequests();
});