import React, { useState } from "react";
import "./AddAdmin.scss";

const AddAdmin = ({ isOpen, onClose, onAdminAdded }) => {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!isOpen) return null; // Ne pas afficher le modal s'il n'est pas ouvert

    const handleAddAdmin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/users/add-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstname, lastname, dateOfBirth, email, password }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Failed to add admin!");

            setSuccess("✅ Admin ajouté avec succès !");
            setError("");
            onAdminAdded(); // Rafraîchir la liste des admins
            onClose(); // Fermer le modal après succès
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Ajouter un administrateur</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleAddAdmin}>
                    <input type="text" placeholder="Prénom" value={firstname} onChange={(e) => setFirstname(e.target.value)} required />
                    <input type="text" placeholder="Nom" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <div className="button-group">
                        <button type="submit" className="save-btn">Enregistrer</button>
                        <button type="button" className="close-btn" onClick={onClose}>Fermer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAdmin;
