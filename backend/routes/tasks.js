const express = require('express');
const { protect } = require('../middleware/auth');
const { getTasks, getTask, createTask, updateTask, deleteTask, getStats } = require('../controllers/taskController');

const router = express.Router();
router.use(protect); // All protected
router.get('/', getTasks);
router.get('/stats', getStats);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
