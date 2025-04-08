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
    const userId = req.user.userId;
    const { packId } = req.body;

    // Vérification des IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(packId)) {
      return res.status(400).json({ message: "ID utilisateur ou pack invalide." });
    }

    const user = await User.findById(userId);
    const pack = await Pack.findById(packId);

    if (!user || !pack) {
      return res.status(404).json({ message: "Utilisateur ou pack introuvable." });
    }

    // ❌ Vérifier si l'utilisateur a déjà acheté ce pack
    const alreadyBought = user.abonnement.some((ab) => ab.toString() === packId);
    if (alreadyBought) {
      return res.status(400).json({ message: "Vous avez déjà acheté ce pack." });
    }

    // 💸 Calcul du prix après réduction
    const priceAfterDiscount = pack.price - (pack.price * pack.discount) / 100;

    // ❌ Vérifier que l'utilisateur a assez de points (solde)
    if (user.solde < priceAfterDiscount) {
      return res.status(400).json({ message: "Solde insuffisant pour acheter ce pack." });
    }

    // ✅ Ajouter le pack aux abonnements
    user.abonnement.push(packId);

    // 💰 Déduire le montant du solde
    user.solde -= priceAfterDiscount;

    await user.save();

    res.status(200).json({
      message: "Achat réussi !",
      soldeRestant: user.solde,
      pack: pack.title,
    });

  } catch (error) {
    console.error("Erreur lors de l'achat : ", error);
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
};