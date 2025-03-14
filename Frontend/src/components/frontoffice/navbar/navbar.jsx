import React, { useState, useContext } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { MdManageAccounts } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext'; // 🔹 Import du contexte du thème
import './Navbar.scss';
import AdminNavbar from '../../backoffice/Adminnavbar/adminnavbar';

const Navbar = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext); // 🔹 Utilisation du contexte du thème
    const navigate = useNavigate();

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        onLogout();
        navigate('/signin'); // Redirection après déconnexion
    };

    // Si l'utilisateur est un admin, afficher la navbar admin
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

                {user ? (
                    <>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/courses">Courses</Link></li>
                        <li><Link to="/OurPacks">Our Packs</Link></li>
                        <li><Link to="/AvisWebsite">Feedback</Link></li>
                        <li><Link to="/Full" className="overview">AI Tools</Link></li>
                        <li><Link to="/contact">Contact</Link></li>

                        {/* Bouton de bascule Light/Dark Mode */}
                        <li>
                            <button className="theme-toggle" onClick={toggleTheme}>
                                {theme === "dark" ? <FiSun /> : <FiMoon />}
                            </button>
                        </li>

                        {/* Menu utilisateur */}
                        <li>
                            <div className="user-menu">
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

                        {/* Bouton de bascule Light/Dark Mode */}
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
