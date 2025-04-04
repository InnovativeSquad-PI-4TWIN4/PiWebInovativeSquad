const User = require("../models/User");

// ✅ Ajouter un cours aux favoris
exports.addToFavorites = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (user.favorites.includes(courseId)) {
      return res.status(400).json({ message: "Ce cours est déjà dans les favoris." });
    }

    user.favorites.push(courseId);
    await user.save();

    res.status(200).json({ message: "✅ Cours ajouté aux favoris", favorites: user.favorites });
  } catch (error) {
    console.error("Erreur ajout favoris:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Retirer un cours des favoris
exports.removeFromFavorites = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.favorites = user.favorites.filter(id => id.toString() !== courseId);
    await user.save();

    res.status(200).json({ message: "❌ Cours retiré des favoris", favorites: user.favorites });
  } catch (error) {
    console.error("Erreur suppression favoris:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Récupérer tous les cours favoris de l'utilisateur
exports.getFavorites = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("favorites");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json(user.favorites);
  } catch (error) {
    console.error("Erreur récupération favoris:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
