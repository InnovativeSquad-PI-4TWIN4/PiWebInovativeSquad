const Chat = require('../models/Chat');

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

    res.status(200).json({ status: 'SUCCESS', message: newMessage });
  } catch (error) {
    console.error('Erreur sendMessage:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
};

exports.getMessages = async (req, res) => {
  const { publicationId } = req.params;
  const userId = req.user._id;

  try {
    const chat = await Chat.findOne({
      publicationId,
      $or: [{ user1: userId }, { user2: userId }],
    });

    if (!chat) {
      return res.status(404).json({ error: 'Salle de chat non trouvée.' });
    }

    res.status(200).json({ status: 'SUCCESS', messages: chat.messages });
  } catch (error) {
    console.error('Erreur getMessages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
};

exports.uploadFile = async (req, res) => {
  const { senderId, receiverId, publicationId } = req.body;
  console.log('Requête reçue:', { senderId, receiverId, publicationId, file: req.file }); // Débogage

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

    const fileUrl = `/uploads/${req.file.filename}`; // URL relative pour accéder au fichier
    const message = {
      senderId,
      content: `File: ${fileUrl}`, // Stocker l'URL ou le chemin du fichier
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    res.status(200).json({ status: 'SUCCESS', message });
  } catch (error) {
    console.error('Erreur uploadFile:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du fichier.' });
  }
};