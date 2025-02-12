$(document).ready(function() {
    console.log('Загружаем список друзей...');

    // Загрузка списка друзей
    $.ajax({
        url: 'getFriends.php',
        type: 'GET',
        dataType: 'json',
        success: function(friends) {
            console.log('Список друзей получен:', friends);

            var $friendsList = $('#friendsList');
            $friendsList.empty(); // Очищаем список перед добавлением новых друзей

            if (friends.length > 0) {
                friends.forEach(function(friend) {
                $friendsList.append(
                    '<div class="friend-item-container" data-friend-id="' + friend.id + '">' +
                    '<img src="' + friend.avatar + '" alt="Avatar" class="friend-avatar">' +
                    '<span class="friend-name text">' + friend.nickname + '</span>' +
                    '<button class="delete-friend-button">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="red">' +
                    '<path d="M19 13H5V11H19V13Z"/>' +
                    '</svg>' +
                    '</button>' +
                    '<span class="friend-id">id' + friend.id + '</span>' +
                    '</div>'
                );
                });
            } else {
                $friendsList.append('<p>У вас пока нет друзей</p>');
            }

            // Привязка обработчика удаления после загрузки списка друзей
            $('.delete-friend-button').on('click', function() {
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
                                // Удаляем элемент из списка
                                $friendItem.remove();
                                alert('Друг успешно удалён.');
                            } else {
                                alert('Ошибка: ' + response.message);
                            }
                        },
                        error: function(xhr, status, error) {
                            console.error('Ошибка при удалении друга:', error);
                            console.log('Статус:', status);
                            console.log('Ответ сервера:', xhr.responseText);
                        }
                    });
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при загрузке списка друзей:', error);
            console.log('Статус:', status);
            console.log('Ответ сервера:', xhr.responseText);
        }
    });

    // Открытие модального окна
    $('#addFriendButton').on('click', function() {
        $('#addFriendModal').removeClass('hidden').fadeIn();
    });

    // Закрытие модального окна
    $('.close-button').on('click', function() {
        $('#addFriendModal').fadeOut(function() {
            $(this).addClass('hidden');
        });
    });

    // Подтверждение добавления друга
    $('#confirmAddFriendButton').on('click', function() {
        var friendId = $('#friendIdInput').val().trim();

        if (friendId) {
            console.log('Попытка добавить друга с ID:', friendId);

            $.ajax({
                url: 'addFriend.php',
                type: 'POST',
                dataType: 'json',
                data: { friend_id: friendId },
                success: function(response) {
                    console.log('Ответ от сервера:', response);

                    if (response.success) {
                        alert('Друг успешно добавлен!');
                        location.reload(); // Перезагружаем страницу, чтобы обновить список друзей
                    } else {
                        alert('Ошибка: ' + response.message);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Ошибка при добавлении друга:', error);
                    console.log('Статус:', status);
                    console.log('Ответ сервера:', xhr.responseText);
                }
            });
        } else {
            alert('Пожалуйста, введите ID друга.');
        }
    });
});
