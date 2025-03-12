import React, { useState } from "react";
import "./AddAdmin.scss";


const AddAdmin = ({ onClose, onAdd }) => {
  const [adminData, setAdminData] = useState({
    lastname: "",
    firstname: "",
    dateOfBirth: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(adminData);
    setAdminData({ lastname: "", firstname: "", dateOfBirth: "", email: "", password: "" });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Ajouter un Administrateur</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom :</label>
            <input type="text" name="lastname" value={adminData.lastname} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Prénom :</label>
            <input type="text" name="firstname" value={adminData.firstname} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Date de Naissance :</label>
            <input type="date" name="dateOfBirth" value={adminData.dateOfBirth} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email :</label>
            <input type="email" name="email" value={adminData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Mot de passe :</label>
            <input type="password" name="password" value={adminData.password} onChange={handleChange} required />
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-add">Ajouter</button>
            <button type="button" className="btn-close" onClick={onClose}>Fermer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;

