import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './ManageProfile.scss';

const ManageProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // État pour gérer l'affichage du modal
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du profil");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUser();
    } else {
      navigate("/login");
    }
  }, [navigate, token]);

  const handleDelete = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer votre compte ?")) {
      try {
        const response = await fetch("http://localhost:3000/users/profile", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du compte");
        }

        localStorage.removeItem("token"); // Supprimer le token
        navigate("/login"); // Rediriger vers la page de connexion
      } catch (error) {
        console.error(error.message);
      }
    }
  };

  const openImageModal = () => {
    setIsImageModalOpen(true); // Ouvre le modal
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false); // Ferme le modal
  };

  if (loading) return <p>Chargement des informations...</p>;

  return (
    <div className="manage-profile-container">
      {/* Carte de profil à gauche */}
      <div className="manage-profile-box">
        {user.image ? (
          <>
            <div className="image-light"></div>
            <img 
              src={`http://localhost:3000${user.image}`} 
              alt="Profil" 
              className="profile-image" 
              onClick={openImageModal} // Ajout de l'événement au clic
            />
          </>
        ) : (
          <div className="profile-image-placeholder">Pas d'image</div>
        )}
        <h2>{user.name} {user.surname}</h2>
        <p>Email : {user.email}</p>
        <p>Rôle : {user.role}</p>
        <p>Skill : {user.Skill}</p>

        <button onClick={() => navigate("/update-profile")} className="update-btn">Modifier</button>
        <button onClick={handleDelete} className="delete-btn">Supprimer</button>
      </div>

      {/* Section à droite */}
      <div className="right-section">
        <h3>Compétences de l'utilisateur :</h3>
        <ul>
          {user.skills && user.skills.length > 0 ? (
            user.skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))
          ) : (
            <p>Aucune compétence ajoutée.</p>
          )}
        </ul>

        <h3>Cours souhaités :</h3>
        <ul>
          {user.courses && user.courses.length > 0 ? (
            user.courses.map((course, index) => (
              <li key={index}>{course}</li>
            ))
          ) : (
            <p>Aucun cours souhaité ajouté.</p>
          )}
        </ul>

        {/* Nouvelle section : Liste additionnelle */}
        <div className="additional-list">
          <h4>Liste de projets ou activités :</h4>
          <ul>
            {user.projects && user.projects.length > 0 ? (
              user.projects.map((project, index) => (
                <li key={index}>{project}</li>
              ))
            ) : (
              <p>Aucun projet ajouté.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Modal d'image agrandie */}
      {isImageModalOpen && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content">
            <img 
              src={`http://localhost:3000${user.image}`} 
              alt="Profil Agrandi" 
              className="expanded-image" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProfile;
