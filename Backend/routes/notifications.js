const express = require("express");
const router = express.Router();
const { generateNotificationMessage, getUserNotifications } = require("../controllers/notificationController");

router.post("/generate", generateNotificationMessage);
router.get("/:userId", getUserNotifications); // ← ajoute cette ligne
// routes/notifications.js
router.delete("/clear/:userId", async (req, res) => {
    try {
      await Notification.deleteMany({ userId: req.params.userId });
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "Erreur suppression notification" });
    }
  });
  

module.exports = router;
