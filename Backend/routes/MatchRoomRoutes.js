const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const controller = require("../controllers/MatchRoomController");

router.post("/create", authenticateUser, controller.createMatchRoom);
router.get("/:roomId", authenticateUser, controller.getMatchRoom);

module.exports = router;