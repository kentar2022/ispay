class FriendsManager {
    constructor() {
        this.currentTab = 'all';
        this.currentPage = 1;
        this.friendsPerPage = 12;
        this.friends = [];
        this.filteredFriends = [];
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadFriends();
    }

    initializeElements() {
        this.searchInput = document.querySelector('.search-input');
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.friendsGrid = document.querySelector('.friends-grid');
        this.paginationButtons = document.querySelectorAll('.pagination-button');
        this.paginationNumbers = document.querySelector('.pagination-numbers');
    }

    initializeEventListeners() {
        // Поиск друзей
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Переключение вкладок
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.handleTabChange(button.dataset.tab));
        });

        // Пагинация
        this.paginationButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('prev')) {
                    this.handlePagination('prev');
                } else {
                    this.handlePagination('next');
                }
            });
        });

        this.paginationNumbers.addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN') {
                this.handlePagination(parseInt(e.target.textContent));
            }
        });
    }

    async loadFriends() {
        try {
            // Здесь будет запрос к API для получения списка друзей
            // Временные данные для демонстрации
            this.friends = [
                { id: 1, name: 'Иван Петров', status: 'online', avatar: 'default-avatar.png' },
                { id: 2, name: 'Мария Сидорова', status: 'offline', avatar: 'default-avatar.png' },
                // Добавьте больше друзей по необходимости
            ];

            this.filteredFriends = [...this.friends];
            this.renderFriends();
        } catch (error) {
            console.error('Ошибка при загрузке друзей:', error);
        }
    }

    handleSearch(query) {
        this.filteredFriends = this.friends.filter(friend => 
            friend.name.toLowerCase().includes(query.toLowerCase())
        );
        this.currentPage = 1;
        this.renderFriends();
    }

    handleTabChange(tab) {
        this.currentTab = tab;
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });

        this.filteredFriends = this.friends.filter(friend => {
            if (tab === 'all') return true;
            if (tab === 'online') return friend.status === 'online';
            if (tab === 'offline') return friend.status === 'offline';
            return true;
        });

        this.currentPage = 1;
        this.renderFriends();
    }

    handlePagination(action) {
        const totalPages = Math.ceil(this.filteredFriends.length / this.friendsPerPage);

        if (action === 'prev' && this.currentPage > 1) {
            this.currentPage--;
        } else if (action === 'next' && this.currentPage < totalPages) {
            this.currentPage++;
        } else if (typeof action === 'number' && action >= 1 && action <= totalPages) {
            this.currentPage = action;
        }

        this.renderFriends();
        this.updatePagination(totalPages);
    }

    updatePagination(totalPages) {
        const numbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                numbers.push(i);
            }
        } else {
            if (this.currentPage <= 3) {
                numbers.push(1, 2, 3, '...', totalPages);
            } else if (this.currentPage >= totalPages - 2) {
                numbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                numbers.push(1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', totalPages);
            }
        }

        this.paginationNumbers.innerHTML = numbers
            .map(num => `<span class="${num === this.currentPage ? 'active' : ''}">${num}</span>`)
            .join('');
    }

    renderFriends() {
        const startIndex = (this.currentPage - 1) * this.friendsPerPage;
        const endIndex = startIndex + this.friendsPerPage;
        const friendsToShow = this.filteredFriends.slice(startIndex, endIndex);

        this.friendsGrid.innerHTML = friendsToShow.map(friend => `
            <div class="friend-card">
                <div class="friend-avatar">
                    <img src="${friend.avatar}" alt="${friend.name}">
                    <span class="status-indicator ${friend.status}"></span>
                </div>
                <div class="friend-info">
                    <h3 class="friend-name">${friend.name}</h3>
                    <p class="friend-status">${friend.status === 'online' ? 'В сети' : 'Не в сети'}</p>
                </div>
                <div class="friend-actions">
                    <button class="action-button message" data-friend-id="${friend.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="action-button more" data-friend-id="${friend.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        // Добавляем обработчики для кнопок действий
        this.friendsGrid.querySelectorAll('.action-button').forEach(button => {
            button.addEventListener('click', (e) => this.handleAction(e));
        });
    }

    handleAction(event) {
        const button = event.currentTarget;
        const friendId = button.dataset.friendId;
        const action = button.classList.contains('message') ? 'message' : 'more';

        if (action === 'message') {
            // Здесь будет логика открытия чата
            console.log('Открыть чат с другом:', friendId);
        } else {
            // Здесь будет логика открытия меню действий
            console.log('Открыть меню действий для друга:', friendId);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new FriendsManager();
}); 