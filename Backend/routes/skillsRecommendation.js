const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

require('dotenv').config();

// ✅ Initialiser OpenAI avec OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1', 
});

// ✅ POST route pour générer les skills recommandés
router.post('/recommend-skills', async (req, res) => {
  try {
    const selectedSkills = req.body.selectedSkills || [];

    const prompt = `
Tu es un assistant IA. 
À partir des compétences suivantes sélectionnées par un utilisateur : [${selectedSkills.join(', ')}], 
propose 5 compétences supplémentaires utiles, sous forme d'un JSON propre uniquement.

Format attendu : 
{
  "skillsRecommended": ["Compétence1", "Compétence2", "Compétence3", "Compétence4", "Compétence5"]
}

Réponds uniquement avec le JSON valide, sans explication ni markdown ni commentaires.
`;

    const response = await openai.chat.completions.create({
      model: 'mistralai/mistral-7b-instruct',  // ✅ modèle valide OpenRouter
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    let text = response.choices[0]?.message?.content?.trim() || "";

    if (text.startsWith("```")) {
      text = text.replace(/^```(\w+)?/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(text);

    res.status(200).json(parsed);
  } catch (error) {
    console.error("Erreur recommandation skills:", error);
    res.status(500).json({ error: error?.error || error.message });
  }
});

module.exports = router;
