const axios = require('axios');
const SprintPlan = require('../models/SprintPlan');

exports.generateSprintPlan = async (req, res) => {
  const { goal, deadline, projectId } = req.body;
  const userId = req.user._id;

  if (!goal || !deadline || !projectId) {
    return res.status(400).json({ error: "Objectif, deadline et projectId requis" });
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant expert en gestion de projet agile."
          },
          {
            role: "user",
            content: `Je dois réaliser cet objectif : "${goal}" avant le ${deadline}. Peux-tu me générer un plan de sprint hebdomadaire clair avec des tâches pour chaque étape ?`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content;
    console.log("✅ Plan brut généré par l'IA :\n", content);

    const steps = [];
    const matches = content.matchAll(/\*\*Sprint\s+\d+[^\n]*\n+(.*?)((?=\*\*Sprint)|$)/gs);

    for (const match of matches) {
      const tasks = match[1]
        .split(/\n+/)
        .map(line => line.replace(/^[*\-\+•✓✔️📌\s]+/, '').trim())
        .filter(Boolean);

      steps.push({
        week: `Sprint ${steps.length + 1}`,
        tasks,
      });
    }

    console.log("✅ Étapes extraites :\n", steps);

    const sprint = new SprintPlan({
      projectId,
      objective: goal,
      deadline,
      generatedBy: userId,
      steps
    });

    const saved = await sprint.save();
    console.log("✅ Sprint enregistré en BDD :", saved);

    res.status(200).json({ message: "Plan généré et sauvegardé", sprint: saved });

  } catch (err) {
    console.error("❌ Erreur IA Groq:", err.message);
    res.status(500).json({
      error: "Erreur IA Groq",
      details: err.response?.data || err.message
    });
  }
};

// Optionnel : récupérer tous les sprints
exports.getAllSprints = async (req, res) => {
  try {
    const all = await SprintPlan.find().populate("projectId generatedBy");
    res.status(200).json(all);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération SprintPlan", details: err.message });
  }
};
