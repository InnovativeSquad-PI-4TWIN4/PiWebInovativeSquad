const express = require("express");
const router = express.Router();
const { recommendPartners } = require("../controllers/recommendation.controller");
const { authenticateUser } = require("../middleware/authMiddleware");

// Route sécurisée avec authentification
router.get("/:userId", authenticateUser, recommendPartners);

module.exports = router;
