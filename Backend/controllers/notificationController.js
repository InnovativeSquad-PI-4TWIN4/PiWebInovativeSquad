const OpenAI = require("openai");
const Notification = require("../models/Notification");
const User = require("../models/User");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateNotificationMessage = async (req, res) => {
    const { courseTitle, category } = req.body;
  
    try {
      const users = await User.find({});
  
      for (const user of users) {
        const message = `👋 Salut ${user.name}, un nouveau cours "${courseTitle}" est disponible dans la catégorie "${category}". Viens le découvrir vite ! 🚀`;
  
        await Notification.create({ userId: user._id, message });
      }
  
      res.status(200).json({ message: "✅ Notifications simulées avec succès (Mock IA) !" });
    } catch (err) {
      console.error("❌ Erreur Notification (Mock) :", err.message);
      res.status(500).json({ message: "Erreur lors de la génération." });
    }
  };
  

exports.getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Erreur chargement notifications" });
  }
};
