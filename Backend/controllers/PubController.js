const Publication = require('../models/publication');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateCommentForPublication } = require('../services/aiCommentService');

// ➤ Récupérer toutes les publications
exports.getAllPub = async (req, res) => {
  try {
    const publications = await Publication.find()
      .populate('user', 'name surname image')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name surname image',
        },
      })
      .populate({
        path: 'comments.replies',
        populate: {
          path: 'user',
          select: 'name surname image',
        },
      })
      .sort({ createdAt: -1 });

    console.log('Publications renvoyées :', JSON.stringify(publications, null, 2));
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

    console.log("Creating publication with description:", description);
    const commentSuggestions = await generateCommentForPublication(description);
    console.log("Generated comment suggestions:", commentSuggestions);

    const newPublication = new Publication({
      user,
      type,
      description,
      commentSuggestions,
    });

    await newPublication.save();
    
    const populatedPublication = await Publication.findById(newPublication._id)
      .populate('user', 'name surname image');

    console.log("Saved publication:", populatedPublication);

    res.status(201).json({ 
      message: 'Publication créée avec succès', 
      publication: populatedPublication 
    });
  } catch (error) {
    console.error("Error in createPub:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➤ Mettre à jour une publication
exports.updatePub = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, description } = req.body;

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    if (publication.user.toString() !== userId) {
      return res.status(403).json({ error: 'Seul l\'auteur peut modifier cette publication' });
    }

    if (publication.isArchived) {
      return res.status(403).json({ error: 'Cette publication est archivée et ne peut pas être modifiée' });
    }

    let commentSuggestions = publication.commentSuggestions;
    if (description && description !== publication.description) {
      commentSuggestions = await generateCommentForPublication(description);
    }

    const updatedPublication = await Publication.findByIdAndUpdate(
      req.params.id,
      {
        type,
        description,
        updatedAt: Date.now(),
        commentSuggestions,
      },
      { new: true, runValidators: true }
    ).populate('user', 'name surname image');

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
    const userId = req.user.userId;
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    if (publication.user.toString() !== userId) {
      return res.status(403).json({ error: 'Seul l\'auteur peut supprimer cette publication' });
    }

    await Publication.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Publication supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Ajouter ou retirer un "J'aime" à une publication (toggle like)
exports.likePublication = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const userId = req.user.userId;

    const publication = await Publication.findById(publicationId);
    if (!publication) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    const hasLiked = publication.likes.includes(userId);

    if (hasLiked) {
      publication.likes = publication.likes.filter(id => id.toString() !== userId);
    } else {
      publication.likes.push(userId);
    }

    await publication.save();

    const updatedPublication = await Publication.findById(publicationId)
      .populate('user', 'name surname image')
      .populate('comments.user', 'name surname image')
      .populate('comments.replies.user', 'name surname image');

    res.status(200).json({
      message: hasLiked ? 'Like retiré' : 'Like ajouté',
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

    console.log('Début de addComment:', { publicationId, userId, content });

    if (!content || content.trim().length === 0) {
      console.log('Erreur: Contenu du commentaire vide');
      return res.status(400).json({ error: 'Le contenu du commentaire est requis' });
    }

    const publication = await Publication.findById(publicationId);
    if (!publication) {
      console.log('Erreur: Publication non trouvée pour ID:', publicationId);
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    console.log('Publication trouvée:', publication);

    publication.comments.push({
      user: userId,
      content,
    });

    await publication.save();
    console.log('Commentaire ajouté avec succès à la publication:', publicationId);

    const ownerId = publication.user.toString();
    console.log('Propriétaire de la publication:', ownerId, 'Utilisateur qui commente:', userId);

    if (ownerId !== userId) {
      console.log('Création de la notification pour le propriétaire...');
      const sender = await User.findById(userId).select('name surname');
      if (!sender) {
        console.log('Erreur: Utilisateur expéditeur non trouvé pour ID:', userId);
        return res.status(404).json({ error: 'Utilisateur expéditeur non trouvé' });
      }

      console.log('Utilisateur expéditeur:', sender);

      const notification = new Notification({
        userId: ownerId,
        publicationId: publicationId,
        senderId: userId,
        message: `Nouveau commentaire de ${sender.name || 'Utilisateur'} ${sender.surname || 'Inconnu'} sur votre publication "${publication.description.substring(0, 20)}..."`,
      });

      await notification.save();
      console.log('Notification créée avec succès:', notification);
    } else {
      console.log('Pas de notification créée: L\'utilisateur commente sa propre publication');
    }

    const updatedPublication = await Publication.findById(publicationId)
      .populate('user', 'name surname image')
      .populate('comments.user', 'name surname image')
      .populate('comments.replies.user', 'name surname image');

    res.status(200).json({
      message: 'Commentaire ajouté avec succès',
      publication: updatedPublication,
    });
  } catch (err) {
    console.error('Erreur dans addComment:', err);
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

    const comment = publication.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    comment.replies.push({
      user: userId,
      content,
    });

    await publication.save();

    const commentOwnerId = comment.user.toString();
    console.log('Auteur du commentaire:', commentOwnerId, 'Utilisateur qui répond:', userId);

    if (commentOwnerId !== userId) {
      console.log('Création de la notification pour l\'auteur du commentaire...');
      const sender = await User.findById(userId).select('name surname');
      if (!sender) {
        console.log('Erreur: Utilisateur expéditeur non trouvé pour ID:', userId);
        return res.status(404).json({ error: 'Utilisateur expéditeur non trouvé' });
      }

      console.log('Utilisateur expéditeur:', sender);

      const notification = new Notification({
        userId: commentOwnerId,
        publicationId: publicationId,
        senderId: userId,
        message: `${sender.name || 'Utilisateur'} ${sender.surname || 'Inconnu'} a répondu à votre commentaire sur la publication "${publication.description.substring(0, 20)}..."`,
      });

      await notification.save();
      console.log('Notification de réponse créée avec succès:', notification);
    } else {
      console.log('Pas de notification créée: L\'utilisateur répond à son propre commentaire');
    }

    const updatedPublication = await Publication.findById(publicationId)
      .populate('user', 'name surname image')
      .populate('comments.user', 'name surname image')
      .populate('comments.replies.user', 'name surname image');

    res.status(200).json({
      message: 'Réponse ajoutée avec succès',
      publication: updatedPublication,
    });
  } catch (err) {
    console.error('Erreur dans addReply:', err);
    res.status(500).json({ error: err.message });
  }
};

// ➤ Récupérer toutes les notifications d'un utilisateur
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({ userId })
      .populate('senderId', 'name surname')
      .populate('publicationId', 'description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'SUCCESS',
      notifications,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// ➤ Marquer une notification comme lue
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Utilisateur non autorisé' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({ error: error.message });
  }
};

// ➤ Statistiques des publications par type (offre vs demande)
exports.getPublicationStats = async (req, res) => {
  try {
    const stats = await Publication.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur lors de l'agrégation des statistiques des publications :", error);
    res.status(500).json({ error: error.message });
  }
};

// ➤ Archiver une publication
exports.archivePub = async (req, res) => {
  try {
    const userId = req.user.userId;
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    if (publication.user.toString() !== userId) {
      return res.status(403).json({ error: 'Seul l\'auteur peut archiver cette publication' });
    }

    publication.isArchived = true;
    publication.updatedAt = Date.now();
    await publication.save();

    res.status(200).json({ message: 'Publication archivée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Récupérer les publications archivées
exports.getArchivedPub = async (req, res) => {
  try {
    const userId = req.user.userId;

    const archivedPublications = await Publication.find({
      user: userId,
      isArchived: true,
    })
      .populate('user', 'name surname image')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name surname image',
        },
      })
      .populate({
        path: 'comments.replies',
        populate: {
          path: 'user',
          select: 'name surname image',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(archivedPublications);
  } catch (error) {
    console.error('Erreur dans getArchivedPub :', error);
    res.status(500).json({ error: error.message });
  }
};