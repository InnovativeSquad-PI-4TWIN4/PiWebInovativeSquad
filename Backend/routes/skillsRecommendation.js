const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

// Configure OpenRouter AI
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// POST /api/recommend-skills
router.post('/recommend-skills', async (req, res) => {
  try {
    const { selectedSkills } = req.body;

    if (!selectedSkills || selectedSkills.length === 0) {
      return res.status(400).json({ message: "Aucune compétence fournie." });
    }

    const prompt = `
Tu es un expert du développement logiciel et web.

À partir de cette liste de compétences existantes :
[${selectedSkills.join(', ')}]

Génère une liste de 5 nouvelles compétences COMPLÉMENTAIRES qui sont uniquement des **technologies, frameworks, bibliothèques ou outils**.

Exemples valides :
["React", "Node.js", "Express", "Spring Boot", "MongoDB", "Docker", "GitLab", "Angular", "Vue.js", "AWS"]

Exemples invalides :
["Création d'applications", "Optimisation du code", "Gestion de projet"]

**Réponds uniquement** sous forme d'un tableau JSON, sans aucune explication, ni texte supplémentaire.

Format strict attendu :
[
  "Tech1",
  "Tech2",
  "Tech3",
  "Tech4",
  "Tech5"
]
`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    });

    const aiResponse = response.choices[0]?.message?.content;

    const jsonStart = aiResponse.indexOf("[");
    const jsonEnd = aiResponse.lastIndexOf("]") + 1;
    const skills = JSON.parse(aiResponse.substring(jsonStart, jsonEnd));

    if (!Array.isArray(skills)) {
      return res.status(500).json({ message: "Erreur IA : réponse non conforme." });
    }

    res.status(200).json({ recommendedSkills: skills });
  } catch (error) {
    console.error("Erreur recommandation skills:", error);
    res.status(500).json({ message: "Erreur serveur lors de la recommandation." });
  }
});

module.exports = router;
