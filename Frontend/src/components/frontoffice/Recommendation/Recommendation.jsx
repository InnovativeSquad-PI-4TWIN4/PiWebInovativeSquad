import React, { useEffect, useState } from "react";
import "./Recommendation.scss";

const Recommendation = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        console.log("🧪 Fetching recommendations for user:", user?._id);
        const res = await fetch(`http://localhost:3000/api/recommendation/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        console.log("🎯 Data received:", data);

        if (Array.isArray(data)) {
          setPartners(data);
        } else {
          console.warn("⚠️ Résultat inattendu :", data);
          setPartners([]);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des recommandations :", error);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRecommendations();
  }, []);

  return (
    <div className="recommendation-page">
      <h1>🤝 Partenaires d'échange recommandés</h1>
      {loading ? (
        <p>Chargement des recommandations...</p>
      ) : partners.length === 0 ? (
        <p>Aucune recommandation disponible pour le moment. Veuillez réessayer plus tard.</p>
      ) : (
        <div className="recommendation-list">
          {partners.map((partner, index) => (
            <div className="recommendation-card" key={index}>
              <h3>{partner.profile}</h3>
              <p>🧠 {partner.reason}</p>
              <p>
                📧 E-mail :{" "}
                {partner.email !== "Non disponible" ? (
                  <a href={`mailto:${partner.email}`} className="email-link">
                    {partner.email}
                  </a>
                ) : (
                  "Non disponible"
                )}
              </p>
              <a
                href={`https://github.com/${partner.profile.split(" ")[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="github-link"
              >
                Voir le profil GitHub
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendation;