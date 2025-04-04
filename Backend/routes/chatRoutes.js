const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateUser } = require("../middleware/authMiddleware");
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post('/create', authenticateUser, chatController.createChat);
router.post('/send/:publicationId', authenticateUser, chatController.sendMessage);
router.get('/getMessages/:publicationId', authenticateUser, chatController.getMessages);
router.post('/upload', authenticateUser, upload.single('file'), chatController.uploadFile);
router.get('/notifications', authenticateUser, chatController.getNotifications); // Nouvelle route
router.post('/notifications/:notificationId/read', authenticateUser, chatController.markNotificationAsRead);

module.exports = router;