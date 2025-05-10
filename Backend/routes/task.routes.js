const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/', authenticateUser, taskController.createTask);
router.get('/project/:projectId', authenticateUser, taskController.getTasksByProject); // ✅ à ajouter
router.put('/:id', authenticateUser, taskController.updateTaskStatus);
router.post('/:id/comments', authenticateUser, taskController.addComment);

module.exports = router;
