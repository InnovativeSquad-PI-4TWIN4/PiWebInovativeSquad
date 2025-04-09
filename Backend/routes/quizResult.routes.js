const express = require("express");
const router = express.Router();
const quizResultController = require("../controllers/quizResult.controller");

// ✅ Enregistrer ou mettre à jour un score
router.post("/save-score", quizResultController.saveQuizResult);

// ✅ Obtenir un score spécifique (par cours + user)
router.get("/:courseId/:userId", quizResultController.getQuizResult);

// ✅ Obtenir tous les scores validés d’un user (à ajouter)
router.get("/user/:userId", async (req, res) => {
  try {
    const results = await require("../models/QuizResult").find({ userId: req.params.userId });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des scores", error: error.message });
  }
});

module.exports = router;
