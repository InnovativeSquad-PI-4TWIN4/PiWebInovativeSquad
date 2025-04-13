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
          alert("Error: Invalid user.");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
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

      if (!response.ok) throw new Error("Error during request");
      alert("Request sent!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Do you really want to delete your account?")) {
      try {
        const response = await fetch(`http://localhost:3000/users/delete-profile/${user._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Delete error");
        localStorage.clear();
        alert("Account deleted.");
        navigate("/signin");
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const handleViewProfiles = () => {
    navigate('/profiles'); 
  };

  const openImageModal = () => setIsImageModalOpen(true);
  const closeImageModal = () => setIsImageModalOpen(false);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="facebook-profile">
      <div className="cover-photo">
        <div className="profile-image">
          {user.image ? (
            <img src={`http://localhost:3000${user.image}`} alt="Profile" onClick={openImageModal} />
          ) : (
            <div className="avatar-placeholder">E</div>
          )}
        </div>
      </div>

      <div className="user-info">
        <h1>{user.name} {user.surname}</h1>
        <p>@{user.username || user.email?.split("@")[0]}</p>
        <p className="wallet-btn" onClick={() => setIsWalletOpen(true)}>
          <FaWallet /> {user.wallet} points
        </p>

        <div className="btn-row">
          <button onClick={() => navigate("/update-profile")} className="btn">Update Profile</button>
          <button onClick={handleDelete} className="btn danger">Delete</button>
          <button onClick={handleViewProfiles} className="btn primary">View Other Profiles</button>
          {user.role !== "client_approuve" && (
            <button onClick={handleRequestApproval} className="btn approve">
              <FaCheckCircle /> Request Approval
            </button>
          )}
        </div>
      </div>

      <div className="main-section">
        <div className="messenger-link" onClick={handleMessengerClick}>
          <FaFacebookMessenger size={28} color="#1DA1F2" />
          <span>Go to SkillBridge Messenger</span>
        </div>

        <div className="right-section">
          <div className="left-section">
            <div className="intro">
              <h3>Skills</h3>
              <ul>
                {user.skills?.length ? user.skills.map((s, i) => <li key={i}>{s}</li>) : <p>No skills</p>}
              </ul>

              <h3>Subscriptions</h3>
              <ul>
                {user.abonnement?.length ? user.abonnement.map((pack, i) => {
                  const result = user.examResults?.find((r) => r.packId === pack._id || r.packId === pack._id?.toString());
                  return (
                    <li key={i}>
                      {pack.title}
                      {result && (
                        <span style={{ color: "green", fontWeight: "bold", marginLeft: "10px" }}>
                          ✅ Score: {result.score} — Certified
                        </span>
                      )}
                    </li>
                  );
                }) : <p>No packs</p>}
              </ul>

              <h3>Projects</h3>
              <ul>
                {user.projects?.length ? user.projects.map((p, i) => <li key={i}>{p}</li>) : <p>No projects</p>}
              </ul>
            </div>
          </div>
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
            <h4>Wallet Balance</h4>
            <p>{user.wallet} points</p>
          </motion.div>
        )}
      </AnimatePresence>

      {isImageModalOpen && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content">
            <img src={`http://localhost:3000${user.image}`} alt="Profile" className="expanded-image" />
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageProfile;
