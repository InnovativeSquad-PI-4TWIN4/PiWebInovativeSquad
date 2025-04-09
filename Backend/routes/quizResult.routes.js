const express = require("express");
const router = express.Router();
const quizResultController = require("../controllers/quizResult.controller");

// ✅ Enregistrer ou mettre à jour un score
router.post("/save-score", quizResultController.saveQuizResult);

// ✅ Obtenir tous les scores validés d’un user (à ajouter)
router.get("/user/:userId", async (req, res) => {
  try {
    const results = await require("../models/QuizResult").find({ userId: req.params.userId });
    res.status(200).json(results.map(r => ({
      courseId: r.courseId,
      score: r.score,
      total: r.total,
      isValidated: true // 👈 important pour que le frontend l'affiche
    })));
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des scores", error: error.message });
  }
});
// ✅ Obtenir un score spécifique (par cours + user)
router.get("/:courseId/:userId", quizResultController.getQuizResult);


module.exports = router;
