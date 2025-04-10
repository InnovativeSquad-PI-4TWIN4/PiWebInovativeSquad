// src/components/NotificationComponent/NotificationComponent.jsx
"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Bell, MessageCircle } from "lucide-react"
import { ThemeContext } from "../../../context/ThemeContext"
import "./NotificationComponent.scss"

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:3000/chat/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.status === "SUCCESS") {
        setNotifications(response.data.notifications)
        const unread = response.data.notifications.filter((notif) => !notif.read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleNotificationClick = async (notification) => {
    try {
      // Marquer la notification comme lue
      await axios.post(
        `http://localhost:3000/chat/notifications/${notification._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      // Vérifier le type de notification en fonction du message
      if (notification.message.includes('Nouveau commentaire')) {
        // Rediriger vers la publication sans ouvrir le chat
        navigate(`/publication?id=${notification.publicationId._id}`)
      } else {
        // Pour les messages de chat, ouvrir le chat comme avant
        openChat(notification.publicationId._id, notification.senderId._id)
      }

      fetchNotifications()
    } catch (error) {
      console.error("Error handling notification:", error)
    }
  }

  const openChat = (publicationId, senderId) => {
    localStorage.setItem(
      "currentChatContext",
      JSON.stringify({ publicationId, senderId })
    )
    navigate(`/publication?id=${publicationId}&chat=true&sender=${senderId}`)
    setShowDropdown(false)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    })
  }

  const bellColor = theme === "dark" ? "#ffffff" : "#000000"

  return (
    <div className="notification-component">
      <div className="notification-icon" onClick={() => setShowDropdown(!showDropdown)}>
        <Bell size={24} color={bellColor} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <h3>Notifications</h3>
          {notifications.length === 0 ? (
            <p className="no-notifications">Aucune notification</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`notification-item ${notification.read ? "read" : "unread"}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-header">
                      <span className="sender-name">
                        {notification.senderId.name} {notification.senderId.surname}
                      </span>
                      <span className="notification-time">{formatTime(notification.createdAt)}</span>
                    </div>
                    <p className="notification-message">
                      <MessageCircle size={16} className="message-icon" />
                      {notification.message}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationComponent