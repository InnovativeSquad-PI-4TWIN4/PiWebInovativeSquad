const User = require("../models/User");
const Replicate = require("replicate");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

exports.recommendPartners = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const currentSkills = (currentUser.certificates || []).map(c => c.category?.toLowerCase() || "");
    const currentAvailability = currentUser.availability || [];

    const allUsers = await User.find({
      _id: { $ne: userId },
      hasCertificate: true
    });

    if (allUsers.length === 0) {
      return res.status(200).json([]);
    }

    const othersPrompt = allUsers.map((u, index) => {
      const certs = u.certificates.map(c => c.category).join(", ");
      const avail = u.availability?.join(", ") || "Non spécifiée";
      return `Utilisateur ${index + 1} : ${u.name} ${u.surname} — Certificats : [${certs}] — Dispo : ${avail}`;
    }).join("\n");

    const prompt = `
Tu es un assistant qui génère des profils types compatibles pour une plateforme d’échange de compétences (SkillBridge).

Voici le profil de l’utilisateur actuel :
- Nom : ${currentUser.name} ${currentUser.surname}
- Certificats : ${currentSkills.join(", ")}
- Disponibilité : ${currentAvailability.join(", ") || "Non spécifiée"}

Voici les autres profils disponibles :
${othersPrompt}

Ta mission :
Suggère 3 types de profils compatibles pour une session d’échange, au format JSON strict uniquement (aucun texte autour). Critères : complémentarité des certificats + disponibilités communes.

Réponds uniquement comme ceci :

[
  {
    "profile": "string",
    "reason": "string"
  },
  {
    "profile": "string",
    "reason": "string"
  },
  {
    "profile": "string",
    "reason": "string"
  }
]
`;



    // ✅ Appel au modèle Llama 2 via Replicate
    const output = await replicate.run(
      "meta/llama-2-7b-chat",
      {
        input: {
          prompt,
          temperature: 0.7,
          max_new_tokens: 500
        }
      }
    );

    // 🧪 Vérifie et parse proprement la réponse
    const text = Array.isArray(output) ? output.join("") : output;

    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    const jsonText = text.slice(jsonStart, jsonEnd);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      return res.status(500).json({
        message: "Erreur parsing JSON IA",
        raw: text
      });
    }

    res.status(200).json(parsed);

  } catch (err) {
    console.error("❌ Erreur IA recommandation :", err);
    res.status(500).json({ message: "Erreur serveur IA", error: err.message });
  }
};
