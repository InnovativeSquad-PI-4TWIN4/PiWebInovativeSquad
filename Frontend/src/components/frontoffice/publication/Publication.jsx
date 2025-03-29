import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Publication.scss';

const Publication = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPublication, setNewPublication] = useState({
    type: 'offer',
    description: '',
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [newComments, setNewComments] = useState({}); // État pour stocker les nouveaux commentaires
  const [newReplies, setNewReplies] = useState({}); // État pour stocker les nouvelles réponses

  const API_URL = 'http://localhost:3000/publication';
  const USER_API_URL = 'http://localhost:3000/users/profile';
  const BASE_URL = 'http://localhost:3000';

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Utilisateur non connecté');
          setLoading(false);
          return;
        }

        const response = await axios.get(USER_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === 'SUCCESS') {
          setCurrentUser(response.data.user);
        } else {
          setError('Erreur lors de la récupération des informations utilisateur');
        }
      } catch (err) {
        setError('Erreur lors de la récupération des informations utilisateur');
      }
    };

    fetchCurrentUser();
  }, []);

  // Récupérer toutes les publications
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPublication((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPublication.description.trim()) {
      alert('Veuillez entrer une description.');
      return;
    }

    if (!currentUser) {
      alert('Utilisateur non connecté');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/createPub`,
        {
          user: currentUser._id,
          type: newPublication.type,
          description: newPublication.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPublications((prev) => [response.data.publication, ...prev]);
      setNewPublication({ type: 'offer', description: '' });
    } catch (err) {
      alert('Erreur lors de la création de la publication.');
    }
  };

  // Fonction pour gérer le "J'aime"
  const handleLike = async (publicationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/like/${publicationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPublications((prev) =>
        prev.map((pub) =>
          pub._id === publicationId ? response.data.publication : pub
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'ajout du J\'aime.');
    }
  };

  // Gérer le changement de texte pour un nouveau commentaire
  const handleCommentChange = (publicationId, value) => {
    setNewComments((prev) => ({
      ...prev,
      [publicationId]: value,
    }));
  };

  // Gérer le changement de texte pour une nouvelle réponse
  const handleReplyChange = (commentId, value) => {
    setNewReplies((prev) => ({
      ...prev,
      [commentId]: value,
    }));
  };

  // Ajouter un commentaire
  const handleAddComment = async (publicationId) => {
    const content = newComments[publicationId];
    if (!content || content.trim().length === 0) {
      alert('Veuillez entrer un commentaire.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/comment/${publicationId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPublications((prev) =>
        prev.map((pub) =>
          pub._id === publicationId ? response.data.publication : pub
        )
      );
      setNewComments((prev) => ({
        ...prev,
        [publicationId]: '',
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'ajout du commentaire.');
    }
  };

  // Ajouter une réponse à un commentaire
  const handleAddReply = async (publicationId, commentId) => {
    const content = newReplies[commentId];
    if (!content || content.trim().length === 0) {
      alert('Veuillez entrer une réponse.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/reply/${publicationId}/${commentId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPublications((prev) =>
        prev.map((pub) =>
          pub._id === publicationId ? response.data.publication : pub
        )
      );
      setNewReplies((prev) => ({
        ...prev,
        [commentId]: '',
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'ajout de la réponse.');
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
              src={
                currentUser?.image
                  ? currentUser.image.startsWith('http')
                    ? currentUser.image
                    : `${BASE_URL}${currentUser.image}`
                  : 'https://via.placeholder.com/40'
              }
              alt={`${currentUser?.name} ${currentUser?.surname}`}
              className="user-avatar"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
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
              src={
                pub.user?.image
                  ? pub.user.image.startsWith('http')
                    ? pub.user.image
                    : `${BASE_URL}${pub.user.image}`
                  : 'https://via.placeholder.com/40'
              }
              alt={`${pub.user?.name} ${pub.user?.surname}`}
              className="user-avatar"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
            />
            <div className="user-info">
              <span className="user-name">
                {pub.user ? `${pub.user.name} ${pub.user.surname}` : 'Utilisateur inconnu'}
              </span>
              <span className="publication-date">
                {new Date(pub.createdAt).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
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
            <button
              className="action-btn like-btn"
              onClick={() => handleLike(pub._id)}
            >
              <span className="icon">👍</span> Like ({pub.likes ? pub.likes.length : 0})
            </button>
            <button className="action-btn comment-btn">
              <span className="icon">💬</span> Commenter
            </button>
            <button className="action-btn negotiate-btn">
              <span className="icon">🤝</span> Negotiate
            </button>
          </div>

          {/* Section des commentaires */}
          <div className="comments-section">
            {/* Formulaire pour ajouter un commentaire */}
            <div className="add-comment">
              <textarea
                value={newComments[pub._id] || ''}
                onChange={(e) => handleCommentChange(pub._id, e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="comment-textarea"
              />
              <button
                onClick={() => handleAddComment(pub._id)}
                className="submit-comment-btn"
              >
                Commenter
              </button>
            </div>

            {/* Liste des commentaires */}
            {pub.comments && pub.comments.length > 0 && (
              <div className="comments-list">
                {pub.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <div className="comment-header">
                      <img
                        src={
                          comment.user?.image
                            ? comment.user.image.startsWith('http')
                              ? comment.user.image
                              : `${BASE_URL}${comment.user.image}`
                            : 'https://via.placeholder.com/40'
                        }
                        alt={`${comment.user?.name} ${comment.user?.surname}`}
                        className="user-avatar"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
                      />
                      <div className="comment-info">
                        <span className="user-name">
                          {comment.user ? `${comment.user.name} ${comment.user.surname}` : 'Utilisateur inconnu'}
                        </span>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="comment-content">{comment.content}</p>

                    {/* Liste des réponses */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="replies-list">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="reply">
                            <div className="reply-header">
                              <img
                                src={
                                  reply.user?.image
                                    ? reply.user.image.startsWith('http')
                                      ? reply.user.image
                                      : `${BASE_URL}${reply.user.image}`
                                    : 'https://via.placeholder.com/40'
                                }
                                alt={`${reply.user?.name} ${reply.user?.surname}`}
                                className="user-avatar"
                                onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
                              />
                              <div className="reply-info">
                                <span className="user-name">
                                  {reply.user ? `${reply.user.name} ${reply.user.surname}` : 'Utilisateur inconnu'}
                                </span>
                                <span className="reply-date">
                                  {new Date(reply.createdAt).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                            <p className="reply-content">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulaire pour ajouter une réponse (seul le créateur peut répondre) */}
                    {currentUser && pub.user && pub.user._id === currentUser._id && (
                      <div className="add-reply">
                        <textarea
                          value={newReplies[comment._id] || ''}
                          onChange={(e) => handleReplyChange(comment._id, e.target.value)}
                          placeholder="Répondre au commentaire..."
                          className="reply-textarea"
                        />
                        <button
                          onClick={() => handleAddReply(pub._id, comment._id)}
                          className="submit-reply-btn"
                        >
                          Répondre
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Publication;