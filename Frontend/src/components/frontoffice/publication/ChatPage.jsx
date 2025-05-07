import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './ChatPage.scss';

const ChatPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiverId, setReceiverId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  // 🔄 Charger les messages et identifier le receiver
  useEffect(() => {
    const fetchMessagesAndReceiver = async () => {
      try {
        const [messagesRes, chatRes] = await Promise.all([
          fetch(`http://localhost:3000/api/match-chat/messages/${chatId}`),
          fetch(`http://localhost:3000/api/match-chat/${chatId}`),
        ]);

        const messagesData = await messagesRes.json();
        const chatData = await chatRes.json();

        console.log("🧠 chatData:", chatData);

        if (!chatData || !chatData.participants || chatData.participants.length === 0) {
          console.warn("❌ Participants introuvables ou vide.");
          return;
        }

        setMessages(messagesData);

        const otherUser = chatData.participants.find((p) => p._id !== userId);
        setReceiverId(otherUser?._id);
      } catch (error) {
        console.error("Erreur lors du chargement du chat :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessagesAndReceiver();
  }, [chatId, userId]);

  // ✅ Envoyer message texte
  const sendMessage = async () => {
    if (!newMessage.trim() || !receiverId) return;
 
    try {
      const res = await fetch("http://localhost:3000/api/match-chat/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: chatId,
          sender: userId,
          receiver: receiverId,
          content: newMessage,
        }),
      });
 
      const data = await res.json();
 
      // ✅ Ajoute manuellement le senderName pour affichage immédiat
      data.senderName = `${user.name} ${user.surname}`;
 
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };
 
  // ✅ Envoyer un vocal
  const sendAudioMessage = async () => {
    if (!audioFile || !receiverId) return;
 
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("conversationId", chatId);
    formData.append("sender", userId);
    formData.append("receiver", receiverId);
 
    try {
      const res = await fetch("http://localhost:3000/api/match-chat/message/audio", {
        method: "POST",
        body: formData,
      });
 
      const data = await res.json();
 
      // ✅ Ajouter le nom de l'expéditeur localement
      data.senderName = `${user.name} ${user.surname}`;
 
      setMessages((prev) => [...prev, data]);
      setAudioFile(null);
    } catch (err) {
      console.error("Erreur envoi vocal:", err);
    }
  };
 

  return (
    <div className="chat-container">
      <h2>💬 Espace de discussion</h2>

      <div className="chat-box">
        {loading ? (
          <p>Chargement des messages...</p>
        ) : (
          messages.length === 0 ? (
            <p>Pas encore de messages.</p>
          ) : (
            messages.map((msg, index) => (
                <div
                key={index}
                className={`message ${msg.sender === userId ? "sender" : ""}`}>
             
                <strong>{msg.senderName || "Utilisateur inconnu"}</strong> :
                {msg.content ? (
                  <span> {msg.content}</span>
                ) : msg.audioUrl ? (
                  <div>
                    <audio controls src={`http://localhost:3000${msg.audioUrl}`} />
                  </div>
                ) : null}
              </div>
            ))
          )
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Envoyer</button>
      </div>
      <div className="video-section">
        <h4>🎥 Lien visio privé (Jitsi intégré)</h4>
        <a
          href={`https://meet.jit.si/skillbridge-room-${chatId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Rejoindre la visio
        </a>
      </div>
    </div>
  );
};

export default ChatPage;