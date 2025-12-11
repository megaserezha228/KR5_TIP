const express = require('express');
const router = express.Router();
const counterController = require('../controllers/counterController');

// GET /api/counter - получить текущее значение
router.get('/', counterController.getCounter);

// POST /api/counter - изменить значение (увеличить/уменьшить/сбросить)
router.post('/', counterController.updateCounter);

// GET /api/counter/history - получить историю изменений
router.get('/history', counterController.getHistory);

// GET /api/counter/:id - получить конкретное значение по ID
router.get('/:id', counterController.getCounterById);

// DELETE /api/counter/history - очистить историю
router.delete('/history', counterController.clearHistory);

module.exports = router;