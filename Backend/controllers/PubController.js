// controllers/PubController.js
const Publication = require('../models/publication'); // Assurez-vous que le chemin est correct

// ➤ Récupérer toutes les publications
exports.getAllPub = async (req, res) => {
  try {
    const publications = await Publication.find()
      .populate('user', 'name surname image') // Utilisateur de la publication
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name surname image' // Utilisateur des commentaires
        }
      })
      .populate({
        path: 'comments.replies',
        populate: {
          path: 'user',
          select: 'name surname image' // Utilisateur des réponses
        }
      })
      .sort({ createdAt: -1 });
    console.log('Publications renvoyées :', JSON.stringify(publications, null, 2)); // Log pour débogage
    res.status(200).json(publications);
  } catch (error) {
    console.error('Erreur dans getAllPub :', error);
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
// ➤ Ajouter un "J'aime" à une publication
exports.likePublication = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const userId = req.user.userId; // Récupéré via le middleware d'authentification

    const publication = await Publication.findById(publicationId);
    if (!publication) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    // Vérifier si l'utilisateur a déjà aimé la publication
    if (publication.likes.includes(userId)) {
      return res.status(400).json({ error: 'Vous avez déjà aimé cette publication' });
    }

    // Ajouter l'ID de l'utilisateur au tableau likes
    publication.likes.push(userId);
    await publication.save();

    // Repeupler les données de l'utilisateur pour renvoyer la publication mise à jour
    const updatedPublication = await Publication.findById(publicationId).populate(
      'user',
      'name surname image'
    );
    res.status(200).json({
      message: 'J\'aime ajouté avec succès',
      publication: updatedPublication,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Ajouter un commentaire à une publication
exports.addComment = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const userId = req.user.userId;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Le contenu du commentaire est requis' });
    }

    const publication = await Publication.findById(publicationId);
    if (!publication) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    publication.comments.push({
      user: userId,
      content,
    });

    await publication.save();

    const updatedPublication = await Publication.findById(publicationId)
      .populate('user', 'name surname image')
      .populate('comments.user', 'name surname image')
      .populate('comments.replies.user', 'name surname image');

    res.status(200).json({
      message: 'Commentaire ajouté avec succès',
      publication: updatedPublication,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Ajouter une réponse à un commentaire
exports.addReply = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const commentId = req.params.commentId;
    const userId = req.user.userId;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Le contenu de la réponse est requis' });
    }

    const publication = await Publication.findById(publicationId);
    if (!publication) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    // Vérifier si l'utilisateur est le créateur de la publication
    if (publication.user.toString() !== userId) {
      return res.status(403).json({ error: 'Seul le créateur de la publication peut répondre aux commentaires' });
    }

    const comment = publication.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    comment.replies.push({
      user: userId,
      content,
    });

    await publication.save();

    const updatedPublication = await Publication.findById(publicationId)
      .populate('user', 'name surname image')
      .populate('comments.user', 'name surname image')
      .populate('comments.replies.user', 'name surname image');

    res.status(200).json({
      message: 'Réponse ajoutée avec succès',
      publication: updatedPublication,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};