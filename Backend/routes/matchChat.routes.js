const express = require("express");
const router = express.Router();
const matchChatController = require("../controllers/matchChatController.js");

// Création, messages texte/audio
router.post("/create", matchChatController.createMatchChat);
router.post("/message/send", matchChatController.sendMessage);
router.post("/message/audio", matchChatController.uploadAudio, matchChatController.sendAudioMessage);

// Récupération
router.get("/messages/:conversationId", matchChatController.getMessages);
router.get("/by-match/:matchId", matchChatController.getChatByMatchId);
router.get("/by-user/:userId", matchChatController.getChatsByUser);

// Notification
router.post("/notify-email", matchChatController.notifyChatByEmail);
router.get("/:chatId", matchChatController.getChatById);


module.exports = router;