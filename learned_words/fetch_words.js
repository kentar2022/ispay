// Глобальные переменные
let currentData = [];
let currentSort = { column: null, direction: 'asc' };
let currentLanguage = '';
let currentUserId = null;
const charts = {
   progress: null,
   distribution: null,
   repetitions: null
};

// Добавляем новую функцию для получения user_id
async function getUserId() {
    try {
        const response = await fetch('../getUserId.php');
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data.user_id;
    } catch (error) {
        console.error('Error getting user ID:', error);
        throw error;
    }
}

// Функции для графиков
function createProgressChart(data) {
   if (charts.progress) {
       charts.progress.destroy();
   }
   charts.progress = new Chart('progressChart', {
       type: 'line',
       data: {
           labels: data.dates,
           datasets: [{
               label: 'Средний прогресс',
               data: data.values,
               borderColor: 'rgb(75, 192, 192)',
               tension: 0.1
           }]
       },
       options: {
           maintainAspectRatio: false,
           responsive: true
       }
   });
}

function createDistributionChart(data) {
   if (charts.distribution) {
       charts.distribution.destroy();
   }
   charts.distribution = new Chart('wordsDistribution', {
       type: 'pie',
       data: {
           labels: Object.keys(data),
           datasets: [{
               data: Object.values(data),
               backgroundColor: [
                   'rgb(255, 99, 132)',
                   'rgb(54, 162, 235)',
                   'rgb(255, 205, 86)',
                   'rgb(75, 192, 192)'
               ]
           }]
       },
       options: {
           maintainAspectRatio: false,
           responsive: true
       }
   });
}

function createRepetitionsChart(data) {
   if (charts.repetitions) {
       charts.repetitions.destroy();
   }
   charts.repetitions = new Chart('repetitionsChart', {
       type: 'bar',
       data: {
           labels: data.words,
           datasets: [{
               label: 'Количество повторений',
               data: data.counts,
               backgroundColor: 'rgb(54, 162, 235)'
           }]
       },
       options: {
           maintainAspectRatio: false,
           responsive: true,
           scales: {
               y: {
                   beginAtZero: true
               }
           }
       }
   });
}

// Функция загрузки языков
function loadLanguages() {
   fetch(`../get_user_languages.php?user_id=${currentUserId}`)
       .then(response => response.json())
       .then(data => {
           console.log('Languages data:', data);
           if (!data.languages || data.languages.length === 0) {
               throw new Error('No languages found');
           }

           const select = document.getElementById('dictionaryLanguage');
           data.languages.forEach(lang => {
               const option = document.createElement('option');
               option.value = lang;
               option.textContent = lang;
               select.appendChild(option);
           });

           currentLanguage = data.languages[0];
           loadLanguageData(currentLanguage);
           loadWords(currentLanguage);
       })
       .catch(error => console.error('Error loading languages:', error));
}

// Функция загрузки статистики
function loadLanguageData(language) {
   if (!language) return;
   
   console.log('Loading statistics for:', { language, currentUserId });
   
   fetch('get_statistics.php', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({ 
           user_id: currentUserId,
           language: language  
       })
   })
   .then(response => response.json())
   .then(data => {
       if(data.error) throw new Error(data.error);
       createProgressChart(data.progress);
       createDistributionChart(data.distribution);
       createRepetitionsChart(data.repetitions);
   })
   .catch(error => console.error('Error loading statistics:', error));
}

// Функция загрузки слов
function loadWords(language) {
   if (!language || !currentUserId) return;

   console.log(`Loading words for user ${currentUserId} and language ${language}`);

   fetch(`fetch_words.php?language=${language}&user_id=${currentUserId}`)
       .then(response => {
           if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
           return response.json();
       })
       .then(data => {
           currentData = data;
           renderTable(data);
           updateStats(data);
       })
       .catch(error => {
           console.error('Error loading words:', error);
           document.getElementById('word-table').innerHTML = `
               <tr><td colspan="5" class="error-message">
                   Ошибка загрузки данных: ${error.message}
               </td></tr>`;
       });
}

// Вспомогательные функции
function changeLanguage(language) {
   currentLanguage = language;
   loadLanguageData(language);
   loadWords(language);
}

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

function renderTable(data) {
   const wordTable = document.getElementById('word-table');
   wordTable.innerHTML = '';
   
   data.forEach(word => {
       const row = document.createElement('tr');
       const progress = parseFloat(word.progress);
       const color = `hsl(${progress * 120}, 70%, 50%)`;
       
       row.innerHTML = `
           <td>${word.word_russian}</td>
           <td>${word.word_foreign}</td>
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

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Получаем user_id с сервера вместо URL
        currentUserId = await getUserId();
        
        if (!currentUserId) {
            console.error('Failed to get user ID');
            return;
        }

        // Инициализация сортировки
        document.querySelectorAll('th.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                currentSort.direction = currentSort.column === column && 
                                     currentSort.direction === 'asc' ? 'desc' : 'asc';
                currentSort.column = column;
                renderTable(sortData(currentData, column, currentSort.direction));
            });
        });

        loadLanguages();
    } catch (error) {
        console.error('Initialization error:', error);
        // Можно добавить отображение ошибки для пользователя
        document.querySelector('.container').innerHTML = `
            <div class="error-message">
                Ошибка инициализации: ${error.message}. 
                Пожалуйста, убедитесь что вы авторизованы.
            </div>`;
    }
});

// Делаем функции доступными глобально
window.changeLanguage = changeLanguage;
window.loadWords = loadWords;