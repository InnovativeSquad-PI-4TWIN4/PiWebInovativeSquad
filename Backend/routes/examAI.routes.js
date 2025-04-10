const express = require("express");
const router = express.Router();
const { generateExam } = require("../controllers/examAI.controller");

router.post("/generate", generateExam);
module.exports = router;
