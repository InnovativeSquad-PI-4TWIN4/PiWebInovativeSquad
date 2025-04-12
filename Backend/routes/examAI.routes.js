const express = require("express");
const router = express.Router();
const { generateExam,validateExam } = require("../controllers/examAI.controller");

router.post("/generate", generateExam);
router.post("/validate", validateExam); // 👈 nouvelle route ici
module.exports = router;
