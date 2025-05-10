import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./MyMatches.scss";

const MyMatches = () => {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const socketRef = useRef(null);

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

      if (!res.ok) throw new Error("Échec de la récupération des invitations.");
      const data = await res.json();

      setSent(data.sent || []);
      setReceived(data.received || []);
    } catch (err) {
      setError(err.message || "Erreur inattendue.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  
    if (user && token && !socketRef.current) {
      const newSocket = io("http://localhost:3000", {
        query: { userId: user._id },
        transports: ["websocket"],
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });
  
      socketRef.current = newSocket;
  
      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        newSocket.emit("join", user._id);
      });
  
      newSocket.on("connect_error", (err) => {
        console.error("❌ Socket error:", err.message);
      });
  
      newSocket.on("match-updated", (updatedMatch) => {
        console.log("📩 Match updated:", updatedMatch);
      
        // ✅ Ajout important : met à jour les données quand la room est créée
        if (updatedMatch.status === "accepted" && updatedMatch.roomId) {
          fetchMatches();
        }
      });
      
    }
  
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id]);
  
  const handleDecision = async (matchId, decision) => {
    try {
      const res = await fetch(`http://localhost:3000/match-request/${decision}/${matchId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut du match.");
      const responseData = await res.json();
      const updatedMatch = responseData.match;
      const roomId = updatedMatch?.roomId;
  
      if (decision === "accept") {
        setReceived((prev) => prev.map((m) => m._id === matchId ? updatedMatch : m));
        setSent((prev) => {
          const exists = prev.some(m => m._id === matchId);
          return exists ? prev.map((m) => m._id === matchId ? updatedMatch : m) : [...prev, updatedMatch];
        });
      
        const user1Id = updatedMatch.sender?._id || updatedMatch.sender;
        const user2Id = updatedMatch.receiver?._id || updatedMatch.receiver;
      
        if (socketRef.current && user1Id !== user2Id) {
          socketRef.current.emit("match-updated", {
            matchId,
            status: "accepted",
            roomId,
            senderId: user1Id,
            receiverId: user2Id,
          });
        }
  
       // 👇 Ajout crucial : re-fetch pour rafraîchir le vrai roomId depuis backend
  await fetchMatches();

  navigate(`/match-room/${roomId}`);
} else {
        setReceived((prev) => prev.filter((m) => m._id !== matchId));
  
        const senderId = updatedMatch.sender?._id || updatedMatch.sender;
        const receiverId = updatedMatch.receiver?._id || updatedMatch.receiver;
  
        if (socketRef.current && senderId !== receiverId) {
          socketRef.current.emit("match-updated", {
            matchId,
            status: "rejected",
            senderId,
            receiverId,
          });
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };
  

  const handleJoinRoom = (roomId) => {
    navigate(`/match-room/${roomId}`);
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
                  ) : match.status === "accepted" && match.roomId ? (
                    <div className="contact-button">
                      <button onClick={() => handleJoinRoom(match.roomId)} className="join-room-btn">
                        🚪 Rejoindre la Room
                      </button>
                    </div>
                  ) : (
                    <p className="waiting-note">⏳ Room en cours de création...</p>
                  )}
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
                  ) : match.status === "accepted" && match.roomId ? (
                    <div className="contact-button">
                      <button onClick={() => handleJoinRoom(match.roomId)} className="join-room-btn">
                        🚪 Rejoindre la Room
                      </button>
                    </div>
                  ) : (
                    <p className="waiting-note">⏳ Room en cours de création...</p>
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
