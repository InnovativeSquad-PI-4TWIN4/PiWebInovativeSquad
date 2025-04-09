// PremiumCoursesController.js

const User = require("../models/User");
const Course = require("../models/Courses");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { OpenAI } = require("openai");

// ✅ OpenRouter configuration
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// ✅ Ajouter un cours premium
exports.addPremiumCourse = async (req, res) => {
  try {
    console.log("📦 Données reçues :", req.body);
    const { title, category, instructor, meetLink, price ,courseSummary } = req.body;
    if (!title || !category || !instructor || !meetLink || !price) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const newCourse = new Course({
      title,
      category,
      instructor: new ObjectId(instructor),
      meetLink,
      price,
      isPremium: true,
      isMeetEnded: false,
      videoReplayUrl: "",
      courseSummary: courseSummary || "",

    });

    await newCourse.save();
    const io = req.app.get("io");
    if (io) {
      io.emit("newPremiumCourse", {
        id: newCourse._id,
        title: newCourse.title,
        category: newCourse.category,
        price: newCourse.price,
        instructor: newCourse.instructor,
        createdAt: newCourse.createdAt,
      });
    }

    res.status(201).json({ message: "✅ Cours premium ajouté avec succès", course: newCourse });
  } catch (error) {
    console.error("❌ Erreur dans addPremiumCourse:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.updatePremiumCourse = async (req, res) => {
  try {
    const { title, category, instructor, videoReplayUrl, courseSummary } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course || !course.isPremium) {
      return res.status(404).json({ message: "Cours premium non trouvé" });
    }

    const updatedFields = {
      title,
      category,
      instructor,
      videoReplayUrl: videoReplayUrl || course.videoReplayUrl,
      courseSummary: courseSummary || course.courseSummary
    };

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    res.status(200).json({ message: "Cours premium mis à jour", course: updatedCourse });
  } catch (error) {
    console.error("Erreur update cours premium:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.markMeetEnded = async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { isMeetEnded: true, meetLink: null, isPremium: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Cours non trouvé" });
    res.status(200).json({ message: "Meet marqué comme terminé", updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

exports.updateReplayLink = async (req, res) => {
  try {
    const { videoReplayUrl } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Cours non trouvé" });
    if (!course.isPremium || !course.isMeetEnded) {
      return res.status(400).json({ message: "Le replay ne peut être ajouté que pour un cours premium terminé." });
    }
    course.videoReplayUrl = videoReplayUrl;
    await course.save();
    res.status(200).json({ message: "Replay ajouté avec succès", course });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du replay", error });
  }
};

exports.accessPremiumCourse = async (req, res) => {
  const courseId = req.params.id;
  const userId = req.body.userId;
  if (!userId || userId === "undefined") {
    return res.status(400).json({ message: "ID utilisateur invalide ou manquant." });
  }
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Cours non trouvé." });
    if (!course.isPremium) return res.status(400).json({ message: "Ce cours n'est pas premium." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    if (user.solde >= course.price) {
      user.solde -= course.price;
      await user.save();
      return res.status(200).json({
        message: "Accès autorisé",
        meetLink: course.meetLink,
        remainingBalance: user.solde
      });
    } else {
      return res.status(403).json({ message: "❌ Solde insuffisant." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.rechargeBalance = async (req, res) => {
  const userId = req.params.id;
  const { amount } = req.body;
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "Montant invalide" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    user.solde += parseFloat(amount);
    await user.save();
    res.status(200).json({ message: "✅ Recharge réussie", newBalance: user.solde });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.generateSmartQuiz = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course || !course.courseSummary || course.courseSummary.trim() === "") {
      return res.status(404).json({ message: "❌ Résumé introuvable ou vide pour ce cours." });
    }

    const prompt = `
Génère un quiz à partir de ce résumé de cours :
"${course.courseSummary}"

Réponds uniquement en format JSON valide :
[
  {
    "question": "string",
    "type": "mcq" | "boolean",
    "options": ["option1", "option2", ...],
    "correctAnswer": "string | boolean",
    "explanation": "string"
  }
]
`;

    console.log("🧠 Prompt IA :", prompt);

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const aiResponse = response.choices[0]?.message?.content;

    if (!aiResponse) {
      console.error("❌ Réponse IA vide");
      return res.status(500).json({ message: "Réponse vide de l'IA" });
    }

    console.log("📨 Réponse brute IA :", aiResponse);

    // ✅ Extraction du JSON propre
    const jsonStart = aiResponse.indexOf("[");
    const jsonEnd = aiResponse.lastIndexOf("]") + 1;
    const cleanJson = aiResponse.substring(jsonStart, jsonEnd);

    let quiz;
    try {
      quiz = JSON.parse(cleanJson);
    } catch (err) {
      console.error("❌ Échec parsing JSON nettoyé :", cleanJson);
      return res.status(500).json({
        message: "Erreur de parsing JSON après nettoyage",
        raw: aiResponse
      });
    }

    if (!Array.isArray(quiz)) {
      return res.status(500).json({
        message: "❌ La réponse IA n'est pas un tableau",
        raw: quiz
      });
    }

    // ✅ Limiter à 5 questions maximum
    const limitedQuiz = quiz.slice(0, 5);

    res.status(200).json({ quiz: limitedQuiz, total: limitedQuiz.length });
  } catch (error) {
    console.error("❌ Erreur globale IA :", error);
    res.status(500).json({ message: "Erreur serveur IA", error: error.message });
  }
};
