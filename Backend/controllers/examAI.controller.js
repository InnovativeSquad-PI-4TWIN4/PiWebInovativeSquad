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

    // 🧠 Nettoie la réponse pour trouver le JSON seulement
    const firstBracket = content.indexOf("[");
    const lastBracket = content.lastIndexOf("]") + 1;
    const jsonText = content.slice(firstBracket, lastBracket);

    const exam = JSON.parse(jsonText); // ✅ now clean JSON
    res.status(200).json({ exam });

  } catch (err) {
    console.error("Erreur Groq IA:", err);
    res.status(500).json({ error: "Erreur IA avec Groq." });
  }
};
