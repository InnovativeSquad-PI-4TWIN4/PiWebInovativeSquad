import React, { useEffect, useState } from "react";
import { FaSearch, FaUserPlus } from "react-icons/fa";
import AddAdmin from "./AddAdmin"; // ✅ Import correct
import "./ManageAdmin.scss";

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // ✅ Gérer l'affichage du modal

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
        }

        const response = await fetch("http://localhost:3000/users/getAllAdmins", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token"); // ✅ Supprimer le token invalide
          alert("Votre session a expiré. Veuillez vous reconnecter.");
          window.location.href = "/signin"; // ✅ Redirection vers la connexion
          return;
        }

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setAdmins(data);
      } catch (err) {
        setError(err.message);
        console.error("❌ Erreur lors de la récupération des admins :", err);
      }
    };

    fetchAdmins();
  }, []);

  const handleAddAdmin = async (newAdmin) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/users/addAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAdmin),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de l'administrateur.");
      }

      const addedAdmin = await response.json();
      setAdmins([...admins, addedAdmin]);
      setShowModal(false);
      alert("Administrateur ajouté avec succès. Un email lui a été envoyé !");
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredAdmins = admins?.filter((admin) =>
    `${admin.name} ${admin.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="manage-admins">
      <h2>Manage Admins:</h2>

      {/* ✅ Barre de recherche et bouton "Add Admin" */}
      <div className="admin-header">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Rechercher un administrateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </div>
        <button className="add-admin-button" onClick={() => setShowModal(true)}>
          <FaUserPlus /> Add Admin
        </button>
      </div>

      {/* ✅ Gestion des erreurs */}
      {error && <p className="error-message">{error}</p>}

      {/* ✅ Liste des admins sous forme de cartes */}
      <div className="admin-grid">
        {filteredAdmins.length === 0 ? (
          <p>Aucun administrateur trouvé.</p>
        ) : (
          filteredAdmins.map((admin) => (
            <div className="admin-card" key={admin._id}>
              <img
                src={admin.image ? `http://localhost:3000${admin.image}` : "https://via.placeholder.com/100"}
                alt={admin.name}
                className="admin-avatar"
              />
              <div className="admin-info">
                <strong>{admin.name} {admin.surname}</strong>
                <p>{admin.email}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ Modal pour ajouter un admin */}
      {showModal && <AddAdmin onClose={() => setShowModal(false)} onAdd={handleAddAdmin} />}
    </div>
  );
};

export default ManageAdmins;
