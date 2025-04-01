    import React, { useEffect, useState } from "react";
    import { useNavigate } from "react-router-dom";
    import './ManageProfile.scss';
    import { FaCheckCircle,FaWallet } from "react-icons/fa";
    import { FaFacebookMessenger } from 'react-icons/fa';  // Icône Messenger
    import { motion, AnimatePresence } from "framer-motion";
    import { GiTwoCoins } from "react-icons/gi";

    const ManageProfile = () => {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);
        const [isImageModalOpen, setIsImageModalOpen] = useState(false);
        const [isWalletOpen, setIsWalletOpen] = useState(false);

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
      const handleMessengerClick = () => {
        navigate("/messenger");  // Redirige vers le composant Messenger
    };
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

<h2>
  <span style={{ color: "black" }}>
    {user.name} {user.surname}
  </span>
  {user.role === "client_approuve" && (
    <FaCheckCircle style={{ color: "#1DA1F2", marginLeft: "8px" }} />
  )}
</h2>
                    <p>Email : {user.email}</p>
                    <p>Skill : {user.Skill}</p>
                    
                    <p className="wallet-section" onClick={() => setIsWalletOpen(true)}>
                    Click to see your points 
                    <FaWallet size={20} color="#4d6e59" />
                </p>
                
                <AnimatePresence>
                    {isWalletOpen && (
                        <motion.div 
                            className="wallet-popup"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            onClick={() => setIsWalletOpen(false)}
                        >
                            <div className="wallet-content">
                                <GiTwoCoins size={50} color="#4d6e59" />
                                <h3>Your Balance</h3>
                                <p>{user.wallet} Points</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                    <button onClick={() => navigate("/update-profile")} className="update-btn">Modifier</button>
                    <button onClick={handleDelete} className="delete-btn">Supprimer</button>

                    {user.role !== "client_approuve" && (
                        <button onClick={handleRequestApproval} className="request-btn">
                            <FaCheckCircle style={{ marginRight: "8px" }} /> Demander l'approbation
                        </button>
                    )}

                   
                </div>

                {/* ✅ Section à droite */}
                <div className="right-section">
                <h3> <span style={{ color: "black" }}> Compétences de l'utilisateur : </span> </h3>
                    <ul>
                        {user.skills && user.skills.length > 0 ? (
                            user.skills.map((skill, index) => <li key={index}>{skill}</li>)
                        ) : (
                            <p>Aucune compétence ajoutée.</p>
                        )}
                    </ul>
                    <h3> <span style={{ color: "black" }}>Cours souhaités :</span> </h3>

                    <ul>
                        {user.courses && user.courses.length > 0 ? (
                            user.courses.map((course, index) => <li key={index}>{course}</li>)
                        ) : (
                            <p>Aucun cours souhaité ajouté.</p>
                        )}
                    </ul>

                    <div className="additional-list">
                        <h4>Liste de projets ou activités :</h4>
                        <ul>
                            {user.projects && user.projects.length > 0 ? (
                                user.projects.map((project, index) => <li key={index}>{project}</li>)
                            ) : (
                                <p>Aucun projet ajouté.</p>
                                
                            )}
                           
                        </ul>
                    </div>

                    <div className="additional-list">
                       
                             <div className="profile-container">
                             {/* Ajouter l'icône Messenger */}
                             <h4>Go to messenger to Exchange skills </h4>

                             <div className="messenger-icon" onClick={handleMessengerClick}>
                            <FaFacebookMessenger  size={30} color="#1DA1F2" />
                            
                             </div>
                             </div>                    </div>
                    
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
