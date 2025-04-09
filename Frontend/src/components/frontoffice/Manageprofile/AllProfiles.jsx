import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AllProfiles.scss'; // ✅ SCSS personnalisé

const Profiles = ({ currentUserId }) => {
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/users/getAllUsers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const filtered = res.data.filter(user => user._id !== currentUserId);
        setProfiles(filtered);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchProfiles();
  }, [currentUserId]);

  return (
    <div className="facebook-style-container">
      <h2 className="header">Suggestions</h2>
      <div className="card-grid">
        {profiles.map((profile) => (
          <div className="facebook-card" key={profile._id}>
            <div className="image-wrapper">
  {profile.image ? (
    <img
      src={`http://localhost:3000${profile.image}`}
      alt="Profile"
      className="user-image"
    />
  ) : (
    <div className="placeholder-avatar">
      {profile.username?.charAt(0).toUpperCase()}
    </div>
  )}
</div>

            <div className="card-info">
  <p className="fullname">{profile.name} {profile.surname}</p>
  <p className="username">@{profile.name}</p>

  {profile.skills && profile.skills.length > 0 && (
    <div className="skills">
      {profile.skills.map((skill, index) => (
        <span key={index} className="skill-badge">{skill}</span>
      ))}
    </div>
  )}

  <div className="button-group">
  <button
  className="confirm-btn"
  onClick={() => navigate(`/profile/${profile._id}`)}
>
  More about
</button>
    <button className="delete-btn">Supprimer</button>
  </div>
</div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Profiles;
