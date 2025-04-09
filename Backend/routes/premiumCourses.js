const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // Aucune config de stockage car pas de fichier

const {
  addPremiumCourse,
  accessPremiumCourse,
  rechargeBalance,
  markMeetEnded,
  updateReplayLink,
  updatePremiumCourse,
  generateSmartQuiz,
} = require("../controllers/PremiumCoursesController");

// ✅ Middleware ici 👇
router.post("/addpremium", upload.none(), addPremiumCourse);

router.post("/access/:id", accessPremiumCourse);
router.post("/recharge/:id", rechargeBalance);
router.put("/mark-meet-ended/:id", markMeetEnded);
router.put("/replay/:id", updateReplayLink);
router.put("/update/:id", updatePremiumCourse);
router.post("/generate-quiz/:id", generateSmartQuiz);







module.exports = router;
