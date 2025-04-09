"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { FaPaperPlane, FaPaperclip, FaSmile } from "react-icons/fa"
import EmojiPicker from "emoji-picker-react"
import "./chatcomponent.scss"

const ChatComponent = ({ publication, currentUser, selectedSender, onClose }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const CHAT_API_URL = "http://localhost:3000/chat"

  // Suggestions de messages
  const messageSuggestions = ["Hello!", "I need help with design", "Can you assist me?", "Thanks!"]

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Charger les messages initiaux
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Aucun token d'authentification trouvé.")
          setError("Aucun token d'authentification trouvé.")
          setLoading(false)
          return
        }

        console.log("ChatComponent - Initialisation du chat avec:", {
          currentUser: currentUser?._id,
          selectedSender: selectedSender?._id,
          publication: publication?._id,
        })

        // First create/get the chat
        const createResponse = await axios.post(
          `${CHAT_API_URL}/create`,
          {
            user1: currentUser._id,
            user2: selectedSender._id,
            publicationId: publication._id,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        console.log("Réponse de création/récupération du chat:", createResponse.data)

        // Vérifier si la réponse contient déjà des messages
        if (createResponse.data && createResponse.data.messages) {
          console.log("Messages récupérés depuis la création du chat:", createResponse.data.messages)
          setMessages(createResponse.data.messages || [])
          setLoading(false)
        } else {
          // Sinon, essayer de récupérer les messages via l'endpoint getMessages
          try {
            const messagesResponse = await axios.get(`${CHAT_API_URL}/getMessages/${publication._id}`, {
              headers: { Authorization: `Bearer ${token}` },
              params: {
                user1: currentUser._id,
                user2: selectedSender._id,
              },
            })

            console.log("Messages récupérés via getMessages:", messagesResponse.data)
            setMessages(messagesResponse.data.messages || [])
          } catch (messagesError) {
            console.error("Erreur lors de la récupération des messages:", messagesError)
            // Si l'endpoint getMessages échoue, utiliser un tableau vide
            setMessages([])
          }
          setLoading(false)
        }

        // Mark related notifications as read
        markRelatedNotificationsAsRead()
      } catch (err) {
        console.error("Erreur lors de l'initialisation du chat:", err.response ? err.response.data : err.message)
        setError("Erreur lors de l'initialisation du chat. Veuillez réessayer.")
        setLoading(false)
      }
    }

    if (publication && currentUser && selectedSender) {
      fetchMessages()
    } else {
      console.error("Impossible d'initialiser le chat, données manquantes:", {
        publication: !!publication,
        currentUser: !!currentUser,
        selectedSender: !!selectedSender,
      })
      setError("Données manquantes pour initialiser le chat.")
      setLoading(false)
    }
  }, [publication, currentUser, selectedSender])

  // Mark notifications related to this chat as read
  const markRelatedNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${CHAT_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.status === "SUCCESS") {
        const notifications = response.data.notifications

        // Find notifications related to this publication and sender
        const relatedNotifications = notifications.filter(
          (notif) =>
            notif.publicationId._id === publication._id && notif.senderId._id === selectedSender._id && !notif.read,
        )

        console.log("Notifications liées à ce chat:", relatedNotifications.length)

        // Mark each notification as read
        for (const notif of relatedNotifications) {
          await axios.post(
            `${CHAT_API_URL}/notifications/${notif._id}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          )
        }
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  // Gérer l'envoi d'un message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${CHAT_API_URL}/send/${publication._id}`,
        {
          senderId: currentUser._id,
          receiverId: selectedSender._id,
          content: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setMessages((prev) => [...prev, response.data.message])
      setNewMessage("")
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err.response ? err.response.data : err.message)
      alert("Erreur lors de l'envoi du message. Vérifiez la console pour plus de détails.")
    }
  }

  // Gérer le clic sur une suggestion
  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion)
  }

  // Gérer le clic sur un emoji
  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji)
    setShowEmojiPicker(false)
  }

  // Gérer le téléchargement de fichier
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("senderId", currentUser._id)
    formData.append("receiverId", selectedSender._id)
    formData.append("publicationId", publication._id)

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(`${CHAT_API_URL}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setMessages((prev) => [...prev, response.data.message])
    } catch (err) {
      console.error("Erreur détaillée lors de l'upload:", err.response ? err.response.data : err.message)
      alert("Erreur lors de l'envoi du fichier. Vérifiez la console pour plus de détails.")
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="chat-overlay">
        <div className="chat-container">
          <div className="chat-header">
            <h3>Chargement de la conversation...</h3>
            <button onClick={onClose}>Fermer</button>
          </div>
          <div className="chat-loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chat-overlay">
        <div className="chat-container">
          <div className="chat-header">
            <h3>Erreur</h3>
            <button onClick={onClose}>Fermer</button>
          </div>
          <div className="chat-error">
            <p>{error}</p>
            <button onClick={onClose} className="retry-btn">
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        <div className="chat-header">
          <h3>Chat avec {selectedSender ? `${selectedSender.name} ${selectedSender.surname}` : "Utilisateur"}</h3>
          <button onClick={onClose}>Fermer</button>
        </div>
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Aucun message pour le moment. Commencez la conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.senderId === currentUser._id ? "sent" : "received"}`}>
                <p>{msg.content}</p>
                <span>{formatTime(msg.createdAt)}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-suggestions">
          {messageSuggestions.map((suggestion, index) => (
            <button key={index} className="suggestion-btn" onClick={() => handleSuggestionClick(suggestion)}>
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
                <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
              </label>
              <button type="button" className="emoji-btn" onClick={() => setShowEmojiPicker((prev) => !prev)}>
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
  )
}

export default ChatComponent
