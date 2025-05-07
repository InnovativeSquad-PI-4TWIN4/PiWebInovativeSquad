const express = require("express");
const router = express.Router();
const matchRequestController = require("../controllers/matchRequest.controller");
const { authenticateUser } = require("../middleware/authMiddleware");

router.post("/send", authenticateUser, matchRequestController.sendMatchRequest);
// ✅ Nouvelle route pour récupérer les demandes envoyées / reçues
router.get("/all/:userId", authenticateUser, matchRequestController.getUserMatches);
router.post('/accept/:id', matchRequestController.acceptMatch);
router.post('/reject/:id', matchRequestController.rejectMatch);



module.exports = router;