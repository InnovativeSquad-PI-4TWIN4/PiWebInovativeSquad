const { Groq } = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    const { userAnswers, exam } = req.body; // { "1": "A", "2": "B", ... }
  
    try {
      let score = 0;
  
      exam.forEach((q, i) => {
        const index = (i + 1).toString();
        if (userAnswers[index] === q.correct) score++;
      });
  
      const success = score >= 3; // 👈 note minimale 3/5
  
      res.status(200).json({
        success,
        score,
        message: success ? "✅ Examen réussi !" : "❌ Examen non validé."
      });
  
    } catch (err) {
      console.error("Erreur validation:", err);
      res.status(500).json({ error: "Erreur de validation de l'examen." });
    }
  };
  