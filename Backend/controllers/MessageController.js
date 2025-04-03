const Message = require('../models/Message');
const mongoose = require('mongoose');
const User = require('../models/User'); 


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

 // ✅ Mettre les messages reçus comme "lus"
        await Message.updateMany(
            { senderId: receiverId, receiverId: senderId, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving messages" });
    }
};

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
        // Save the message
        const message = new Message({ sender: senderId, receiver: receiverId, content, conversationId });
        const savedMessage = await message.save();

        // Check if sender and receiver exist
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ error: "Sender or receiver not found." });
        }

        // Respond with the saved message and sender/receiver info
        res.status(201).json({
            message: 'Message sent successfully!',
            savedMessage: {
                ...savedMessage._doc,
                sender: { ...sender._doc, name: sender.name },
                receiver: { ...receiver._doc, name: receiver.name }
            }
        });
    } catch (error) {
        console.error("Error in sendMessage:", error); // Log full error for debugging
        res.status(500).json({ error: "Error sending message. Please check the server logs." });
    }
};


exports.markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params; // Assure-toi que tu passes bien l'ID du message
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Met à jour l'attribut 'read' du message
        message.read = true;

        // Sauvegarde du message mis à jour
        await message.save();

        return res.status(200).json({ message: 'Message marked as read' });
    } catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).json({ error: 'Error updating message' });
    }
};