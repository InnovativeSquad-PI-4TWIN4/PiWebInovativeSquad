import React, { useEffect, useState } from "react";
import { FaSearch, FaUserPlus } from "react-icons/fa";
import "./ManageAdmin.scss";

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(""); // Ajout pour la gestion des erreurs

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
            Authorization: `Bearer ${token}`, // Vérifiez que le token est valide
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setAdmins(data); // Correction ici (avant c'était setUsers(data))
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter((admin) =>
    `${admin.name} ${admin.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-admins">
      <h2>Manage Admins</h2>

      {/* ✅ Barre de recherche */}
      <div className="admin-search">
        <input
          type="text"
          placeholder="Rechercher un administrateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="search-icon" />
      </div>

      {/* ✅ Gestion des erreurs */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ✅ Liste des admins */}
      <div className="admin-list">
        {filteredAdmins.length === 0 ? (
          <p>Aucun administrateur trouvé</p>
        ) : (
          filteredAdmins.map((admin) => (
            <div className="admin-card" key={admin._id}>
              <img
                src={admin.image ? `http://localhost:3000${admin.image}` : "https://via.placeholder.com/50"}
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
    </div>
  );
};

export default ManageAdmins;
