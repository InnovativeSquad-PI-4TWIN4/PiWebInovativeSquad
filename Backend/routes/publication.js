const express = require("express");
const router = express.Router();
const PubController = require("../controllers/PubController");
const { authenticateUser } = require("../middleware/authMiddleware");


router.get("/getAllPub", PubController.getAllPub);
router.get("/getPubById/:id", PubController.getPubById);
router.post("/createPub", PubController.createPub);
router.put("/updatePub/:id", PubController.updatePub);
router.delete("/deletePub/:id", PubController.deletePub);
router.post("/like/:id" , authenticateUser, PubController.likePublication);
router.post('/comment/:id', authenticateUser, PubController.addComment);
router.post('/reply/:id/:commentId', authenticateUser, PubController.addReply);
// Ajout des routes pour les notifications
router.get("/notifications", authenticateUser, PubController.getUserNotifications);
router.post("/notifications/:id/read", authenticateUser, PubController.markNotificationAsRead);
module.exports = router;