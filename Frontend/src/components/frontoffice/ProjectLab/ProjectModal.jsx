// 🔧 ProjectModal.jsx (optimisé)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectModal.scss';
import { toast } from 'react-toastify';

const ProjectModal = ({ onProjectCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:3000/users/getAllUsers', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const currentUser = JSON.parse(localStorage.getItem('user'));
        const filteredUsers = res.data.filter((user) => user._id !== currentUser._id);
        setAllUsers(filteredUsers);
      } catch (err) {
        console.error('Erreur récupération utilisateurs', err);
        toast.error('❌ Erreur lors du chargement des utilisateurs.');
      }
    };

    fetchUsers();
  }, [token]);

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.warn('⚠️ Merci de remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'http://localhost:3000/api/projects',
        { title, description, members: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('✅ Projet créé avec succès et emails envoyés !');
      onProjectCreated();
      setTitle('');
      setDescription('');
      setSelectedUsers([]);
    } catch (err) {
      console.error('❌ Erreur lors de la création du projet :', err);
      toast.error('❌ Une erreur est survenue. Vérifie les champs et réessaye.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-modal">
      <h2>Créer un nouveau projet</h2>
      <input
        type="text"
        placeholder="Titre du projet"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />
      <textarea
        placeholder="Description du projet"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
      />

      <div className="user-selection">
        <p>Sélectionner les membres à inviter ({selectedUsers.length}) :</p>
        <div className="user-list">
          {allUsers.map((user) => (
            <label key={user._id}>
              <input
                type="checkbox"
                checked={selectedUsers.includes(user._id)}
                onChange={() => handleCheckboxChange(user._id)}
                disabled={loading}
              />
              {user.name} {user.surname} ({user.email})
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Création...' : 'Créer'}
      </button>
    </div>
  );
};

export default ProjectModal;
