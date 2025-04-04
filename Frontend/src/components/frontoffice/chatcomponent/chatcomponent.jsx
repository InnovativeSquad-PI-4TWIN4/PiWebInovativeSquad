import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaPaperclip, FaSmile } from 'react-icons/fa'; // Ajout des icônes
import EmojiPicker from 'emoji-picker-react'; // Import de la bibliothèque d'emojis
import './ChatComponent.scss';

const ChatComponent = ({ publication, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // État pour afficher/masquer le sélecteur d'emojis
  const CHAT_API_URL = 'http://localhost:3000/chat';

  // Suggestions de messages
  const messageSuggestions = ['Hello!', 'I need help with design', 'Can you assist me?', 'Thanks!'];

  // Charger les messages initiaux
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Aucun token d\'authentification trouvé.');
          return;
        }
        const response = await axios.post(
          `${CHAT_API_URL}/create`,
          {
            user1: currentUser._id,
            user2: publication.user._id,
            publicationId: publication._id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(response.data.messages || []);
      } catch (err) {
        console.error('Erreur lors de l\'initialisation du chat:', err.response ? err.response.data : err.message);
      }
    };

    if (publication && currentUser) {
      fetchMessages();
    }
  }, [publication, currentUser]);

  // Gérer l'envoi d'un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${CHAT_API_URL}/send/${publication._id}`,
        {
          senderId: currentUser._id,
          receiverId: publication.user._id,
          content: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [...prev, response.data.message]);
      setNewMessage('');
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err.response ? err.response.data : err.message);
      alert('Erreur lors de l\'envoi du message. Vérifiez la console pour plus de détails.');
    }
  };

  // Gérer le clic sur une suggestion
  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion);
  };

  // Gérer le clic sur un emoji
  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false); // Masquer le sélecteur après avoir choisi un emoji
  };

  // Gérer le téléchargement de fichier
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', currentUser._id);
    formData.append('receiverId', publication.user._id);
    formData.append('publicationId', publication._id);

    console.log('Données envoyées pour upload:', {
      senderId: currentUser._id,
      receiverId: publication.user._id,
      publicationId: publication._id,
      fileName: file.name,
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${CHAT_API_URL}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Réponse du serveur:', response.data);
      setMessages((prev) => [...prev, response.data.message]);
    } catch (err) {
      console.error('Erreur détaillée lors de l\'upload:', err.response ? err.response.data : err.message);
      alert('Erreur lors de l\'envoi du fichier. Vérifiez la console pour plus de détails.');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        <div className="chat-header">
          <h3>Chat avec {publication.user.name} {publication.user.surname}</h3>
          <button onClick={onClose}>Fermer</button>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.senderId === currentUser._id ? 'sent' : 'received'}`}
            >
              <p>{msg.content}</p>
              <span>{formatTime(msg.createdAt)}</span>
            </div>
          ))}
        </div>
        <div className="chat-suggestions">
          {messageSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-btn"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="chat-input">
          <div className="input-wrapper">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
            />
            <div className="input-actions">
              <label className="file-upload">
                <FaPaperclip />
                <input
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                type="button"
                className="emoji-btn"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                <FaSmile />
              </button>
              <button type="submit" disabled={!newMessage.trim()}>
                <FaPaperPlane />
              </button>
            </div>
          </div>
          {showEmojiPicker && (
            <div className="emoji-picker">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;