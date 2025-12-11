const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/counter.json');

// Чтение данных из файла
const readData = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Если файла нет, создаем начальные данные
    const initialData = {
      value: 0,
      history: []
    };
    writeData(initialData);
    return initialData;
  }
};

// Запись данных в файл
const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
};

// Добавление записи в историю
const addToHistory = (action, value) => {
  const data = readData();
  const historyItem = {
    id: Date.now(),
    action,
    value,
    timestamp: new Date().toISOString()
  };
  data.history.unshift(historyItem);
  // Ограничиваем историю 50 записями
  if (data.history.length > 50) {
    data.history = data.history.slice(0, 50);
  }
  writeData(data);
  return historyItem;
};

// Контроллеры
exports.getCounter = (req, res) => {
  const data = readData();
  res.json({ value: data.value });
};

exports.updateCounter = (req, res) => {
  const { action } = req.body;
  const data = readData();
  
  let newValue = data.value;
  let actionName = '';
  
  switch (action) {
    case 'increment':
      newValue += 1;
      actionName = 'Увеличение';
      break;
    case 'decrement':
      newValue -= 1;
      actionName = 'Уменьшение';
      break;
    case 'reset':
      newValue = 0;
      actionName = 'Сброс';
      break;
    default:
      return res.status(400).json({ error: 'Неизвестное действие' });
  }
  
  data.value = newValue;
  writeData(data);
  const historyItem = addToHistory(actionName, newValue);
  
  res.json({ 
    value: newValue,
    historyItem,
    message: `Счетчик ${actionName} до ${newValue}`
  });
};

exports.getHistory = (req, res) => {
  const data = readData();
  const { limit } = req.query; // Пример использования query-параметров
  
  let history = data.history;
  if (limit && !isNaN(limit)) {
    history = history.slice(0, parseInt(limit));
  }
  
  res.json({ history });
};

exports.getCounterById = (req, res) => {
  const { id } = req.params; // Пример использования params
  const data = readData();
  
  const item = data.history.find(item => item.id === parseInt(id));
  if (!item) {
    return res.status(404).json({ error: 'Запись не найдена' });
  }
  
  res.json(item);
};

exports.clearHistory = (req, res) => {
  const data = readData();
  data.history = [];
  writeData(data);
  
  res.json({ message: 'История очищена' });
};