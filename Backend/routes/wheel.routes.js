const express = require("express");
const router = express.Router();
const wheelController = require("../controllers/wheel.controller");

router.get("/check-eligibility/:userId", wheelController.checkWheelEligibility);
router.post("/update-solde/:userId", wheelController.updateSolde); // ✅ nouvelle route POST ici !

module.exports = router;
