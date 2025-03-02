import React, { useState } from "react";
import "./AddAdmin.scss";

const AddAdmin = ({ onClose, onAddAdmin }) => {
  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Vérification des champs
    if (!adminData.firstName || !adminData.lastName || !adminData.email || !adminData.password) {
      setError("All fields are required!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token"); // Vérifier si l'admin est authentifié
      if (!token) {
        throw new Error("Unauthorized! Please login first.");
      }

      const response = await fetch("http://localhost:3000/users/add-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error adding admin!");
      }

      alert("Admin added successfully! ✅");
      onAddAdmin(result.admin);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Admin</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text" name="firstName" placeholder="First Name" value={adminData.firstName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name" value={adminData.lastName} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={adminData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={adminData.password} onChange={handleChange} required />

          <div className="modal-buttons">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" className="close-btn" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
