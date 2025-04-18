const express = require('express');
const router = express.Router();
const messageController = require('../controllers/MessageController');

// Send a message
router.post('/send-message', messageController.sendMessage);

// Get all messages for a user (sent or received)
router.get('/messages/:userId', messageController.getMessages);

// Get conversation messages between two users
router.get('/conversation/:senderId/:receiverId', messageController.getConversationMessages);
router.put('/mark-as-read/:messageId', messageController.markMessageAsRead);

router.get("/unread-counts/:userId", messageController.getUnreadCounts);
router.delete('/delete-message/:messageId/:userId', messageController.deleteMessageBySender);
router.put("/update-message/:id", messageController.updateMessage);

module.exports = router;
