import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TinderCard from "react-tinder-card";
import "./ExchangeStart.scss";
import "./TinderMatches.scss";

const ExchangeStart = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTinder, setShowTinder] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/publication/compatibilities/${user?.lastPublicationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        setMatches(data.compatibilities || []);
      } catch (error) {
        console.error("Erreur lors du chargement des compatibilités:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.lastPublicationId) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="exchange-skills-page">
      <h1 className="title">🚀 Exchange Your Skills</h1>

      <div className="card-container">
        <div className="exchange-card" onClick={() => navigate("/publication")}>
          <h2>🤝 Exchange Skills</h2>
          <p>Click to offer or request help from the community</p>
        </div>

        <div className="exchange-card" onClick={() => navigate("/tinder-view")}>
          <h2>🔥 Tinder Match</h2>
          <p>Find AI-matched collaborations</p>
        </div>

        <div className="exchange-card" onClick={() => navigate("/my-matches")}>
          <h2>💌 My Matches</h2>
          <p>View your invitations and connections</p>
        </div>
      </div>

      {showTinder && (
        <div className="tinder-matches">
          <h2>🧠 Smart Matches</h2>
          {loading ? (
            <p>Loading...</p>
          ) : matches.length === 0 ? (
            <p>No matches found yet.</p>
          ) : (
            <div className="tinder-cards-container">
              {matches.map((match) => (
                <TinderCard
                  key={match._id}
                  preventSwipe={["up", "down"]}
                  onSwipe={(dir) => console.log("Swiped", dir)}
                >
                  <div className="match-card">
                    <h3>{match.publication2.description}</h3>
                    <p>🔗 Match Score: {(match.similarityScore * 100).toFixed(1)}%</p>
                  </div>
                </TinderCard>
              ))}
            </div>
          )}

          <button onClick={() => setShowTinder(false)} className="close-tinder-btn">
            ❌ Close Tinder View
          </button>
        </div>
      )}
    </div>
  );
};

export default ExchangeStart;
