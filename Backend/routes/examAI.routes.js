const express = require("express");
const router = express.Router();
const { generateExam,validateExam,getExamResults } = require("../controllers/examAI.controller");

router.post("/generate", generateExam);
router.post("/validate", validateExam); // 👈 nouvelle route ici
router.get("/results/:userId", getExamResults); // ✅ ajoute cette ligne
module.exports = router;
