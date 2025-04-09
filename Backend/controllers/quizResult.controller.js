const QuizResult = require("../models/QuizResult");

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
