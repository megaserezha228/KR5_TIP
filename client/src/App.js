import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загружаем начальное значение счетчика
  useEffect(() => {
    fetchCounter();
    fetchHistory();
  }, []);

  const fetchCounter = async () => {
    try {
      const response = await fetch(`${API_URL}/counter`);
      const data = await response.json();
      setCount(data.value);
    } catch (error) {
      console.error('Ошибка загрузки счетчика:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/counter/history?limit=5`);
      const data = await response.json();
      setHistory(data.history);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  const updateCounter = async (action) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/counter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      const data = await response.json();
      setCount(data.value);
      setHistory(prev => [data.historyItem, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Ошибка обновления счетчика:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${API_URL}/counter/history`, {
        method: 'DELETE',
      });
      setHistory([]);
    } catch (error) {
      console.error('Ошибка очистки истории:', error);
    }
  };

  return (
    <div className="app">
      <div className="counter">
        <h1>Счётчик кликов с API</h1>
        <div className="count-display">{count}</div>
        
        <div className="buttons">
          <button 
            onClick={() => updateCounter('decrement')} 
            className="btn btn-decrement"
            disabled={loading}
          >
            -1
          </button>
          <button 
            onClick={() => updateCounter('reset')} 
            className="btn btn-reset"
            disabled={loading}
          >
            Сброс
          </button>
          <button 
            onClick={() => updateCounter('increment')} 
            className="btn btn-increment"
            disabled={loading}
          >
            +1
          </button>
        </div>

        {loading && <div className="loading">Загрузка...</div>}

        <div className="history-section">
          <div className="history-header">
            <h3>История изменений</h3>
            <button 
              onClick={clearHistory} 
              className="btn-clear"
            >
              Очистить
            </button>
          </div>
          
          {history.length > 0 ? (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <span className="history-action">{item.action}</span>
                  <span className="history-value">{item.value}</span>
                  <span className="history-time">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-history">История пуста</p>
          )}
        </div>

        <div className="api-info">
          <p>Это приложение использует Express API на бэкенде</p>
          <p>Текущее значение хранится на сервере в counter.json</p>
        </div>
      </div>
    </div>
  );
}

export default App;