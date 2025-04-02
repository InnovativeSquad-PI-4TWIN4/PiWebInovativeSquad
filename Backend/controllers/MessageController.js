const Message = require('../models/Message');
const mongoose = require('mongoose');


// exports.getConversationMessages = async (req, res) => {
//     const { senderId, receiverId } = req.params;

//     if (!senderId || !receiverId) {
//         return res.status(400).json({ error: "Sender or Receiver ID is missing" });
//     }

//     console.log(`Fetching messages for sender: ${senderId}, receiver: ${receiverId}`);

//     const conversationId = [senderId, receiverId].sort().join('_');

//     try {
//         const messages = await Message.find({ conversationId }).sort({ createdAt: 1 })
//             .populate('sender receiver', 'username profilePicture');

//         res.status(200).json({ messages });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Error retrieving messages" });
//     }
// };


// exports.sendMessage = async (req, res) => {
//     const { senderId, receiverId, content } = req.body;
//     const conversationId = [senderId, receiverId].sort().join('_');  
//     if (!senderId || !receiverId || !content) {
//         return res.status(400).json({ error: 'Tous les champs sont requis.' });
//     }

//     // Vérifier si senderId et receiverId sont des ObjectId valides
//     if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
//         return res.status(400).json({ error: 'ID d\'utilisateur invalide.' });
//     }

//     try {
//         const message = new Message({
//             sender: new mongoose.Types.ObjectId(senderId),
//             receiver: new mongoose.Types.ObjectId(receiverId),
//             content: content,conversationId
//         });

//         const savedMessage = await message.save();
//         res.status(201).json({
//             message: 'Message envoyé avec succès !',
//             savedMessage 
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
//     }
// };

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



// ✅ Fetch messages between two users
exports.getConversationMessages = async (req, res) => {
    const { senderId, receiverId } = req.params;

    if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Sender or Receiver ID is missing" });
    }

    console.log(`Fetching messages for sender: ${senderId}, receiver: ${receiverId}`);

    const conversationId = [senderId, receiverId].sort().join("_");

    try {
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 })
            .populate("sender receiver", "username profilePicture");

        res.status(200).json({ messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving messages" });
    }
};

// ✅ Send a message
exports.sendMessage = async (req, res) => {
    const { senderId, receiverId, content } = req.body;
    const conversationId = [senderId, receiverId].sort().join("_");

    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ error: "Invalid user ID." });
    }

    try {
        const message = new Message({ sender: senderId, receiver: receiverId, content, conversationId });
        const savedMessage = await message.save();
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        res.status(201).json({
            message: 'Message sent successfully!',
            savedMessage: {
                ...savedMessage._doc,
                sender: { ...sender._doc, name: sender.name },
                receiver: { ...receiver._doc, name: receiver.name }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error sending message." });
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
