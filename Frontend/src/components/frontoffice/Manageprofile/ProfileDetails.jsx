import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProfileDetails.scss';

const ProfileDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/users/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error('Erreur chargement profil :', err);
      }
    };

    fetchUser();
  }, [id]);

  if (!user) return <div className="loading">Chargement du profil...</div>;

  return (
    <div className="facebook-profile">
      {/* Bannière + avatar */}
      <div className="cover-photo">
        
        <div className="profile-image">
          {user.image ? (
            <img src={`http://localhost:3000${user.image}`} alt="profile" />
          ) : (
            <div className="avatar-placeholder">{user.username?.charAt(0)}</div>
          )}
        </div>
      </div>

      {/* Nom + stats */}
      <div className="user-info">
        <h1>{user.firstName} {user.lastName}</h1>
        <p>{user.friends?.length || 0} ami(e)s • {user.commonFriends || 0} en commun</p>
        <div className="action-buttons">
          <button>Ami(e)</button>
          <button className="message">Message</button>
        </div>
      </div>

      {/* Onglets */}
      <div className="tabs">
        <button className="active">Publications</button>
        <button>À propos</button>
        <button>Amis</button>
        <button>Photos</button>
        <button>Vidéos</button>
        <button>Plus ▾</button>
      </div>

      {/* Section principale */}
      <div className="main-section">
        <div className="left">
          <div className="intro">
            <h3>Intro</h3>
            <p>{user.bio || 'Aucune intro.'}</p>
          </div>

          <div className="skills">
            <h4>Compétences</h4>
            <ul>
              {user.skills?.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>

          <div className="photos">
            <h4>Photos</h4>
            <div className="photo-grid">
              {(user.photos || []).map((photo, idx) => (
                <img key={idx} src={`http://localhost:3000${photo}`} alt="user" />
              ))}
            </div>
          </div>
        </div>

        <div className="right">
          <div className="post-box">
            <input placeholder={`Écrivez quelque chose à ${user.firstName}...`} />
            <div className="actions">
              <button>📷 Photo/Vidéo</button>
              <button>👥 Identifier</button>
              <button>😊 Humeur</button>
            </div>
          </div>

          <div className="posts">
            <h4>Publications</h4>
            {(user.posts || []).map((post, idx) => (
              <div key={idx} className="post">
                <p>{post.content}</p>
                <span>{post.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
