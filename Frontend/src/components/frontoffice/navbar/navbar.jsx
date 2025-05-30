import React, { useState, useContext, useEffect, useRef } from 'react';
import { FaExchangeAlt, FaBars } from 'react-icons/fa';
import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { MdManageAccounts } from 'react-icons/md';
import { NavLink, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext';
import NotificationComponent from "../NotificationComponent/NotificationComponent";
import './navbar.scss';
import AdminNavbar from '../../backoffice/Adminnavbar/adminnavbar';
import { MdWorkspacePremium } from "react-icons/md";
import { MdGroups } from 'react-icons/md';
import { FaFlask } from "react-icons/fa";

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [hasNewAppointment, setHasNewAppointment] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    onLogout();
    navigate('/signin');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const userStored = JSON.parse(localStorage.getItem("user"));
      if (!userStored) return;
      try {
        const res = await fetch(`http://localhost:3000/api/appointments/user/${userStored._id}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHasNewAppointment(true);
        }
      } catch (err) {
        console.error("Erreur récupération des rendez-vous:", err);
      }
    };
    if (user) fetchAppointments();
  }, [user]);

  if (user && user.role === 'admin') {
    return <AdminNavbar user={user} onLogout={onLogout} />;
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">
        <FaExchangeAlt className="logo-icon" />
        <span>SkillBridge</span>
      </NavLink>

      <button className="hamburger" onClick={toggleMenu}>
        <FaBars />
      </button>

      <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
        {user ? (
          <>
            <li><NavLink to="/" end onClick={() => setIsMenuOpen(false)}>Home</NavLink></li>
            <li><NavLink to="/marketplace" onClick={() => setIsMenuOpen(false)}>MarketPlace</NavLink></li>
            <li><NavLink to="/exchange-start" onClick={() => setIsMenuOpen(false)}>Forum</NavLink></li>
            <li><NavLink to="/OurPacks" onClick={() => setIsMenuOpen(false)}>Our Packs</NavLink></li>
            <li><NavLink to="/AvisWebsite" onClick={() => setIsMenuOpen(false)}>Feedback</NavLink></li>
            <li><NavLink to="/Full" className="overview" onClick={() => setIsMenuOpen(false)}>AI Tools</NavLink></li>
            <li><NavLink to="/Personal" className="overview" onClick={() => setIsMenuOpen(false)}>Personal Space</NavLink></li>
            
            <li>
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? <FiSun /> : <FiMoon />}
              </button>
            </li>

            <li>
              <div className="user-menu" ref={dropdownRef}>
                <div
                  className={`user-initials ${user.hasCertificate ? 'certified' : ''}`}
                  onClick={toggleDropdown}
                >
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
                        <p className="user-name">{user.name} {user.surname}</p>
                        <p className="user-email">{user.email}</p>
                        {user.hasCertificate && (
                          <p className="certified-label">🏅 Certifié SkillBridge</p>
                        )}
                      </div>
                    </div>

                    <div className="menu-links">
                      <div className="menu-item" onClick={() => { navigate('/manage-profile'); setIsOpen(false); }}>
                        <MdManageAccounts className="menu-icon" />
                        Manage Profile
                      </div>

                      <div className="menu-item" onClick={() => { navigate('/mycareer'); setIsOpen(false); }}>
                        <MdWorkspacePremium className="menu-icon" />
                        My Career
                        {hasNewAppointment && <span className="notification-dot" >🔔</span>}
                      </div>
                      <div className="menu-item" onClick={() => { navigate('/project-lab'); setIsOpen(false); }}>
                        <FaFlask className="menu-icon" />
                        Project Lab
                      </div>

                      <div className="menu-item" onClick={() => { navigate('/learning-circles'); setIsOpen(false); }}>
                        <MdGroups className="menu-icon" />
                        Learning Circles
                      </div>

                      <div className="menu-item" onClick={() => { handleLogout(); setIsOpen(false); }}>
                        <FiLogOut className="menu-icon logout-icon" />
                        Log out
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </li>

            <li className="navbar-icon">
              <div style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
                <NotificationComponent />
              </div>
            </li>
          </>
        ) : (
          <>
            <li><NavLink to="/signin" onClick={() => setIsMenuOpen(false)}>Sign In</NavLink></li>
            <li><NavLink to="/signup" className="signup-btn" onClick={() => setIsMenuOpen(false)}>Sign Up</NavLink></li>
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