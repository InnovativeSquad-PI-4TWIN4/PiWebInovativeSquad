// 📄 src/components/publication/TinderMatches.jsx
import React, { useState, useEffect } from "react";
import TinderCard from "react-tinder-card";
import "./TinderMatches.scss";

const TinderMatches = ({ userId, lastPublicationId }) => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/publication/compatibilities/${lastPublicationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        setMatches(data.compatibilities || []);
      } catch (error) {
        console.error("Erreur fetch compatibilités:", error);
      }
    };

    if (lastPublicationId) fetchMatches();
  }, [lastPublicationId]);

  return (
    <div className="tinder-container">
      {matches.length === 0 ? (
        <p>No matches found yet.</p>
      ) : (
        matches.map((match) => (
          <TinderCard key={match._id} className="swipe" preventSwipe={["up", "down"]}>
            <div className="card">
              <h3>{match.publication2.description}</h3>
              <p>Score: {(match.similarityScore * 100).toFixed(1)}%</p>
            </div>
          </TinderCard>
        ))
      )}
    </div>
  );
};

export default TinderMatches;
