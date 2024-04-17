const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
const databaseFilePath = 'sessions.json'; // Локальна JSON-файлова база даних

let sessions = []; // Змінна для зберігання сеансів

// Зчитування даних з файлу при запуску сервера
try {
    const data = fs.readFileSync(databaseFilePath, 'utf8') || '[]';
    sessions = JSON.parse(data);
} catch (error) {
    console.error('Помилка при читанні бази даних:', error);
}

// Глобальний індекс, що інкрементується кожен раз, коли створюється сеанс.
// При запуску йде перевірка всіх елементів масиву sessions для знаходження найбільшого значення id.
let index = sessions.reduce((maxId, session) => Math.max(maxId, session.id), 0);

// Middleware для обробки JSON
app.use(express.json());

app.listen(port, () => {
    console.log(`Сервер запущено на порті ${port}`);
});

// Функція для збереження даних у JSON-файл
function writeDatabase(data) {
    try {
        fs.writeFileSync(databaseFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Помилка при записі в базу даних:', error);
    }
}

app.post('/sessions', (req, res) => {
    try {
        const { movie, time, price } = req.body;

        // Перевірка наявності обов'язкових полів у тілі запиту
        if (!movie || !time || !price) {
            return res.status(400).json({ error: 'Будь ласка, надішліть повну інформацію про сеанс (назва фільму, час, ціна).' });
        }

        const newSession = { id: ++index, movie, time, price };
        sessions.push(newSession);
        writeDatabase(sessions); // Зберігання даних у файл
        res.status(201).json(newSession);
    } catch (error) {
        console.error('Помилка при обробці POST-запиту /sessions:', error);
        res.status(500).json({ error: 'Помилка сервера. Будь ласка, спробуйте знову.' });
    }
});

app.get('/sessions/:sessionId', (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        const session = sessions.find(session => session.id === sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Сеанс не знайдено' });
        }

        res.json(session);
    } catch (error) {
        console.error('Помилка при обробці GET-запиту /sessions/:sessionId:', error);
        res.status(500).json({ error: 'Помилка сервера. Будь ласка, спробуйте знову.' });
    }
});

app.get('/sessions', (req, res) => {
    try {
        res.json(sessions);

    } catch (error) {
        console.error('Помилка при обробці GET-запиту /sessions:', error);
        res.status(500).json({ error: 'Помилка сервера. Будь ласка, спробуйте знову.' });
    }
});

app.put('/sessions/:sessionId', (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        const sessionIndex = sessions.findIndex(session => session.id === sessionId);

        if (sessionIndex === -1) {
            return res.status(404).json({ error: 'Сеанс не знайдено' });
        }

        const { movie, time, price } = req.body;
        sessions[sessionIndex] = { ...sessions[sessionIndex], movie, time, price };
        
        writeDatabase(sessions); // Зберігання даних у файл
        res.json(sessions[sessionIndex]);
    } catch (error) {
        console.error('Помилка при обробці GET-запиту /sessions:', error);
        res.status(500).json({ error: 'Помилка сервера. Будь ласка, спробуйте знову.' });
    }
});

app.delete('/sessions/:sessionId', (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        const sessionIndex = sessions.findIndex(session => session.id === sessionId);

        if (sessionIndex === -1) {
            return res.status(404).json({ error: 'Сеанс не знайдено' });
        }

        sessions.splice(sessionIndex, 1);

        writeDatabase(sessions); // Зберігання даних у файл
        res.status(204).end();
    } catch (error) {
        console.error('Помилка при обробці GET-запиту /sessions:', error);
        res.status(500).json({ error: 'Помилка сервера. Будь ласка, спробуйте знову.' });
    }
});
