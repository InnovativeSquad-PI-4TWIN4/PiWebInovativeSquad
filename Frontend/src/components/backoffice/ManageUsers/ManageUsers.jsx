import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaEye, FaToggleOn, FaToggleOff, FaSearch, FaUserAlt } from "react-icons/fa";
import UserDetails from './UserDetails';  // Importation du nouveau composant
import './MangeUsers.scss';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // État pour l'utilisateur sélectionné

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
        }

        const response = await fetch("http://localhost:3000/users/getAllUsers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setUsers(data.filter(user => user.role !== "admin"));
      } catch (err) {
        setError(err.message);
        console.error("Erreur lors de la récupération des utilisateurs :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/users/delete-profile/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'utilisateur");
      }

      setUsers(users.filter(user => user._id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
      }

      const url = isActive
        ? `http://localhost:3000/users/deactivate-account/${id}`
        : `http://localhost:3000/users/activate-account/${id}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || result.status === "FAILED") {
        throw new Error(result.message || "Erreur lors de la mise à jour du statut de l'utilisateur");
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, isActive: !isActive } : user
        )
      );

      alert(result.message || `Utilisateur ${isActive ? "désactivé" : "activé"} avec succès !`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Erreur lors de la mise à jour du statut de l'utilisateur");
    }
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user); // Ouvrir le modal avec les détails de l'utilisateur
  };

  const handleCloseModal = () => {
    setSelectedUser(null); // Fermer le modal
  };

  const filteredUsers = users.filter(user =>
    `${user.name} ${user.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="user-management">
      <div className="user-management__container">
        <div className="user-management__header">
          <h1>Gestion des Utilisateurs</h1>
        </div>

        <div className="user-management__search">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        <div className="user-management__content">
          {loading && (
            <div className="user-management__loading">
              <div className="spinner"></div>
            </div>
          )}

          {error && (
            <div className="user-management__error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="user-management__empty">
              <FaUserAlt size={40} color="#9ca3af" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}

          {!loading && !error && filteredUsers.length > 0 && (
            <motion.div
              className="list-view"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    className={`user-row ${user.isActive ? 'user-row--active' : 'user-row--inactive'}`}
                    variants={itemVariants}
                  >
                    <div className="user-info">
                      <img
                        src={user.image ? `http://localhost:3000${user.image}` : "/path/to/default-image.jpg"}
                        alt="Profil"
                        className="profile-image"
                      />
                      <div className="details">
                        <div className="name">{user.name} {user.surname}</div>
                        <div className="email">{user.email || "Email non disponible"}</div>
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        className="toggle-btn"
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                      >
                        {user.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} className="inactive" />}
                      </button>
                      <button className="view-btn" onClick={() => handleViewUserDetails(user)}>
                        <FaEye size={20} />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user._id)}
                      >
                        <FaTrash size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Affichage du composant UserDetails si un utilisateur est sélectionné */}
      {selectedUser && (
        <UserDetails user={selectedUser} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ManageUsers;
