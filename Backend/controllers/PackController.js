const Pack = require("../models/Packs");

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
