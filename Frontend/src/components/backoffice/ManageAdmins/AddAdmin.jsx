import React, { useState } from "react";
import "./AddAdmin.scss";

const AddAdmin = ({ onClose, onAdd }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(adminData);
    setAdminData({ firstname: "", lastname: "", email: "", password: "", dateOfBirth: "" });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Ajouter un Administrateur</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstname"
            placeholder="FirstName"
            value={adminData.firstname}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastname"
            placeholder="LastName"
            value={adminData.lastname}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={adminData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={adminData.password}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="dateOfBirth"
            value={adminData.dateOfBirth}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-add">Add</button>
          <button type="button" className="btn-close" onClick={onClose}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
