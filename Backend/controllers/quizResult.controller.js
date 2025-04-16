const QuizResult = require("../models/QuizResult");
const Course =require("../models/Courses"); // ✅ Ce fichier doit être importé AVANT le controller



exports.saveQuizResult = async (req, res) => {
  const { userId, courseId, score, total } = req.body;

  const isValidated = score > total / 2;

  try {
    const result = await QuizResult.findOneAndUpdate(
      { userId, courseId },
      { score, total, isValidated },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "✅ Résultat enregistré", result });
  } catch (err) {
    res.status(500).json({ message: "❌ Erreur serveur", error: err.message });
  }
};

exports.getQuizResult = async (req, res) => {
  const { courseId, userId } = req.params;

  try {
    const result = await QuizResult.findOne({ courseId, userId });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "❌ Erreur serveur", error: err.message });
  }
};
exports.getValidatedCategories = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Récupère tous les quizzes validés
    const results = await QuizResult.find({ userId, isValidated: true });

    // Récupère les cours liés
    const courseIds = results.map(r => r.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } });

    // Compte les catégories
    const categoryCount = {};
    for (const course of courses) {
      if (course.category) {
        categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
      }
    }

    res.status(200).json({ categoryCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getUserQuizResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.params.userId }).populate({
      path: "courseId",
      model: "courses", // 👈 assure-toi que c'est bien "courses" (en minuscule)
      select: "title",  // 👈 ne récupère que le titre
    });

    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Erreur dans getUserQuizResults :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};





