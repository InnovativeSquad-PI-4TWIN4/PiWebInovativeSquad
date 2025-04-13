import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrash, FaEye, FaToggleOn, FaToggleOff, FaSearch,
  FaMoneyBillWave, FaHistory, FaEnvelope
} from "react-icons/fa";
import UserDetails from './Userdetails';
import "./ManageUsers.scss";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [userToRecharge, setUserToRecharge] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailUser, setEmailUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/users/getAllUsers", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/users/delete-profile/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(users.filter(user => user._id !== id));
  };

  const handleToggleStatus = async (id, isActive) => {
    const token = localStorage.getItem("token");
    const url = isActive
      ? `http://localhost:3000/users/deactivate/${id}`
      : `http://localhost:3000/users/activate/${id}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (!response.ok || result.status === "FAILED") {
      alert(result.message || "Erreur statut utilisateur");
      return;
    }
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === id ? { ...user, isActive: !isActive } : user
      )
    );
  };

  const handleRechargeClick = (user) => {
    setUserToRecharge(user);
    setRechargeAmount("");
    setShowRechargeModal(true);
  };

  const handleRecharge = async () => {
    if (!rechargeAmount || isNaN(rechargeAmount) || rechargeAmount <= 0) {
      alert("Montant invalide.");
      return;
    }
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/users/rechargeAdmin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: userToRecharge._id,
        amount: parseFloat(rechargeAmount),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      alert(result.message || "Erreur recharge.");
      return;
    }
    alert("✅ Recharge effectuée !");
    setUsers(prev =>
      prev.map(user =>
        user._id === userToRecharge._id
          ? { ...user, solde: (user.solde || 0) + parseFloat(rechargeAmount) }
          : user
      )
    );
    setShowRechargeModal(false);
  };

  const fetchQuizHistory = async (userId, user) => {
    try {
      const res = await fetch(`http://localhost:3000/api/quiz-result/validated-categories/${userId}`);
      const data = await res.json();
      setQuizHistory(Object.entries(data.categoryCount || {}));
      setEmailUser(user);
      setShowHistoryModal(true);
    } catch (err) {
      alert("Erreur chargement historique");
    }
  };

  const sendEmail = async () => {
    if (!emailUser || !emailMessage) return alert("Message vide");

    try {
      const res = await fetch("http://localhost:3000/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailUser.email,
          subject: "Vos quiz validés sur SkillBridge",
          message: emailMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lord de l' envoi email");

      alert("📧 Email envoyé avec succès !");
      setEmailMessage("");
      setShowHistoryModal(false);
    } catch (err) {
      console.error("Erreur email:", err);
      alert("❌ Échec de l'envoi de l'email.");
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.name} ${user.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management">
      <div className="user-management__container">
        <h1>Manage Users</h1>

        <div className="user-management__search">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </div>

        <div className="user-management__content">
          {loading ? (
            <p>Chargement...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <motion.div className="list-view">
              <AnimatePresence>
                {filteredUsers.map(user => (
                  <motion.div key={user._id} className="user-row">
                    <div className="user-info">
                      <img
                        src={`http://localhost:3000${user.image}`}
                        alt={user.name}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/50";
                        }}
                      />
                      <div className="details">
                        <div className="name">
                          {user.name} {user.surname}
                          {user.hasCertificate && (
                            <span
                              title="Utilisateur certifié"
                              style={{
                                marginLeft: 8,
                                color: "#f4c542",
                                fontSize: "18px"
                              }}
                            >
                              🏅
                            </span>
                          )}
                        </div>
                        <div className="email">{user.email || "Email non disponible"}</div>
                        <div className="solde">Solde: {user.solde || 0}DT</div>
                      </div>
                    </div>
                    <div className="actions">
                      <button onClick={() => handleToggleStatus(user._id, user.isActive)}>
                        {user.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                      </button>
                      <button onClick={() => setSelectedUser(user)}><FaEye size={20} /></button>
                      <button onClick={() => handleDelete(user._id)}><FaTrash size={20} /></button>
                      <button onClick={() => handleRechargeClick(user)}><FaMoneyBillWave size={20} /></button>
                      <button onClick={() => fetchQuizHistory(user._id, user)}><FaHistory size={20} /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {showRechargeModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Recharger le solde</h2>
            <p>Utilisateur : {userToRecharge.name} {userToRecharge.surname}</p>
            <input
              type="number"
              placeholder="Montant"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
            />
            <button onClick={handleRecharge}>Confirmer</button>
            <button onClick={() => setShowRechargeModal(false)}>Annuler</button>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="modal">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <h3>Historique des quiz validés</h3>
            {quizHistory.length === 0 ? (
              <>
                <p>Aucun quiz validé.</p>
                <p style={{ fontStyle: "italic", color: "#999" }}>
                  Ce client n’a pas validé assez de quiz pour obtenir un certificat
                </p>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: 5,
                    marginTop: 15
                  }}
                >
                  Fermer
                </button>
              </>
            ) : (
              <>
                <ul style={{ textAlign: "left" }}>
                  {quizHistory.map(([cat, count], i) => (
                    <li key={i}>{cat} : {count} quiz</li>
                  ))}
                </ul>

                <button
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: 5
                  }}
                >
                  Fermer
                </button>

                <div style={{ marginTop: 20 }}>
                  {quizHistory.some(([_, count]) => count >= 2) ? (
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("http://localhost:3000/api/email/send-certification", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              to: emailUser.email,
                              name: emailUser.name,
                              categoryCount: Object.fromEntries(quizHistory),
                            }),
                          });

                          const data = await res.json();
                          if (!res.ok) throw new Error(data.message);
                          alert("🎓 Email de certification envoyé !");
                          setShowHistoryModal(false);
                        } catch (err) {
                          console.error(err);
                          alert("❌ Échec de l'envoi du certificat.");
                        }
                      }}
                      style={{
                        backgroundColor: "#007bff",
                        color: "#fff",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "5px"
                      }}
                    >
                      🎓 GetCertificat
                    </button>
                  ) : (
                    <p style={{ marginTop: 10, fontStyle: "italic", color: "#999" }}>
                      Ce client n’a pas validé assez de quiz pour obtenir un certificat
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {selectedUser && <UserDetails user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
};

export default ManageUsers;
