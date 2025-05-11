const express = require("express");
const router = express.Router();
const { generateSprintPlan, getAllSprints } = require("../controllers/sprintAI.controller");
const { authenticateUser } = require("../middleware/authMiddleware");

router.post("/generate", authenticateUser, generateSprintPlan);
router.get("/", getAllSprints); // 🔍 Test des données générées

module.exports = router;
