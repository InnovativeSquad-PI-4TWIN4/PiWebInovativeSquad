import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './ManageProfile.scss';
import { FaCheckCircle, FaWallet } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { GiTwoCoins } from "react-icons/gi";

const ManageProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.user && data.user._id) {
          setUser(data.user);
        } else {
          alert("Erreur : utilisateur invalide.");
        }
      } catch (error) {
        console.error("Erreur récupération :", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUser();
    else navigate("/signin");
  }, [navigate, token]);

  const handleMessengerClick = () => {
    navigate("/messenger");
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

      if (!response.ok) throw new Error("Erreur lors de la demande");
      alert("Demande envoyée !");
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Voulez-vous supprimer votre compte ?")) {
      try {
        const response = await fetch(`http://localhost:3000/users/delete-profile/${user._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erreur suppression");
        localStorage.clear();
        alert("Compte supprimé.");
        navigate("/signin");
      } catch (err) {
        alert("Erreur : " + err.message);
      }
    }
  };

  const openImageModal = () => setIsImageModalOpen(true);
  const closeImageModal = () => setIsImageModalOpen(false);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="profile-container">
      <div className="cover-banner" />
      <div className="profile-header">
        <div className="avatar">
          {user.image ? (
            <img src={`http://localhost:3000${user.image}`} alt="Profile" onClick={openImageModal} />
          ) : (
            <div className="avatar-placeholder">E</div>
          )}
        </div>

        <div className="profile-info">
          <h2>
            {user.name} {user.surname}
            {user.role === "client_approuve" && <FaCheckCircle className="verified" />}
          </h2>
          <p>@{user.username || user.email?.split("@")[0]}</p>
          <p className="wallet-btn" onClick={() => setIsWalletOpen(true)}>
            <FaWallet /> {user.wallet} points
          </p>

          <div className="btn-row">
            <button onClick={() => navigate("/update-profile")} className="btn">
              Update profil
            </button>
            <button onClick={handleDelete} className="btn danger">
              Delete 
            </button>
            {user.role !== "client_approuve" && (
              <button onClick={handleRequestApproval} className="btn approve">
                <FaCheckCircle /> Demander l'approbation
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-details">
        <h3>Skills :</h3>
        <ul>
          {user.skills?.length ? user.skills.map((s, i) => <li key={i}>{s}</li>) : <p>Aucune compétence</p>}
        </ul>

        <h3>Abonnements (Packs) :</h3>
        <ul>
          {user.abonnement?.length ? (
            user.abonnement.map((pack, i) => (
              <li key={i}>{pack.title}</li>
            ))
          ) : (
            <p>Aucun pack acheté</p>
          )}
        </ul>

        <h3>Projects :</h3>
        <ul>
          {user.projects?.length ? user.projects.map((p, i) => <li key={i}>{p}</li>) : <p>Aucun projet</p>}
        </ul>

        <div className="messenger-link" onClick={handleMessengerClick}>
          <FaFacebookMessenger size={28} color="#1DA1F2" />
          <span>Go to Messen-SkillBridge</span>
        </div>
      </div>

      

      <AnimatePresence>
        {isWalletOpen && (
          <motion.div
            className="wallet-popup"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsWalletOpen(false)}
          >
            <GiTwoCoins size={50} />
            <h4>My solde</h4>
            <p>{user.wallet} points</p>
          </motion.div>
        )}
      </AnimatePresence>

      {isImageModalOpen && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content">
            <img src={`http://localhost:3000${user.image}`} alt="Profil" className="expanded-image" />
          </div>
        </div>
      )}
      
    </div>
    
  );
};

export default ManageProfile;
