import React from 'react';
import { Link } from 'react-router-dom'; // Importez Link depuis react-router-dom
import { FaEnvelope, FaPhoneAlt, FaArrowRight, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>VisShop AI</h3>
          <p>Empowering retailers with AI and computer vision solutions</p>
          <div className="social-links">
            <a 
              href="https://www.linkedin.com/company/visshop-ai/posts/?feedView=all" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="VisShop AI LinkedIn"
            >
              <FaLinkedin className="social-icon" />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <div className="contact-info">
            <p><FaEnvelope /> info@visshopai.com</p>
            <p><FaPhoneAlt /> +216 99 801 260</p>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <nav className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/retailers">For Retailers</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>

        <div className="footer-section">
          <h4>Get Started</h4>
          <p className="cta-text">"Enhance your retail performance with data-driven insights"</p>
          <Link to="/contact" className="footer-cta-button">
            Contact Us
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 VisShop AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;