const Chat = require('../models/Chat');
const Notification = require('../models/Notification');

exports.createChat = async (req, res) => {
  const { user1, user2, publicationId } = req.body;

  try {
    let chat = await Chat.findOne({
      $or: [
        { user1, user2, publicationId },
        { user1: user2, user2: user1, publicationId },
      ],
    });

    if (!chat) {
      chat = new Chat({
        user1,
        user2,
        publicationId,
        messages: [],
      });
      await chat.save();
    }

    res.status(200).json({ status: 'SUCCESS', messages: chat.messages });
  } catch (error) {
    console.error('Erreur createChat:', error);
    res.status(500).json({ error: 'Erreur lors de la création du chat.' });
  }
};

exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  const { publicationId } = req.params;

  try {
    const chat = await Chat.findOne({
      $or: [
        { user1: senderId, user2: receiverId, publicationId },
        { user1: receiverId, user2: senderId, publicationId },
      ],
    });

    if (!chat) {
      return res.status(404).json({ error: 'Salle de chat non trouvée.' });
    }

    const newMessage = {
      senderId,
      receiverId,
      content,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Créer une notification pour le destinataire
    console.log('Création de la notification pour:', { userId: receiverId, publicationId, senderId });
    const notification = new Notification({
      userId: receiverId,
      publicationId,
      senderId,
      message: `Nouveau message de ${senderId} dans la discussion de la publication ${publicationId}`,
    });
    await notification.save();
    console.log('Notification créée:', notification);

    res.status(200).json({ status: 'SUCCESS', message: newMessage });
  } catch (error) {
    console.error('Erreur sendMessage:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
};

exports.getMessages = async (req, res) => {
  const { publicationId } = req.params;
  const userId = req.user.userId;

  try {
    const chat = await Chat.findOne({
      publicationId,
      $or: [{ user1: userId }, { user2: userId }],
    }).populate('messages.senderId', 'name surname'); // Ajout du peuplement

    if (!chat) {
      return res.status(404).json({ error: 'Salle de chat non trouvée.' });
    }

    console.log('Messages récupérés pour publicationId:', publicationId, JSON.stringify(chat.messages, null, 2));
    res.status(200).json({ status: 'SUCCESS', messages: chat.messages });
  } catch (error) {
    console.error('Erreur getMessages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
};

exports.uploadFile = async (req, res) => {
  const { senderId, receiverId, publicationId } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier téléchargé.' });
  }

  try {
    let chat = await Chat.findOne({
      publicationId,
      $or: [{ user1: senderId, user2: receiverId }, { user1: receiverId, user2: senderId }],
    });

    if (!chat) {
      chat = new Chat({
        user1: senderId,
        user2: receiverId,
        publicationId,
        messages: [],
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const message = {
      senderId,
      content: `File: ${fileUrl}`,
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    // Créer une notification pour le destinataire
    console.log('Création de la notification pour fichier:', { userId: receiverId, publicationId, senderId });
    const notification = new Notification({
      userId: receiverId,
      publicationId,
      senderId,
      message: `Nouveau fichier envoyé par ${senderId} dans la discussion de la publication ${publicationId}`,
    });
    await notification.save();
    console.log('Notification fichier créée:', notification);

    res.status(200).json({ status: 'SUCCESS', message });
  } catch (error) {
    console.error('Erreur uploadFile:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du fichier.' });
  }
};

exports.getNotifications = async (req, res) => {
  const userId = req.user.userId;

  try {
    const notifications = await Notification.find({ userId })
      .populate('senderId', 'name surname')
      .populate('publicationId', 'description')
      .sort({ createdAt: -1 });

    // Ajout de logs détaillés
    console.log('Notifications après peuplement:', JSON.stringify(notifications, null, 2));
    res.status(200).json({ status: 'SUCCESS', notifications });
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications.' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée.' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ status: 'SUCCESS', notification });
  } catch (error) {
    console.error('Erreur markNotificationAsRead:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification.' });
  }
};