const { Groq } = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ExamResult = require("../models/ExamResult");
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
    const { userAnswers, exam, userId, category } = req.body;
  
    try {
      let score = 0;
  
      exam.forEach((q, i) => {
        const index = (i + 1).toString();
        if (userAnswers[index] === q.correct) score++;
      });
  
      const success = score >= 3;
  
      const certificatUrl = success
        ? `http://localhost:3000/certificates/${category}_${userId}.pdf`
        : null;
  
      // ✅ Enregistrer le résultat d'examen
      const result = new ExamResult({
        userId,
        category,
        score,
        total: 5,
        certificatUrl,
      });
      await result.save();
  
      // ✅ Si réussi, mettre à jour le user
      if (success) {
        const user = await User.findById(userId);
        if (user) {
          if (!Array.isArray(user.certificates)) {
            user.certificates = [];
          }
  
          // ❌ Vérifie s’il a déjà un certificat pour cette catégorie
          const alreadyHasCert = user.certificates.some(
            (c) => c.category === category
          );
  
          if (!alreadyHasCert) {
            user.certificates.push({
              category,
              url: certificatUrl,
              date: new Date(),
            });
  
            // ✅ MAJ du badge uniquement s’il obtient un nouveau certificat
            user.hasCertificate = true;
            await user.save();
          }
        }
      }
  
      res.status(200).json({
        success,
        score,
        message: success
          ? "✅ Examen réussi et certificat enregistré !"
          : "❌ Examen non validé.",
      });
    } catch (err) {
      console.error("Erreur validation:", err);
      res
        .status(500)
        .json({ error: "Erreur de validation de l'examen." });
    }
  };
  
  exports.getExamResults = async (req, res) => {
    try {
      const userId = req.params.userId;
      const exams = await require("../models/ExamResult").find({ userId });
      res.status(200).json(exams);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des examens IA", error: error.message });
    }
  };
  
  
  