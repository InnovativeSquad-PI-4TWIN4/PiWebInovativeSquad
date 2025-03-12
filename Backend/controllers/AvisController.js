const Avis = require('../models/Avis');

// ➤ Ajouter un avis
exports.ajouterAvis = async (req, res) => {
  try {
    const { client, rating, description } = req.body;
    const newAvis = new Avis({ client, rating, description });
    await newAvis.save();
    res.status(201).json({ message: 'Avis ajouté avec succès', avis: newAvis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Récupérer tous les avis
exports.getAvis = async (req, res) => {
  try {
    const avisList = await Avis.find().sort({ createdAt: -1 });
    res.status(200).json(avisList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Supprimer un avis
exports.supprimerAvis = async (req, res) => {
  try {
    const { id } = req.params;
    await Avis.findByIdAndDelete(id);
    res.status(200).json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
