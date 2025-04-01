const express = require('express');
const router = express.Router();
const messageController = require('../controllers/MessageController');

// Send a message
router.post('/send-message', messageController.sendMessage);

// Get messages for a user (sent or received)
router.get('/messages/:userId', messageController.getMessages);

// Mark a message as read
router.put('/messages/:messageId/read', messageController.markAsRead);
router.get('/messages/getMessages/:senderId/:receiverId', messageController.getMessages);
router.get('/conversation/:senderId/:receiverId', messageController.getConversationMessages);

module.exports = router;
