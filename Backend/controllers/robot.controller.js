require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ Fonction pour poser une question au robot
exports.askRobot = async (req, res) => {
  try {
    const { question, courseContent } = req.body;

    const response = await groq.chat.completions.create({
      model: 'llama3-70b-8192', // 🧠 modèle IA Groq utilisé
      messages: [
        {
          role: 'system',
          content: `Tu es un coach IA éducatif. Ton rôle est d'expliquer de manière simple et motivante le contenu suivant : ${courseContent}.`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.6, // Plus humain
      max_tokens: 600, // Limite la taille de la réponse
    });

    const answer = response.choices[0]?.message?.content || "Désolé, je n'ai pas compris votre question.";

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Erreur dans askRobot :", error.response?.data || error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
