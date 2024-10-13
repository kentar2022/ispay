$(document).ready(function() {
    console.log('Документ загружен, начинаем процесс получения userId.');

    // Получение userId с помощью AJAX
    $.ajax({
        url: 'getUserId.php', // Запрос на получение user_id
        type: 'GET',
        dataType: 'json',
        success: function(userData) {
            console.log('Ответ от getUserId.php получен:', userData);

            if (userData.error) {
                console.error('Ошибка получения userId: ' + userData.error);
                return;
            }

            var userId = userData.user_id;
            console.log('Полученный userId:', userId);

            // Функция для проверки состояния подарков при загрузке страницы
            function checkGiftStatus() {
                $.ajax({
                    url: 'gifts.php', // Объединённый скрипт PHP
                    type: 'GET',
                    data: { action: 'getStatus', user_id: userId },
                    dataType: 'json',
                    success: function(response) {
                        if (response.success) {
                            response.gifts.forEach(function(gift, index) {
                                // Для больших экранов
                                var $giftItem = $('.gift-item').eq(index);
                                if (gift.collected) {
                                    $giftItem.addClass('collected');
                                } else if (!gift.available) {
                                    $giftItem.addClass('blocked').off('click');
                                }

                                // Для маленьких экранов
                                var $smallGiftItem = $('.small-screen-gift-item').eq(index);
                                if (gift.collected) {
                                    $smallGiftItem.addClass('collected');
                                } else if (!gift.available) {
                                    $smallGiftItem.addClass('blocked').off('click');
                                }
                            });
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Ошибка при проверке состояния подарков:', error);
                    }
                });
            }

            // Проверяем состояние подарков при загрузке страницы
            checkGiftStatus();

            // Обработчик клика на блок подарка (большой экран)
            $('.gift-item').on('click', function() {
                var $this = $(this);
                var giftDay = $this.data('gift-day'); // Получаем день подарка

                if (!$this.hasClass('blocked') && !$this.hasClass('collected')) {
                    console.log('Пытаемся собрать подарок за день:', giftDay);
                    collectGift($this, giftDay); // Передаем giftDay для обновления
                } else {
                    console.log('Этот подарок пока нельзя открыть.');
                }
            });

            // Обработчик клика на блок подарка (маленький экран)
            $('.small-screen-gift-item').on('click', function() {
                var $this = $(this);
                var giftDay = $('.small-screen-gift-item').index($this) + 1; // Получаем день подарка

                if (!$this.hasClass('blocked') && !$this.hasClass('collected')) {
                    console.log('Пытаемся собрать подарок за день:', giftDay);
                    collectGift($this, giftDay); // Передаем giftDay для обновления
                } else {
                    console.log('Этот подарок пока нельзя открыть.');
                }
            });

            // Функция для получения подарка
            function collectGift($giftItem, giftDay) {
                var currencyType = Math.random() > 0.5 ? 'coins' : 'freeze';
                var rewardAmount = currencyType === 'coins' ? getRandomInt(50, 150) : getRandomInt(5, 15);

                console.log('Подарок: ' + rewardAmount + ' ' + currencyType + ' за день: ' + giftDay);

                updateUserResources(userId, currencyType, rewardAmount, $giftItem, giftDay);
            }

            // Функция для генерации случайного числа
            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            // Функция для обновления ресурсов пользователя
            function updateUserResources(userId, itemType, amount, $giftItem, giftDay) {
                var resourceType = (itemType === 'coins') ? 'gold' : 'crystals';

                console.log('Отправка данных на сервер для пользователя с userId:', userId);
                console.log('День подарка: ', giftDay);
                console.log('Тип ресурса: ', resourceType);
                console.log('Количество: ', amount);

                // Отправляем запрос на сервер для обновления ресурсов и получения подарка
                $.ajax({
                    url: 'gifts.php',
                    type: 'POST',
                    data: {
                        action: 'collectGift',
                        user_id: userId,
                        item_type: resourceType,
                        amount: amount,
                        gift_day: giftDay // Обязательно передаем корректный день
                    },
                    dataType: 'json',
                    success: function(response) {
                        console.log('Ответ сервера:', response);
                        if (response.success) {
                            console.log('Ресурсы успешно обновлены.');
                            showCenterAnimation(itemType, amount);
                            $giftItem.addClass('collected');
                        } else {
                            if (response.message === 'Меньше 24 часов с момента последнего подарка.') {
                                var timeRemaining = response.time_remaining;
                                console.log(
                                    'Подарок заблокирован. Оставшееся время: ' +
                                    timeRemaining.hours + ' часов, ' +
                                    timeRemaining.minutes + ' минут, ' +
                                    timeRemaining.seconds + ' секунд.'
                                );
                                $giftItem.addClass('blocked').off('click');
                            } else {
                                console.log('Ошибка: ' + response.message);
                            }
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log('Ошибка при обновлении ресурсов:', error);
                    }
                });
            }

            // Функция для отображения анимации в центре страницы
            function showCenterAnimation(itemType, itemAmount) {
                var $centerAnimation = $('#center-animation');
                var iconSrc = (itemType === 'coins') ? 'images/coins.png' : 'images/freeze.png'; // Определяем иконку ресурса

                // Очищаем содержимое блока и обновляем содержимое
                $centerAnimation.html(`
                    <div style="text-align: center;">
                        <img src="${iconSrc}" alt="${itemType}" style="width: 100px; height: 100px;">
                        <p style="font-size: 30px; margin-top: 10px;">${itemAmount}</p>
                    </div>
                `);

                // Отображаем блок анимации
                $centerAnimation.addClass('flex').fadeIn(500);

                // Скрываем анимацию через 3 секунды
                setTimeout(function() {
                    $centerAnimation.fadeOut(500, function() {
                        $centerAnimation.removeClass('flex');
                    });
                }, 3000);
            }
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при получении userId из getUserId.php:', error);
            console.log('Статус:', status);
            console.log('Ответ сервера:', xhr.responseText);
        }
    });
});
