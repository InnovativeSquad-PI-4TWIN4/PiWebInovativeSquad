const express = require('express');
const router = express.Router();
const robotController = require('../controllers/robot.controller');

// ✅ Route pour poser une question au robot
router.post('/ask', robotController.askRobot);

module.exports = router;
