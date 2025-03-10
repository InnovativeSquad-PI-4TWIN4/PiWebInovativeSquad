import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaEye, FaToggleOn, FaToggleOff, FaSearch, FaPlus } from "react-icons/fa";
import UserDetails from './UserDetails';
import AddAdmin from "./AddAdmin";
import "./ManageUsers.scss";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/users/delete-profile/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'utilisateur");
      }

      setUsers(users.filter(user => user._id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      const token = localStorage.getItem("token");
      const url = isActive
        ? `http://localhost:3000/users/deactivate/${id}`  // Désactiver
        : `http://localhost:3000/users/activate/${id}`;   // Activer

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

      setUsers(prevUsers => prevUsers.map(user => user._id === id ? { ...user, isActive: !isActive } : user));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
  };

 

  const filteredUsers = users.filter(user =>
    `${user.name} ${user.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management">
      <div className="user-management__container">
        <h1>Manage Users</h1>

        {/* Barre de recherche pleine largeur */}
        <div className="user-management__search">
          <input type="text" placeholder="Rechercher un utilisateur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <FaSearch className="search-icon" />
        </div>

        

        <div className="user-management__content">
          {loading ? <p>Chargement...</p> : error ? <p className="error">{error}</p> :
            <motion.div className="list-view">
              <AnimatePresence>
                {filteredUsers.map(user => (
                  <motion.div key={user._id} className="user-row">
                    <div className="user-info">
                      <img src={`http://localhost:3000${user.image}`}
                        alt={user.name}
                        className="user-avatar"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }} />
                      <div className="details">
                        <div className="name">{user.name} {user.surname}</div>
                        <div className="email">{user.email || "Email non disponible"}</div>
                      </div>
                    </div>
                    <div className="actions">
                      <button onClick={() => handleToggleStatus(user._id, user.isActive)}>
                        {user.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                      </button>
                      <button onClick={() => handleViewUserDetails(user)}>
                        <FaEye size={20} />
                      </button>
                      <button onClick={() => handleDelete(user._id)}>
                        <FaTrash size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          }
        </div>
      </div>
      {selectedUser && <UserDetails user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {showAddAdminModal && <AddAdmin onClose={() => setShowAddAdminModal(false)} onAddAdmin={handleAddAdmin} />}
    </div>
  );
};

export default ManageUsers;
