import React, { useState, useEffect } from "react";
import axios from "axios";
import './PlanifySession.scss';

const PlanifySession = () => {
  const [users, setUsers] = useState([]);
  const [toUser, setToUser] = useState("");
  const [skill, setSkill] = useState("");
  const [date, setDate] = useState("");
  const fromUser = JSON.parse(localStorage.getItem("user"))?._id;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users/getAllUsers", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(res.data.filter(u => u._id !== fromUser));
      } catch (err) {
        console.error("Erreur chargement utilisateurs :", err);
      }
    };
    fetchUsers();
  }, [fromUser, token]);

  const handleSubmit = async () => {
    if (!toUser || !skill || !date) {
      return alert("🛑 Tous les champs sont obligatoires");
    }

    try {
      const res = await axios.post("http://localhost:3000/api/appointments/create", {
        fromUser,
        toUser,
        skill,
        date,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("✅ Session planifiée avec succès !");
      console.log("🎥 Lien Jitsi :", res.data.link);
    } catch (err) {
      console.error("Erreur planification session :", err);
    }
  };

  return (
    <div className="planify-session-page">
      <div className="planify-session">
        <h2>📅 Planifier une session d’échange</h2>

        <select value={toUser} onChange={(e) => setToUser(e.target.value)}>
          <option value="">Choisir un utilisateur</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} {u.surname} ({u.email})
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Compétence à partager (ex: ReactJS)"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />

        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={handleSubmit}>
          📩 Envoyer l’invitation
        </button>
      </div>
    </div>
  );
};

export default PlanifySession;
