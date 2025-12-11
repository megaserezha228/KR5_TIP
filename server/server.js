const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздача статики
app.use(express.static('public'));

// Кастомный middleware для логирования
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// Функции для работы с данными
const DATA_FILE = path.join(__dirname, 'counter.json');

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Если файла нет, создаем начальные данные
    const initialData = { value: 0, history: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Маршруты
app.get('/api/counter', (req, res) => {
  try {
    const data = readData();
    res.json({ value: data.value });
  } catch (error) {
    console.error('Ошибка чтения данных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/counter', (req, res) => {
  try {
    const { action } = req.body;
    const data = readData();
    
    if (!action) {
      return res.status(400).json({ error: 'Не указано действие' });
    }
    
    let newValue = data.value;
    let actionText = '';
    
    switch(action) {
      case 'increment':
        newValue += 1;
        actionText = 'Увеличение';
        break;
      case 'decrement':
        newValue -= 1;
        actionText = 'Уменьшение';
        break;
      case 'reset':
        newValue = 0;
        actionText = 'Сброс';
        break;
      default:
        return res.status(400).json({ error: 'Неизвестное действие' });
    }
    
    // Обновляем данные
    data.value = newValue;
    
    // Добавляем в историю
    const historyItem = {
      id: Date.now(),
      action: actionText,
      value: newValue,
      timestamp: new Date().toISOString()
    };
    data.history.unshift(historyItem);
    
    // Сохраняем
    writeData(data);
    
    res.json({
      value: newValue,
      message: `${actionText} выполнено`,
      historyItem
    });
    
  } catch (error) {
    console.error('Ошибка обновления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/counter/history', (req, res) => {
  try {
    const data = readData();
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    res.json({ history: data.history.slice(0, limit) });
  } catch (error) {
    console.error('Ошибка чтения истории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(` Сервер запущен на http://localhost:${PORT}`);
  console.log(` API доступно по http://localhost:${PORT}/api/counter`);
});