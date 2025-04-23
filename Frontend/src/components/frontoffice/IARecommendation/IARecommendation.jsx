import React, { useEffect, useState } from "react";
import "./IARecommendation.scss";

const IARecommendation = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        console.log("🧪 Fetching IA recommendations for user:", user?._id);
        const res = await fetch(`http://localhost:3000/api/recommendation/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        console.log("🎯 Data received:", data);

        // ✅ Sécurité : s'assurer que data est bien un tableau
        if (Array.isArray(data)) {
          setPartners(data);
        } else {
          console.warn("⚠️ Résultat IA inattendu :", data);
          setPartners([]);
        }
      } catch (error) {
        console.error("❌ Erreur fetch recommandation :", error);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRecommendations();
  }, []);

  return (
    <div className="recommendation-page">
      <h1>🤝 Recommended Exchange Partners</h1>
      {loading ? (
        <p>Chargement des suggestions...</p>
      ) : partners.length === 0 ? (
        <p>Aucune recommandation disponible pour le moment. Veuillez réessayer plus tard.</p>
      ) : (
        <div className="recommendation-list">
          {partners.map((partner, index) => (
            <div className="recommendation-card" key={index}>
              <h3>{partner.profile}</h3>
              <p>🧠 {partner.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IARecommendation;
