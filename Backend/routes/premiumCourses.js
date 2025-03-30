const express = require("express");
const router = express.Router();

const {
  accessPremiumCourse,
  rechargeBalance,
  markMeetEnded,
  updateReplayLink,
} = require("../controllers/PremiumCoursesController");

// 🔐 Accès aux cours premium (avec vérification de solde)
router.post("/access/:id", accessPremiumCourse);

// 🔋 Recharge du solde utilisateur
router.post("/recharge/:id", rechargeBalance);

// ✅ Marquer un cours comme terminé (fin du Meet)
router.put("/mark-meet-ended/:id", markMeetEnded);

// ✅ Ajouter ou modifier un lien de replay
router.put("/replay/:id", updateReplayLink);

module.exports = router;
