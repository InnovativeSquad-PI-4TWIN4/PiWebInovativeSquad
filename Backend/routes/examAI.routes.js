const express = require("express");
const router = express.Router();
const { generateExam, validateExam, getExamResults } = require("../controllers/examAI.controller");

router.post("/generate", generateExam);
router.post("/validate", validateExam); // ✅ celle qu'on veut tester
router.get("/results/:userId", getExamResults);

module.exports = router;
