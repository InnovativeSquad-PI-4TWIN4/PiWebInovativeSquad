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
} = require("../controllers/PremiumCoursesController");

// ✅ Middleware ici 👇
router.post("/addpremium", upload.none(), addPremiumCourse);

router.post("/access/:id", accessPremiumCourse);
router.post("/recharge/:id", rechargeBalance);
router.put("/mark-meet-ended/:id", markMeetEnded);
router.put("/replay/:id", updateReplayLink);
router.put("/update/:id", updatePremiumCourse);


module.exports = router;
