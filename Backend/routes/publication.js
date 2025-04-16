const express = require("express");
const router = express.Router();
const PubController = require("../controllers/PubController");
const { authenticateUser } = require("../middleware/authMiddleware");


router.get("/getAllPub", PubController.getAllPub);//F
router.get("/getPubById/:id", PubController.getPubById); //F
router.post("/createPub", PubController.createPub); //M
router.put("/updatePub/:id",authenticateUser, PubController.updatePub); //F
router.delete("/deletePub/:id",authenticateUser, PubController.deletePub);//F
router.post("/like/:id" , authenticateUser, PubController.likePublication); //M
router.post('/comment/:id', authenticateUser, PubController.addComment);//F
router.post('/reply/:id/:commentId', authenticateUser, PubController.addReply);//F
// Ajout des routes pour les notifications
router.get("/notifications", authenticateUser, PubController.getUserNotifications); //F
router.post("/notifications/:id/read", authenticateUser, PubController.markNotificationAsRead);//F
router.get("/stats", PubController.getPublicationStats); //M
router.post("/archive/:id", authenticateUser, PubController.archivePub); // F
router.get("/archived", authenticateUser, PubController.getArchivedPub); // F
module.exports = router;