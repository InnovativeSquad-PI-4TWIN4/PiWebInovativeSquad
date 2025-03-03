import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './ManageProfile.scss';

const ManageProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // ✅ Récupérer le profil utilisateur
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
              console.log("Données utilisateur récupérées :", data.user);
  
              if (data.user && data.user._id) {
                  setUser(data.user);
              } else {
                  console.error("ID utilisateur manquant");
                  alert("Erreur : L'ID de l'utilisateur est manquant.");
              }
          } catch (error) {
              console.error(error.message);
          } finally {
              setLoading(false);
          }
      };
  
      if (token) {
          fetchUser();
      } else {
          navigate("/signin");
      }
  }, [navigate, token]);

    // ✅ Suppression de l'utilisateur
    const handleDelete = async () => {
        if (!user || !user._id) {
            console.error("L'ID de l'utilisateur est manquant.");
            alert("Erreur : L'ID de l'utilisateur est manquant.");
            return;
        }

        if (window.confirm("Voulez-vous vraiment supprimer votre compte ?")) {
            try {
                console.log("Suppression en cours pour l'ID :", user._id);

                const response = await fetch(`http://localhost:3000/users/delete-profile/${user._id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Erreur lors de la suppression du compte");
                }

                console.log("Compte supprimé avec succès !");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                alert("Compte supprimé avec succès !");
                navigate("/signin");
            } catch (error) {
                console.error("Erreur de suppression :", error.message);
                alert(error.message || "Erreur lors de la suppression du compte");
            }
        }
    };

    // ✅ Ouvrir le modal d'image
    const openImageModal = () => {
        setIsImageModalOpen(true);
    };

    // ✅ Fermer le modal d'image
    const closeImageModal = () => {
        setIsImageModalOpen(false);
    };

    if (loading) return <p>Chargement des informations...</p>;

    const handleRequestApproval = async () => {
        try {
            const response = await fetch("http://localhost:3000/users/request-approval", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: user._id }),
            });
    
            if (!response.ok) {
                throw new Error("Erreur lors de la demande d'approbation");
            }
    
            alert("Votre demande a été envoyée avec succès !");
        } catch (error) {
            console.error("Erreur:", error.message);
            alert("Échec de l'envoi de la demande.");
        }
    };
    
    return (
        <div className="manage-profile-container">
            {/* ✅ Carte de profil à gauche */}
            <div className="manage-profile-box">
                {user.image ? (
                    <>
                        <div className="image-light"></div>
                        <img
                            src={`http://localhost:3000${user.image}`}
                            alt="Profil"
                            className="profile-image"
                            onClick={openImageModal}
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
                <button onClick={handleRequestApproval} className="request-btn"> Demander l'approbation</button>

            </div>

            {/* ✅ Section à droite */}
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

                {/* ✅ Liste additionnelle */}
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

            {/* ✅ Modal d'image agrandie */}
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
