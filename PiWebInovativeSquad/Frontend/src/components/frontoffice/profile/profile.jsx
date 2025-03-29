import React, { useEffect, useState } from 'react';
import './profile.scss';

const Profile = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="profile-container">
            <div className="profile-initials" onClick={toggleMenu}>
                {user?.name?.charAt(0).toUpperCase()}{user?.surname?.charAt(0).toUpperCase()}
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <p className="user-name">{user?.name} {user?.surname}</p>
                    <p className="user-email">{user?.email}</p>
                    <div className="menu-options">
                        <button onClick={onLogout} >Se déconnecter</button>
                       
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
