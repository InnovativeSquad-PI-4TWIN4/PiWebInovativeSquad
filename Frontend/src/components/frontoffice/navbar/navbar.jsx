import React, { useState, useContext, useEffect, useRef } from 'react';
import { FaExchangeAlt, FaBell } from 'react-icons/fa';
import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { MdManageAccounts } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext';
import axios from 'axios';
import './Navbar.scss';
import AdminNavbar from '../../backoffice/Adminnavbar/adminnavbar';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const CHAT_API_URL = 'http://localhost:3000/chat';

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    onLogout();
    navigate('/signin');
  };

  // Récupérer les notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Aucun token trouvé dans localStorage');
          return;
        }

        console.log('Token envoyé:', token);

        const response = await axios.get(`${CHAT_API_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        console.log('Réponse de /notifications:', response.data);
        console.log('Notifications détaillées:', response.data.notifications);

        if (response.data.status === 'SUCCESS') {
          setNotifications(response.data.notifications);
        } else {
          console.error('Erreur dans la réponse de /notifications:', response.data.message);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des notifications:', err.response?.data || err.message);
      }
    };

    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Gérer le clic sur une notification
  const handleNotificationClick = async (notification) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${CHAT_API_URL}/notifications/${notification._id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notification._id ? { ...notif, read: true } : notif
        )
      );

      const publicationId = notification.publicationId?._id || notification.publicationId;
      navigate(`/publication?publicationId=${publicationId}`);
      setShowNotifications(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la notification:', err);
    }
  };

  // Formater le temps écoulé
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowNotifications(false);
      }
    };

    if (isOpen || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, showNotifications]);

  if (user && user.role === 'admin') {
    return <AdminNavbar user={user} onLogout={onLogout} />;
  }

  const unreadNotifications = notifications.filter((notif) => !notif.read).length;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <FaExchangeAlt className="logo-icon" />
        <span>SkillBridge</span>
      </Link>

      <ul className="navbar-links">
        <li>
          <Link to="/overview" className="overview">
            Challenges
          </Link>
        </li>

        {user ? (
          <>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/marketplace">MarketPlace</Link>
            </li>
            <li>
              <Link to="/OurPacks">Our Packs</Link>
            </li>
            <li>
              <Link to="/AvisWebsite">Feedback</Link>
            </li>
            <li>
              <Link to="/Full" className="overview">
                AI Tools
              </Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>

            {/* Icône de notification */}
            <li className="notification-icon">
              <FaBell
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-bell"
                aria-label={`Notifications, ${unreadNotifications} non lues`}
              />
              {unreadNotifications > 0 && (
                <span className="notification-badge pulse">
                  {unreadNotifications}
                </span>
              )}
              {showNotifications && (
                <div className="notification-dropdown">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(notif)}
                        style={{ cursor: 'pointer' }}
                      >
                        <p>
                          Nouveau message de{' '}
                          {notif.senderId?.name && notif.senderId?.surname
                            ? `${notif.senderId.name} ${notif.senderId.surname}`
                            : 'Utilisateur inconnu'}{' '}
                          dans la discussion de{' '}
                          {notif.publicationId?.description
                            ? `"${notif.publicationId.description}"`
                            : 'Publication inconnue'}
                        </p>
                        <span>{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                    ))
                  ) : (
                    <p>Aucune notification</p>
                  )}
                </div>
              )}
            </li>

            <li>
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? <FiSun /> : <FiMoon />}
              </button>
            </li>

            <li>
              <div className="user-menu" ref={dropdownRef}>
                <div className="user-initials" onClick={toggleDropdown}>
                  {user.name.charAt(0).toUpperCase()}
                  {user.surname.charAt(0).toUpperCase()}
                </div>

                {isOpen && (
                  <div className="dropdown-menu">
                    <div className="user-info">
                      <div className="user-initials-lg">
                        {user.name.charAt(0).toUpperCase()}
                        {user.surname.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <p className="user-name">
                          {user.name} {user.surname}
                        </p>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>

                    <div className="menu-links">
                      <div
                        className="menu-item"
                        onClick={() => navigate('/manage-profile')}
                      >
                        <MdManageAccounts className="menu-icon" />
                        Manage Profile
                      </div>
                      <div className="menu-item" onClick={handleLogout}>
                        <FiLogOut className="menu-icon logout-icon" />
                        Log out
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/signin">Sign In</Link>
            </li>
            <li>
              <Link to="/signup" className="signup-btn">
                Sign Up
              </Link>
            </li>
            <li>
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? <FiSun /> : <FiMoon />}
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;