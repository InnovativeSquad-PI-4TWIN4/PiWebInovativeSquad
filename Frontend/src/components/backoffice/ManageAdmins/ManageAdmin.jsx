import React, { useEffect, useState } from "react";
import { FaSearch, FaUserPlus } from "react-icons/fa";
import AddAdmin from "../../backoffice/ManageAdmins/AddAdmin";
import "./ManageAdmin.scss";

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    lastname: "",
    firstname: "",
    email: "",
    password: "",
    dateOfBirth: "",
  });

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

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setAdmins(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAdmins();
  }, []);

  const handleAddAdmin = async () => {
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

  const filteredAdmins = admins.filter((admin) =>
    `${admin.name} ${admin.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p>Aucun administrateur trouvé</p>
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
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Admin</h3>
            <input type="text" placeholder="FirstName" onChange={(e) => setNewAdmin({ ...newAdmin, firstname: e.target.value })} />
            <input type="text" placeholder="LastName" onChange={(e) => setNewAdmin({ ...newAdmin, lastname: e.target.value })} />
            <input type="email" placeholder="Email" onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} />
            <input type="password" placeholder="Password" onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} />
            <input type="date" onChange={(e) => setNewAdmin({ ...newAdmin, dateOfBirth: e.target.value })} />
            <button onClick={handleAddAdmin}>Add</button>
            <button onClick={() => setShowModal(false)} className="cancel-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;
