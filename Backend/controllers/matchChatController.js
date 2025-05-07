const MatchChat = require("../models/matchChat");
const Message = require("../models/Message");
const User = require("../models/User");
const MatchRequest = require("../models/MatchRequest");
const transporter = require("../config/nodemailer");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// 🔗 Générer un lien vers le frontend
const generateChatLink = (chatId) => {
  return `http://localhost:5173/chat/${chatId}`;
};

// 🎤 Config multer pour audio
const storage = multer.diskStorage({
  destination: "./uploads/audio/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });
exports.uploadAudio = upload.single("audio");

// ✅ Créer un nouveau chat après match accepté
exports.createMatchChat = async (req, res) => {
  try {
    const { user1, user2, matchId } = req.body;

    const existingChat = await MatchChat.findOne({ matchId });
    if (existingChat) return res.status(200).json(existingChat);

    const newChat = await MatchChat.create({
      participants: [user1, user2],
      matchId,
    });

    await MatchRequest.findByIdAndUpdate(matchId, {
      chatId: newChat._id,
    });

    res.status(201).json(newChat);
  } catch (err) {
    console.error("❌ Erreur création chat :", err);
    res.status(500).json({ error: "Erreur lors de la création du chat." });
  }
};

// ✅ Envoyer un message texte
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, sender, content } = req.body;

    const chat = await MatchChat.findById(conversationId);
    if (!chat) return res.status(404).json({ error: "Chat non trouvé." });

    const receiver = chat.participants.find((p) => p.toString() !== sender);
    if (!receiver) return res.status(400).json({ error: "Receiver introuvable." });

    const message = await Message.create({
      conversationId,
      sender,
      receiver,
      content,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("❌ Erreur envoi message :", err);
    res.status(500).json({ error: "Erreur lors de l'envoi du message." });
  }
};

// ✅ Envoyer un message audio
exports.sendAudioMessage = async (req, res) => {
  try {
    const { conversationId, sender } = req.body;
    const audioUrl = `/uploads/audio/${req.file.filename}`;

    const message = await Message.create({
      conversationId,
      sender,
      audioUrl,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("Erreur envoi vocal :", err);
    res.status(500).json({ error: "Erreur lors de l'envoi du vocal." });
  }
};

// ✅ Récupérer les messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const user = await User.findById(msg.sender).select("name surname");
        return {
          ...msg.toObject(),
          senderName: user ? `${user.name} ${user.surname}` : "Utilisateur inconnu",
        };
      })
    );

    res.status(200).json(enrichedMessages);
  } catch (err) {
    console.error("Erreur récupération messages :", err);
    res.status(500).json({ error: "Erreur lors du chargement des messages." });
  }
};

// ✅ Obtenir un chat par matchId
exports.getChatByMatchId = async (req, res) => {
  try {
    const { matchId } = req.params;
    const chat = await MatchChat.findOne({ matchId }).populate({ path: "participants", model: "users" });

    if (!chat) return res.status(404).json({ error: "Chat introuvable." });

    res.status(200).json(chat);
  } catch (err) {
    console.error("Erreur récupération chat par matchId :", err);
    res.status(500).json({ error: "Erreur lors de la récupération du chat." });
  }
};

// ✅ Obtenir tous les chats d’un utilisateur
exports.getChatsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await MatchChat.find({ participants: userId })
      .populate({ path: "participants", model: "users" })
      .populate("matchId");

    res.status(200).json(chats);
  } catch (err) {
    console.error("Erreur récupération chats utilisateur :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des chats." });
  }
};

// ✅ Email lors de l'acceptation d'un match
exports.notifyChatByEmail = async (req, res) => {
  try {
    const { matchId } = req.body;

    const match = await MatchRequest.findById(matchId).populate("sender receiver publication");
    if (!match) return res.status(404).json({ error: "Match introuvable." });

    const chat = await MatchChat.findOne({ matchId });
    if (!chat) return res.status(404).json({ error: "Chat non trouvé." });

    const chatLink = generateChatLink(chat._id);
    const templatePath = path.join(__dirname, "../templates/matchAcceptedEmail.html");
    let html = fs.readFileSync(templatePath, "utf-8");

    html = html
      .replace(/{{senderName}}/g, `${match.sender.name} ${match.sender.surname}`)
      .replace(/{{receiverName}}/g, `${match.receiver.name} ${match.receiver.surname}`)
      .replace(/{{matchTitle}}/g, "Échange de compétences")
      .replace(/{{matchDescription}}/g, `${match.publication.description}`)
      .replace(/{{chatLink}}/g, `${chatLink}`);

    const mailOptions = {
      from: '"SkillBridge 👥" <no-reply@skillbridge.com>',
      to: `${match.sender.email}, ${match.receiver.email}`.trim(),
      subject: "💬 Un match a été accepté !",
      html,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email envoyé avec succès." });
  } catch (err) {
    console.error("Erreur envoi email de chat :", err);
    res.status(500).json({ error: "Erreur lors de l’envoi du mail." });
  }
};

// ✅ Obtenir un chat par ID
exports.getChatById = async (req, res) => {
  try {
    const chat = await MatchChat.findById(req.params.chatId).populate({ path: "participants", model: "users" });
    if (!chat) return res.status(404).json({ error: "Chat non trouvé." });
    res.status(200).json(chat);
  } catch (err) {
    console.error("Erreur getChatById:", err);
    res.status(500).json({ error: "Erreur lors de la récupération du chat." });
  }
};