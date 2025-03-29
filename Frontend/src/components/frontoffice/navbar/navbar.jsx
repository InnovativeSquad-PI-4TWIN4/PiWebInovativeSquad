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
    const dropdownRef = useRef(null); // Créer une référence pour le menu déroulant

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        onLogout();
        navigate('/signin');
    };

    // Gérer le clic à l'extérieur pour fermer le menu déroulant
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false); // Fermer le menu si le clic est à l'extérieur
            }
        };

        // Ajouter un écouteur d'événements au document
        document.addEventListener('mousedown', handleClickOutside);

        // Nettoyer l'écouteur d'événements lors du démontage du composant
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // Tableau de dépendances vide : cela s'exécute une fois au montage et se nettoie au démontage

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
                        <li><Link to="/marketplace">MarketPlace</Link></li>
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
                                    <div className="dropdown-menu" ref={dropdownRef}>
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
                                                Gérer le profil
                                            </div>

                                            <div className="menu-item" onClick={handleLogout}>
                                                <FiLogOut className="menu-icon logout-icon" />
                                                Se déconnecter
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/signin">Se connecter</Link></li>
                        <li><Link to="/signup" className="signup-btn">S'inscrire</Link></li>

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