"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Bell, MessageCircle } from "lucide-react"
import "./NotificationComponent.scss"

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
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
      console.log("Notification cliquée:", notification)

      // Mark notification as read
      await axios.post(
        `http://localhost:3000/chat/notifications/${notification._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      // Log les IDs pour débogage
      console.log("Publication ID:", notification.publicationId._id)
      console.log("Sender ID:", notification.senderId._id)

      // Open the chat with the publication and sender
      openChat(notification.publicationId._id, notification.senderId._id)

      // Update notifications list
      fetchNotifications()
    } catch (error) {
      console.error("Error handling notification:", error)
    }
  }

  const openChat = (publicationId, senderId) => {
    console.log("Ouverture du chat avec:", { publicationId, senderId })

    // Store the chat context in localStorage to retrieve it in the chat component
    localStorage.setItem(
      "currentChatContext",
      JSON.stringify({
        publicationId,
        senderId,
      }),
    )

    // Navigate to the publication page with the chat open
    navigate(`/publication?id=${publicationId}&chat=true&sender=${senderId}`)

    // Fermer le dropdown après avoir cliqué
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

  return (
    <div className="notification-component">
      <div className="notification-icon" onClick={() => setShowDropdown(!showDropdown)}>
        <Bell size={24} />
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
                      Nouveau message dans la publication "{notification.publicationId.description.substring(0, 20)}..."
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
