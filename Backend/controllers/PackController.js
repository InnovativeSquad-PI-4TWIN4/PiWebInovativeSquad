const Pack = require("../models/Packs");
const mongoose = require('mongoose');
const User = require("../models/User");

// ✅ Obtenir tous les packs
exports.getAllPacks = async (req, res) => {
  try {
    const packs = await Pack.find();
    res.json(packs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Obtenir un pack par ID
exports.getPackById = async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id);
    if (!pack) return res.status(404).json({ message: "Pack non trouvé" });
    res.json(pack);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Ajouter un nouveau pack
exports.createPack = async (req, res) => {
  try {
    const { title, description, price, discount, category } = req.body;
    const newPack = new Pack({ title, description, price, discount, category });
    await newPack.save();
    res.status(201).json(newPack.toJSON()); // Inclut `priceAfterDiscount`
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de l'ajout du pack", error });
  }
};

// ✅ Mettre à jour un pack
exports.updatePack = async (req, res) => {
  try {
    const updatedPack = await Pack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPack) return res.status(404).json({ message: "Pack non trouvé" });
    res.json(updatedPack.toJSON()); // Inclut `priceAfterDiscount`
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ✅ Supprimer un pack
exports.deletePack = async (req, res) => {
  try {
    const deletedPack = await Pack.findByIdAndDelete(req.params.id);
    if (!deletedPack) return res.status(404).json({ message: "Pack non trouvé" });
    res.json({ message: "Pack supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
  
};
// ✅ Acheter un pack
exports.buyPack = async (req, res) => {
  try {
      // Récupérer l'ID utilisateur à partir de req.user (qui est rempli par le middleware)
      const userId = req.user.userId;  // Assure-toi que l'ID utilisateur est correct dans req.user
      console.log("ID utilisateur extrait du token : ", userId);  // Affiche l'ID pour le débogage

      const { packId } = req.body;  // Récupère l'ID du pack acheté

      // Assure-toi que l'ID est un ObjectId valide
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ message: "ID utilisateur invalide." });
      }

      const user = await User.findById(userId);
      if (!user) {
          console.log("Utilisateur non trouvé dans la DB");
          return res.status(404).json({ message: "Utilisateur introuvable." });
      }

      // Vérifie si l'ID du pack est valide également
      if (!mongoose.Types.ObjectId.isValid(packId)) {
          return res.status(400).json({ message: "ID de pack invalide." });
      }

      const pack = await Pack.findById(packId);
      if (!pack) {
          console.log("Pack non trouvé dans la DB");
          return res.status(404).json({ message: "Pack introuvable." });
      }

      // Simuler l'achat du pack (par exemple, en ajoutant le pack à l'utilisateur)
      await user.buyPack(pack);  // La méthode buyPack doit être définie dans ton modèle User

      res.json({ message: "Achat réussi !", user });
  } catch (error) {
      console.error("Erreur lors de l'achat : ", error);
      res.status(400).json({ message: error.message });
  }
};