import React, { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import axios from "axios";
import "./TinderView.scss";

const TinderView = () => {
  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setUser(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const res = await axios.get("http://localhost:3000/publication/getAllPub");
        const others = user
          ? res.data.filter(pub => pub.user?._id !== user._id)
          : res.data;

        setOffers(others.filter(pub => pub.type === "offer"));
        setRequests(others.filter(pub => pub.type === "request"));
      } catch (error) {
        console.error("Erreur lors du chargement des publications :", error);
      }
    };

    const fetchRecommendations = async () => {
      try {
        if (user?.lastPublicationId) {
          const res = await axios.get(
            `http://localhost:3000/publication/compatibilities/${user.lastPublicationId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setRecommendations(res.data.recommendations || []);
        } else {
          console.warn("⚠️ Aucun lastPublicationId trouvé pour l'utilisateur.");
        }
      } catch (err) {
        console.error("Erreur recommandation IA :", err);
      } finally {
        setLoadingRecs(false);
      }
    };

    if (user) {
      fetchPublications();
      fetchRecommendations();
    }
  }, [user]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (user?.lastPublicationId) {
          const res = await axios.get(
            `http://localhost:3000/publication/compatibilities/${user.lastPublicationId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setRecommendations(res.data.recommendations || []);
        }
      } catch (err) {
        console.error("Erreur IA (rafraîchissement) :", err);
      }
    };

    if (user?.lastPublicationId) {
      fetchRecommendations();
    }
  }, [user?.lastPublicationId]);

  const handleMatch = async (targetUserId, pubId) => {
    try {
      const token = localStorage.getItem("token");
      if (!user || !token) return alert("Utilisateur non connecté.");

      await axios.post(
        "http://localhost:3000/match-request/send",
        {
          sender: user._id,
          receiver: targetUserId,
          publication: pubId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Invitation envoyée !");
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'invitation :", err);
      alert("❌ Impossible d'envoyer l'invitation.");
    }
  };

  const renderStack = (list, type) => (
    <div className="stack">
      <h2>{type === "offer" ? "📦 Offers" : "🆘 Requests"}</h2>
      <div className="tinder-stack">
        {list.map(pub => (
          <TinderCard
            key={pub._id}
            className="swipe"
            preventSwipe={["up", "down"]}
          >
            <div className="tinder-card">
              <h3>{pub.user?.name} {pub.user?.surname}</h3>
              <p className={`type-tag ${pub.type}`}>{pub.type.toUpperCase()}</p>
              <p className="desc">{pub.description}</p>
              <button className="match-btn" onClick={() => handleMatch(pub.user._id, pub._id)}>
                💌 Match
              </button>
            </div>
          </TinderCard>
        ))}
      </div>
    </div>
  );

 

  return (
    <div className="tinder-view">
      <h1>🔥 Tinder Skill Match</h1>
      <div className="double-stack-container">
        {renderStack(offers, "offer")}
        {renderStack(requests, "request")}
      </div>
    </div>
  );
};

export default TinderView;
