import React, { useEffect, useState } from "react";
import "./MyMatches.scss";

const MyMatches = () => {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user || !user._id || !token) {
        setError("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/match-request/all/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Erreur lors du chargement des invitations");
        }

        const data = await res.json();
        console.log("✅ Match data loaded:", data); // utile pour debug
        setSent(data.sent || []);
        setReceived(data.received || []);
      } catch (err) {
        setError(err.message || "Erreur inattendue.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="my-matches-container">
      <h1>💌 My Match Invitations</h1>

      {loading ? (
        <p className="loading">⏳ Chargement...</p>
      ) : error ? (
        <p className="error-message">❌ {error}</p>
      ) : (
        <div className="match-columns">
          <div className="match-column">
            <h2>📤 Sent</h2>
            {sent.length === 0 ? (
              <p className="empty">No sent invitations.</p>
            ) : (
              sent.map((match) => (
                <div key={match._id} className="match-card">
                  <p><strong>To:</strong> {match.receiver?.name} {match.receiver?.surname}</p>
                  <p><strong>Status:</strong> {match.status}</p>
                  <p><strong>Your Publication:</strong> {match.publication?.description}</p>
                </div>
              ))
            )}
          </div>

          <div className="match-column">
            <h2>📥 Received</h2>
            {received.length === 0 ? (
              <p className="empty">No received invitations.</p>
            ) : (
              received.map((match) => (
                <div key={match._id} className="match-card">
                  <p><strong>From:</strong> {match.sender?.name} {match.sender?.surname}</p>
                  <p><strong>Status:</strong> {match.status}</p>
                  <p><strong>Their Publication:</strong> {match.publication?.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMatches;
