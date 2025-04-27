const User = require("../models/User");
const axios = require("axios");

exports.recommendPartners = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      console.log(`❌ Utilisateur non trouvé pour l'ID : ${userId}`);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const currentSkills = (currentUser.certificates || []).map(c => c.category?.toLowerCase() || "");
    const currentAvailability = currentUser.availability || [];

    console.log("🧪 Compétences de l'utilisateur actuel :", currentSkills);
    console.log("🧪 Disponibilités de l'utilisateur actuel :", currentAvailability);

    // Étape 1 : Récupérer des utilisateurs GitHub
    const externalUsers = await fetchGitHubUsers();

    console.log("🧪 Utilisateurs GitHub récupérés :", externalUsers);

    if (externalUsers.length === 0) {
      console.log("⚠️ Aucun utilisateur GitHub récupéré.");
      return res.status(200).json([]);
    }

    // Étape 2 : Associer les utilisateurs GitHub
    const recommendedPartners = externalUsers
      .filter(user => {
        const hasCommonAvailability = currentAvailability.length === 0 || 
          currentAvailability.some(avail => user.availability.includes(avail));
        console.log(`🧪 Vérification des disponibilités pour ${user.name} :`, {
          userAvailability: user.availability,
          currentAvailability,
          hasCommonAvailability,
        });
        return hasCommonAvailability;
      })
      .slice(0, 3) // Limiter à 3 recommandations
      .map(user => ({
        profile: `${user.name} (GitHub)`,
        reason: `Compétences : ${user.skills.join(", ")} | Disponibilité : ${user.availability.join(", ")}`,
        email: user.email,
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
      console.log("❌ Jeton GitHub manquant dans les variables d'environnement");
      throw new Error("Jeton GitHub manquant dans les variables d'environnement");
    }

    console.log("🧪 Token GitHub utilisé :", process.env.GITHUB_API_TOKEN);
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
        console.log(`🧪 Traitement de l'utilisateur ${user.login}...`);

        // Étape 1 : Récupérer l'e-mail public depuis le profil
        let email = null;
        try {
          const userProfile = await axios.get(`https://api.github.com/users/${user.login}`, {
            headers: {
              Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
            },
          });
          console.log(`🧪 Profil de ${user.login} récupéré :`, userProfile.data);
          if (userProfile.data.email) {
            email = userProfile.data.email;
            console.log(`🧪 E-mail trouvé dans le profil de ${user.login} :`, email);
          }
        } catch (profileError) {
          console.error(`❌ Erreur lors de la récupération du profil de ${user.login} :`, profileError.message);
        }

        // Étape 2 : Si pas d'e-mail public, tenter de récupérer l'e-mail via un commit
        let reposResponse;
        if (!email) {
          console.log(`🧪 Récupération des dépôts pour l'utilisateur ${user.login}...`);
          try {
            reposResponse = await axios.get(`https://api.github.com/users/${user.login}/repos`, {
              headers: {
                Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
              },
            });
            console.log(`🧪 Dépôts pour ${user.login} :`, reposResponse.data);
          } catch (reposError) {
            console.error(`❌ Erreur lors de la récupération des dépôts de ${user.login} :`, reposError.message);
            reposResponse = { data: [] }; // Définir une valeur par défaut pour éviter une erreur
          }

          // Chercher un commit dans le premier dépôt non vide
          for (const repo of reposResponse.data) {
            console.log(`🧪 Récupération des commits pour le dépôt ${repo.name}...`);
            try {
              const commitsResponse = await axios.get(
                `https://api.github.com/repos/${user.login}/${repo.name}/commits`,
                {
                  headers: {
                    Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                  },
                }
              );

              if (commitsResponse.data.length > 0) {
                const commit = commitsResponse.data[0];
                email = commit.commit.author.email;
                console.log(`🧪 E-mail trouvé dans un commit de ${user.login} :`, email);
                if (email && email.includes("users.noreply.github.com")) {
                  email = null;
                  console.log(`🧪 E-mail masqué pour ${user.login}, ignoré.`);
                }
                break;
              }
            } catch (commitError) {
              console.error(`❌ Erreur lors de la récupération des commits du dépôt ${repo.name} :`, commitError.message);
            }
          }
        }

        // Récupérer les compétences (langages) à partir des dépôts
        const skills = reposResponse
          ? [...new Set(reposResponse.data.map(repo => repo.language).filter(lang => lang != null))]
          : [];

        return {
          name: user.login,
          platform: "GitHub",
          skills: skills.length > 0 ? skills : ["Inconnu"],
          availability: ["Lundi", "Mercredi"],
          email: email || "Non disponible",
        };
      })
    );

    console.log("🧪 Utilisateurs GitHub traités avec succès :", usersWithDetails);
    return usersWithDetails;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des utilisateurs GitHub :", error.message);
    if (error.response) {
      console.error("❌ Détails de l'erreur API GitHub :", error.response.data);
      console.error("❌ Statut de l'erreur :", error.response.status);
    }
    return [];
  }
}