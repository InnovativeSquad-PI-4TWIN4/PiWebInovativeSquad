const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { authenticateUser } = require('../middleware/authMiddleware'); // ✅ ligne à ajouter

router.post('/', authenticateUser, projectController.createProject);
router.get('/', authenticateUser, projectController.getAllProjects);
router.put('/:projectId/add-member', authenticateUser, projectController.addMemberToProject);

module.exports = router;
