const mongoose = require("mongoose");
const { Groq } = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ExamResult = require("../models/ExamResult"); // ✅ bien importé ?
const User = require("../models/User");


exports.generateExam = async (req, res) => {
    const { category } = req.body;
  
    try {
      const prompt = `Tu es un générateur d'examen. Réponds STRICTEMENT en JSON.
  Génère 5 questions QCM pour la catégorie "${category}".
  Format attendu :
  [
    {
      "question": "...",
      "choices": ["A", "B", "C", "D"],
      "answers": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "correct": "B"
    }
  ]`;
  
      const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          { role: "user", content: prompt }
        ]
      });
  
      const content = response.choices[0].message.content;
  
      // 🔍 Extraction du tableau JSON
      const firstBracket = content.indexOf("[");
      const lastBracket = content.lastIndexOf("]") + 1;
  
      if (firstBracket === -1 || lastBracket === -1) {
        console.error("⚠️ JSON non détecté dans la réponse IA :", content);
        return res.status(500).json({ error: "Format JSON invalide depuis Groq." });
      }
  
      const jsonText = content.slice(firstBracket, lastBracket);
  
      let exam;
      try {
        exam = JSON.parse(jsonText);
      } catch (jsonErr) {
        console.error("❌ Erreur de parsing JSON :", jsonText, jsonErr);
        return res.status(500).json({ error: "Impossible d'analyser le JSON retourné par l'IA." });
      }
  
      // ✅ Envoi du JSON correct
      return res.status(200).json({ exam });
  
    } catch (err) {
      console.error("Erreur Groq IA:", err);
      return res.status(500).json({ error: "Erreur IA avec Groq." });
    }
  };
  
  exports.validateExam = async (req, res) => {
    console.log("🚀 validateExam called");
  
    const { userAnswers, exam, userId, category } = req.body;
  
    try {
      let score = 0;
      exam.forEach((q, i) => {
        const index = (i + 1).toString();
        if (userAnswers[index] === q.correct) score++;
      });
  
      const success = score >= 3;
      const certificatUrl = success ? `http://localhost:3000/certificates/${category}_${userId}.pdf` : null;
  
      const result = new ExamResult({
        userId,
        category,
        score,
        total: 5,
        certificatUrl,
      });
  
      await result.save();
      console.log("✅ Résultat d'examen sauvegardé :", result);
  
      if (success) {
        const user = await User.findById(userId);
        if (user) {
          if (!Array.isArray(user.certificates)) user.certificates = [];
  
          const alreadyHasCert = user.certificates.some(c => c.category === category);
          if (!alreadyHasCert) {
            user.certificates.push({ category, url: certificatUrl, date: new Date() });
            user.hasCertificate = true;
            await user.save();
            console.log("🏅 Utilisateur mis à jour avec certificat.");
  
            // ✅ Envoi automatique par mail du certificat PDF
            await sendSuccessCertificateEmail({
              to: user.email,
              name: user.name || "Candidat",
              category,
              score,
            });
          } else {
            console.log("ℹ️ Certificat déjà existant.");
          }
        } else {
          console.warn("⚠️ Utilisateur introuvable :", userId);
        }
      }
  
      res.status(200).json({
        success,
        score,
        message: success
          ? "✅ Examen réussi et certificat envoyé par mail !"
          : "❌ Examen non validé.",
      });
    } catch (err) {
      console.error("❌ Erreur globale :", err);
      res.status(500).json({ error: "Erreur de validation de l'examen." });
    }
  };
  
  exports.getExamResults = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID format" });
      }
  
      const exams = await ExamResult.find({
        userId: new mongoose.Types.ObjectId(userId),
      });
  
      console.log("✅ Exams found in DB for user:", exams);
  
      res.status(200).json(exams);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des examens IA:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des examens IA" });
    }
  };
  
  
  