import React, { useState } from "react";
import "./AddAdmin.scss";

const AddAdmin = ({ onClose }) => {
  const [adminData, setAdminData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    dateOfBirth: "",
  });

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/users/addAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de l'administrateur.");
      }

      alert("✅ Administrateur ajouté avec succès. Un email lui a été envoyé !");
      onClose(); // ✅ Fermer le modal après succès
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        
        <form onSubmit={handleSubmit}>
          <input type="text" name="firstname" placeholder="First Name" value={adminData.firstname} onChange={handleChange} required />
          <input type="text" name="lastname" placeholder="Last Name" value={adminData.lastname} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={adminData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={adminData.password} onChange={handleChange} required />
          <input type="date" name="dateOfBirth" value={adminData.dateOfBirth} onChange={handleChange} required />
          <div className="modal-footer">
            <button type="submit" className="btn-add">Add</button>
            <button type="button" className="btn-close" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
