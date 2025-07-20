import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from './assets/vissh-A85wLez290C5RXWV.avif';
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/solutions', label: 'Solutions' },
    { path: '/services', label: 'Services' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo avec image */}
        <Link to="/" className="navbar-logo">
          <img 
            src={logo} 
            alt="VisShop AI Logo" 
            className="logo-image"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'fallback-logo.png'; // Prévoir un fallback
            }}
          />
        </Link>

        <div className="navbar-middle">
          <ul className="navbar-links">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-right">
          <div className="language-switcher">
            <button 
              className={`language-btn ${currentLanguage === 'EN' ? 'active' : ''}`}
              onClick={() => setCurrentLanguage('EN')}
            >
              EN
            </button>
            <span className="language-separator">|</span>
            <button 
              className={`language-btn ${currentLanguage === 'FR' ? 'active' : ''}`}
              onClick={() => setCurrentLanguage('FR')}
            >
              FR
            </button>
          </div>

          <Link to="/contact" className="cta-button">
            Book a Demo
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;