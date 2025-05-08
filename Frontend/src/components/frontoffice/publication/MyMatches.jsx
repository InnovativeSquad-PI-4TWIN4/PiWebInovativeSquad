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
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Erreur lors du chargement des invitations");
        }

        const data = await res.json();
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

  const handleDecision = async (matchId, decision) => {
    try {
      const res = await fetch(`http://localhost:3000/match-request/${decision}/${matchId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut du match.");

      if (decision === "accept") {
        const match = received.find((m) => m._id === matchId);
        if (!match) throw new Error("Match non trouvé en mémoire.");

        const user1 = match.sender?._id || match.sender;
        const user2 = match.receiver?._id || user._id;

        const chatRes = await fetch("http://localhost:3000/api/match-chat/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user1, user2, matchId }),
        });

        if (!chatRes.ok) throw new Error("Erreur lors de la création du chat.");
        const createdChat = await chatRes.json();

        await fetch("http://localhost:3000/api/match-chat/notify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchId }),
        });

        setReceived((prev) =>
          prev.map((m) =>
            m._id === matchId ? { ...m, status: "accepted", chatId: createdChat._id } : m
          )
        );

        setSent((prev) =>
          prev.map((m) =>
            m._id === matchId ? { ...m, status: "accepted", chatId: createdChat._id } : m
          )
        );
      } else {
        setReceived((prev) => prev.filter((m) => m._id !== matchId));
      }
    } catch (err) {
      alert(err.message);
    }
  };

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
                  {match.status === "pending" ? (
                    <p className="waiting-note">⌛ Awaiting their response...</p>
                  ) : match.status === "accepted" && match.chatId ? (
                    <div className="contact-button">
                      <a href={`/chat/${match.chatId}`} className="contact-link">💬 Contacter</a>
                    </div>
                  ) : null}
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
                  {match.status === "pending" ? (
                    <div className="action-buttons">
                      <button className="accept-btn" onClick={() => handleDecision(match._id, "accept")}>
                        ✅ Accept
                      </button>
                      <button className="reject-btn" onClick={() => handleDecision(match._id, "reject")}>
                        ❌ Reject
                      </button>
                    </div>
                  ) : match.status === "accepted" && match.chatId ? (
                    <div className="contact-button">
                      <a href={`/chat/${match.chatId}`} className="contact-link">💬 Contacter</a>
                    </div>
                  ) : (
                    <p className="waiting-note">⏳ Chat en cours de création...</p>
                  )}
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