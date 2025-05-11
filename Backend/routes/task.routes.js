const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/', authenticateUser, taskController.createTask);
router.get('/project/:projectId', authenticateUser, taskController.getTasksByProject);
router.put('/:taskId', authenticateUser, taskController.updateTaskStatus); // ✅ FIXED route
router.delete('/:taskId', authenticateUser, taskController.deleteTask);   // ✅ FIXED route

module.exports = router;