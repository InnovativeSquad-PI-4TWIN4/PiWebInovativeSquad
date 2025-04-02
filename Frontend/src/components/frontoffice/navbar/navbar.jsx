import React, { useState, useContext, useEffect, useRef } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { MdManageAccounts } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext';
import './Navbar.scss';
import AdminNavbar from '../../backoffice/Adminnavbar/adminnavbar';

const Navbar = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

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

    if (user && user.role === "admin") {
        return <AdminNavbar user={user} onLogout={onLogout} />;
    }

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <FaExchangeAlt className="logo-icon" />
                <span>SkillBridge</span>
            </Link>

            <ul className="navbar-links">
                <li><Link to="/overview" className="overview">Challenges</Link></li>
                <li><Link to="/underline ">Underline</Link></li>

                {user ? (
                    <>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/marketplace">MarketPlace</Link></li>
                        <li><Link to="/OurPacks">Our Packs</Link></li>
                        <li><Link to="/AvisWebsite">Feedback</Link></li>
                        <li><Link to="/Full" className="overview">AI Tools</Link></li>
                        <li><Link to="/contact">Contact</Link></li>

                        <li>
                            <button className="theme-toggle" onClick={toggleTheme}>
                                {theme === "dark" ? <FiSun /> : <FiMoon />}
                            </button>
                        </li>

                        <li>
                            <div className="user-menu" ref={dropdownRef}>
                                <div className="user-initials" onClick={toggleDropdown}>
                                    {user.name.charAt(0).toUpperCase()}{user.surname.charAt(0).toUpperCase()}
                                </div>

                                {isOpen && (
                                    <div className="dropdown-menu">
                                        <div className="user-info">
                                            <div className="user-initials-lg">
                                                {user.name.charAt(0).toUpperCase()}{user.surname.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-details">
                                                <p className="user-name">{user.name} {user.surname}</p>
                                                <p className="user-email">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="menu-links">
                                            <div className="menu-item" onClick={() => navigate('/manage-profile')}>
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
                        <li><Link to="/signin">Sign In</Link></li>
                        <li><Link to="/signup" className="signup-btn">Sign Up</Link></li>
                        <li>
                            <button className="theme-toggle" onClick={toggleTheme}>
                                {theme === "dark" ? <FiSun /> : <FiMoon />}
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
