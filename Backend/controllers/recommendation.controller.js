const User = require("../models/User");
const axios = require("axios");

exports.recommendPartners = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const currentSkills = (currentUser.certificates || []).map(c => c.category?.toLowerCase() || "");
    const currentAvailability = currentUser.availability || [];

    console.log("🧪 Compétences de l'utilisateur actuel :", currentSkills);
    console.log("🧪 Disponibilités de l'utilisateur actuel :", currentAvailability);

    // Étape 1 : Récupérer des utilisateurs GitHub
    const externalUsers = await fetchGitHubUsers();

    console.log("🧪 Utilisateurs GitHub récupérés :", externalUsers);

    if (externalUsers.length === 0) {
      return res.status(200).json([]);
    }

    // Étape 2 : Associer les utilisateurs GitHub (sans filtrage strict sur les compétences)
    const recommendedPartners = externalUsers
      .filter(user => {
        // Vérifier les disponibilités communes (si currentAvailability est vide, accepter tous les utilisateurs)
        const hasCommonAvailability = currentAvailability.length === 0 || 
          currentAvailability.some(avail => user.availability.includes(avail));
        return hasCommonAvailability;
      })
      .slice(0, 3) // Limiter à 3 recommandations
      .map(user => ({
        profile: `${user.name} (GitHub)`,
        reason: `Compétences : ${user.skills.join(", ")} | Disponibilité : ${user.availability.join(", ")}`
      }));

    console.log("🧪 Partenaires recommandés après filtrage :", recommendedPartners);

    res.status(200).json(recommendedPartners);
  } catch (err) {
    console.error("❌ Erreur lors de la recommandation :", err.message);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Fonction pour récupérer les utilisateurs GitHub
async function fetchGitHubUsers() {
  try {
    if (!process.env.GITHUB_API_TOKEN) {
      throw new Error("Jeton GitHub manquant dans les variables d'environnement");
    }

    console.log("🧪 Appel à l'API GitHub pour récupérer les utilisateurs...");

    const response = await axios.get("https://api.github.com/users?per_page=10", {
      headers: {
        Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    console.log("🧪 Réponse de l'API GitHub (utilisateurs) :", response.data);

    const usersWithDetails = await Promise.all(
      response.data.map(async (user) => {
        console.log(`🧪 Récupération des dépôts pour l'utilisateur ${user.login}...`);
        const reposResponse = await axios.get(`https://api.github.com/users/${user.login}/repos`, {
          headers: {
            Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        console.log(`🧪 Dépôts pour ${user.login} :`, reposResponse.data);

        const skills = [...new Set(
          reposResponse.data
            .map(repo => repo.language)
            .filter(lang => lang)
        )];

        return {
          name: user.login,
          platform: "GitHub",
          skills: skills.length > 0 ? skills : ["Inconnu"],
          availability: ["Lundi", "Mercredi"],
        };
      })
    );

    return usersWithDetails;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des utilisateurs GitHub :", error.message);
    if (error.response) {
      console.error("❌ Détails de l'erreur API GitHub :", error.response.data);
    }
    return [];
  }
}