const QuizResult = require("../models/QuizResult");
const User = require("../models/User"); // 👈 ajoute bien l'import du modèle User !!

// ✅ Déjà existant
exports.checkWheelEligibility = async (req, res) => {
  try {
    const userId = req.params.userId;
    const validatedQuiz = await QuizResult.findOne({ userId, isValidated: true });

    if (validatedQuiz) {
      res.status(200).json({ eligible: true });
    } else {
      res.status(200).json({ eligible: false });
    }
  } catch (error) {
    console.error("Erreur dans checkWheelEligibility :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Nouvelle fonction pour mettre à jour le solde
exports.updateSolde = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { amount } = req.body; // combien ajouter

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.solde = (user.solde || 0) + amount;
    await user.save();

    res.status(200).json({ message: `✅ Solde mis à jour : +${amount}DT`, solde: user.solde });
  } catch (error) {
    console.error("Erreur dans updateSolde :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
