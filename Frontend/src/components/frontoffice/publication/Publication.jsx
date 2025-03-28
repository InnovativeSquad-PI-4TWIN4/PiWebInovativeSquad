import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Publication.scss';

const Publication = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPublication, setNewPublication] = useState({
    type: 'offer', // Par défaut, peut être changé via un select
    description: '',
  });
  const [userId] = useState('67d0f21b1d96678a26cfc900'); // Remplacez par l'ID de l'utilisateur connecté

  const API_URL = 'http://localhost:3000/publication';

  // Récupérer toutes les publications au chargement du composant
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await axios.get(`${API_URL}/getAllPub`);
        setPublications(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des publications');
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPublication((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Soumettre une nouvelle publication
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!newPublication.description.trim()) {
    alert('Veuillez entrer une description.');
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/createPub`, {
      user: userId,
      type: newPublication.type,
      description: newPublication.description,
    });

    // Utilisez directement la publication peuplée retournée par le serveur
    setPublications((prev) => [response.data.publication, ...prev]);
    setNewPublication({ type: 'offer', description: '' });
  } catch (err) {
    console.error('Erreur lors de la création de la publication :', err);
    alert('Erreur lors de la création de la publication.');
  }
};

  if (loading) {
    return <div>Chargement des publications...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="publications-container">
      {/* Zone de création de publication */}
      <div className="create-publication">
        <form onSubmit={handleSubmit}>
          <div className="create-publication-header">
            <img
              src="https://via.placeholder.com/40" // Remplacez par l'image de l'utilisateur connecté
              alt="User avatar"
              className="user-avatar"
            />
            <select
              name="type"
              value={newPublication.type}
              onChange={handleInputChange}
              className="publication-type-select"
            >
              <option value="offer">Offre</option>
              <option value="request">Demande</option>
            </select>
          </div>
          <textarea
            name="description"
            value={newPublication.description}
            onChange={handleInputChange}
            placeholder="What's on your mind ?"
            className="publication-textarea"
          />
          <div className="create-publication-actions">
            <button type="submit" className="submit-btn">
              Post
            </button>
          </div>
        </form>
      </div>

      {/* Liste des publications */}
      {publications.map((pub) => (
  <div key={pub._id} className="publication-card">
    <div className="publication-header">
      <img
        src={pub.user?.image || 'https://via.placeholder.com/40'}
        alt={pub.user ? `${pub.user.name} ${pub.user.surname}` : 'Unknown user'}
        className="user-avatar"
      />
      <div className="user-info">
        <span className="user-name">
          {pub.user ? `${pub.user.name} ${pub.user.surname}` : 'Unknown user'}
        </span>
        <span className="publication-date">
          {new Date(pub.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
          <div className="publication-content">
            <span className={`publication-type ${pub.type}`}>
              {pub.type === 'offer' ? 'Offre' : 'Demande'}
            </span>
            <p className="publication-description">{pub.description}</p>
          </div>
          <div className="publication-actions">
            <button className="action-btn like-btn">
              <span className="icon">👍</span> Like
            </button>
            <button className="action-btn comment-btn">
              <span className="icon">💬</span> Commenter
            </button>
            <button className="action-btn negotiate-btn">
              <span className="icon">🤝</span> Negotiate
            </button>
            
          </div>
        </div>
      ))}
    </div>
  );
};

export default Publication;