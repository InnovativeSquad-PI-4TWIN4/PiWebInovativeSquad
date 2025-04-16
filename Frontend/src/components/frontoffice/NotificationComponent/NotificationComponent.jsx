"use client"

import { useState, useEffect, useContext, useRef } from "react"
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
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!token) {
      console.error("No token found. User might not be logged in.");
      return;
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:3000/chat/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Fetched notifications:", response.data);

      if (response.data.status === "SUCCESS") {
        setNotifications(response.data.notifications || [])
        const unread = response.data.notifications?.filter((notif) => !notif.read).length || 0
        setUnreadCount(unread)
      } else {
        console.error("Failed to fetch notifications:", response.data.message);
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error.message, error);
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const handleNotificationClick = async (notification) => {
    try {
      // Validate notification object
      if (!notification || !notification._id) {
        throw new Error("Notification object is invalid or missing _id")
      }

      // Mark notification as read
      await axios.post(
        `http://localhost:3000/chat/notifications/${notification._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      // Check notification type and redirect
      if (notification.message && (notification.message.includes('Nouveau commentaire') || notification.message.includes('a répondu à votre commentaire'))) {
        if (notification.publicationId && notification.publicationId._id) {
          console.log(`Navigating to publication with ID: ${notification.publicationId._id}`);
          navigate(`/publication?id=${notification.publicationId._id}&scrollToPublication=true`)
        } else {
          console.error("Publication ID is missing in the notification:", notification);
          navigate("/publication") // Fallback to publications list
        }
      } else {
        // For chat messages, open chat
        if (notification.publicationId && notification.publicationId._id && notification.senderId && notification.senderId._id) {
          console.log(`Opening chat for publication ID: ${notification.publicationId._id}, sender ID: ${notification.senderId._id}`);
          openChat(notification.publicationId._id, notification.senderId._id)
        } else {
          console.error("Publication ID or Sender ID is missing for chat notification:", notification);
          navigate("/publication") // Fallback to publications list
        }
      }

      // Refresh notifications
      fetchNotifications()
    } catch (error) {
      console.error("Erreur lors du traitement de la notification:", error.message, error);
      navigate("/publication") // Fallback on error
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
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    }
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
  }

  const getNotificationMessage = (notification) => {
    if (notification.message.includes('Nouveau commentaire')) {
      return `${notification.senderId.name} a commenté une publication`
    } else if (notification.message.includes('a répondu à votre commentaire')) {
      return `${notification.senderId.name} a répondu à votre commentaire`
    } else {
      return `${notification.senderId.name} vous a envoyé un message`
    }
  }

  const bellColor = theme === "dark" ? "#ffffff" : "#000000"

  return (
    <div className="notification-component" ref={dropdownRef}>
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
                  <div className="notification-avatar">
                    {notification.senderId.avatar ? (
                      <img
                        src={notification.senderId.avatar}
                        alt="Avatar"
                        className="avatar-image"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {notification.senderId.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <span className="sender-name">
                        {notification.senderId.name} {notification.senderId.surname}
                      </span>
                      <span className="notification-time">{formatTime(notification.createdAt)}</span>
                    </div>
                    <p className="notification-message">
                      <MessageCircle size={16} className="message-icon" />
                      {getNotificationMessage(notification)}
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