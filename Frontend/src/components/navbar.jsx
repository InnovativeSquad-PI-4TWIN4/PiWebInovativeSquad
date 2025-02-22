import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/Navbar.scss';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <FaExchangeAlt className="logo-icon" />
        <span>SkillSwap</span>
      </Link>
      <ul className="navbar-links">
        <li>
          <Link to="/courses">Courses</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
        <li>
          <Link to="/signin">Sign In</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;