import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './ManageProfile.scss';

const ManageProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
        console.log("Données reçues du backend :", data);
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

  if (loading) return <p>Chargement des informations...</p>;

  return (
    <div className="manage-profile-container">
      {user ? (
  <div className="manage-profile-box">
    {user.image ? (
      <img 
      src={user.image.startsWith("http") ? user.image : `http://localhost:3000${user.image}`} 
      alt="Profil" 
      className="profile-image" 
    />
    
      //<img src={`http://localhost:3000/public/images/${user.image}`} alt="Profil" />

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
) : (
  <p>Impossible de charger le profil.</p>
)}

    </div>
  );
};

export default ManageProfile;
