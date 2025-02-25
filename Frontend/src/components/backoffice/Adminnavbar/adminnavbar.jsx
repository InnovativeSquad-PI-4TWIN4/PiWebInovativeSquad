import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserShield } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { MdManageAccounts } from 'react-icons/md';
import './AdminNavbar.scss';

const AdminNavbar = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        onLogout();
        navigate('/signin'); // Redirection après déconnexion
    };

    return (
        <nav className="admin-navbar">
            <Link to="/admin" className="navbar-logo">
                <FaUserShield className="logo-icon" />
                <span>Admin Panel</span>
            </Link>

            <ul className="navbar-links">
                <li><Link to="/admin/dashboard">Dashboard</Link></li>
                <li><Link to="/ManageUsers">Manage Users</Link></li>
                <li><Link to="/admin/settings">Settings</Link></li>
                
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

                                    <div className="menu-item logout" onClick={handleLogout}>
                                        <FiLogOut className="menu-icon logout-icon" />
                                        Log out
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </li>
            </ul>
        </nav>
    );
};

export default AdminNavbar;
