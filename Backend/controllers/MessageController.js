const Message = require('../models/Message');

// Send a message
exports.sendMessage = async (req, res) => {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content: content,
        });

        const savedMessage = await message.save();
        res.status(201).json({
            message: 'Message envoyé avec succès !',
            savedMessage // Return the saved message data for confirmation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
    }
};


// Fetch all messages for a user (sent or received)
exports.getMessages = async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Pagination parameters with default values

    try {
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
            .skip((page - 1) * limit) // Skip messages for pagination
            .limit(Number(limit)) // Limit the number of messages
            .populate('sender receiver');

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
    }
};


// Mark message as read
exports.markAsRead = async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: 'Message non trouvé.' });
        }

        message.read = true;
        await message.save();
        res.status(200).json({ message: 'Message marqué comme lu.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du message.' });
    }
};
