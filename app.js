const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Функция для подключения к базе данных и получения данных из таблицы
function getGeorgianData(callback) {
    const db = new sqlite3.Database('your_database.db'); // Замените 'your_database.db' на имя вашей базы данных
    const query = 'SELECT * FROM georgian';

    db.all(query, [], (err, rows) => {
        if (err) {
            throw err;
        }
        callback(rows);
    });

    db.close();
}

// Маршрут для обработки AJAX-запроса на получение данных
app.get('/get_georgian_data', (req, res) => {
    getGeorgianData((data) => {
        // Преобразуем данные в HTML-формат и отправим их обратно клиенту
        const htmlData = data.map(row => `<p>${JSON.stringify(row)}</p>`).join('');
        res.send(htmlData);
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
