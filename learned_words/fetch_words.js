document.addEventListener('DOMContentLoaded', () => {
    const wordTable = document.getElementById('word-table');
    let currentData = [];
    let currentSort = { column: null, direction: 'asc' };

    // Обработчики сортировки
    document.querySelectorAll('th.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            currentSort.direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
            currentSort.column = column;
            renderTable(sortData(currentData, column, currentSort.direction));
        });
    });

    // Функция сортировки
    function sortData(data, column, direction) {
        return [...data].sort((a, b) => {
            let compareA = a[column];
            let compareB = b[column];
            
            if (column === 'progress' || column === 'repetition_count') {
                compareA = parseFloat(compareA);
                compareB = parseFloat(compareB);
            }
            
            if (direction === 'asc') {
                return compareA > compareB ? 1 : -1;
            }
            return compareA < compareB ? 1 : -1;
        });
    }

    // Обновление статистики
    function updateStats(data) {
        const totalWords = data.length;
        const avgProgress = data.reduce((acc, word) => acc + parseFloat(word.progress), 0) / totalWords;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyLearned = data.filter(word => new Date(word.date_learned) > weekAgo).length;

        document.getElementById('total-words').textContent = totalWords;
        document.getElementById('avg-progress').textContent = `${(avgProgress * 100).toFixed(1)}%`;
        document.getElementById('weekly-learned').textContent = weeklyLearned;
    }

    // Отрисовка таблицы
    function renderTable(data) {
        wordTable.innerHTML = '';
        data.forEach(word => {
            const row = document.createElement('tr');
            const progress = parseFloat(word.progress);
            const color = `hsl(${progress * 120}, 70%, 50%)`;
            
            row.innerHTML = `
                <td>${word.word_russian}</td>
                <td>${word.word_chechen}</td>
                <td>${word.date_learned}</td>
                <td>${word.repetition_count}</td>
                <td class="progress-cell">
                    <div class="progress-bar" style="width: ${progress * 100}%; background-color: ${color}"></div>
                    <span class="progress-text">${(progress * 100).toFixed(1)}%</span>
                </td>
            `;
            wordTable.appendChild(row);
        });
    }

    // Загрузка данных
    function loadWords() {
        fetch('fetch_words.php')
            .then(response => response.json())
            .then(data => {
                currentData = data;
                updateStats(data);
                renderTable(data);
            })
            .catch(error => {
                console.error('Ошибка:', error);
                wordTable.innerHTML = '<tr><td colspan="5">Ошибка загрузки данных</td></tr>';
            });
    }

    loadWords();
});