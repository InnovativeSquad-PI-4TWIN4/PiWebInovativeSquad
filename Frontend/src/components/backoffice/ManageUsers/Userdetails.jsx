import React from "react";
import './UserDetails.scss';

const UserDetails = ({ user, onClose }) => {
  return (
    <div className="user-details-container">
      <div className="user-details-modal">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>X</button>
          <h2>Détails de l'utilisateur</h2>
        </div>

        <div className="modal-body">
          <img
            src={user.image ? `http://localhost:3000${user.image}` : "/path/to/default-image.jpg"}
            alt="Profil"
            className="profile-image"
          />

          <div className="details">
            <p><strong>Nom:</strong> {user.name} {user.surname}</p>
            <p><strong>Email:</strong> {user.email || "Email non disponible"}</p>
            <p><strong>Statut:</strong> {user.isActive ? "Actif" : "Inactif"}</p>
            <p><strong>Date de naissance:</strong> {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Non renseignée"}</p>
            <p><strong>Compétence:</strong> {user.Skill || "Non spécifiée"}</p>
            <p><strong>Rôle:</strong> {user.role}</p>
            <p><strong>Vérifié:</strong> {user.verified ? "Oui" : "Non"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
