// controllers/PubController.js
const Publication = require('../models/publication'); // Assurez-vous que le chemin est correct

// ➤ Récupérer toutes les publications
exports.getAllPub = async (req, res) => {
  try {
    const publications = await Publication.find()
      .populate('user', 'name surname image')
      .sort({ createdAt: -1 });
    res.status(200).json(publications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Récupérer une publication par ID
exports.getPubById = async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id)
      .populate('user', 'name surname image');
    
    if (!publication) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }
    
    res.status(200).json(publication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Créer une nouvelle publication
exports.createPub = async (req, res) => {
  try {
    const { user, type, description } = req.body;

    if (!user || !type || !description) {
      return res.status(400).json({ error: 'Tous les champs requis doivent être remplis' });
    }

    const newPublication = new Publication({
      user,
      type,
      description
    });

    await newPublication.save();
    
    const populatedPublication = await Publication.findById(newPublication._id)
      .populate('user', 'name surname image');

    res.status(201).json({ 
      message: 'Publication créée avec succès', 
      publication: populatedPublication 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Mettre à jour une publication
exports.updatePub = async (req, res) => {
  try {
    const { type, description } = req.body;

    const updatedPublication = await Publication.findByIdAndUpdate(
      req.params.id,
      {
        type,
        description,
        updatedAt: Date.now() // Ajout manuel d'un champ updatedAt si nécessaire
      },
      { new: true, runValidators: true }
    ).populate('user', 'name surname image');

    if (!updatedPublication) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    res.status(200).json({ 
      message: 'Publication mise à jour avec succès', 
      publication: updatedPublication 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Supprimer une publication
exports.deletePub = async (req, res) => {
  try {
    const publication = await Publication.findByIdAndDelete(req.params.id);

    if (!publication) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    res.status(200).json({ message: 'Publication supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};