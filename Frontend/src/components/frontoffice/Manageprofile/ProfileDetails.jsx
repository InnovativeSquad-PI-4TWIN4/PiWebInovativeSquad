import React, { useEffect, useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfileDetails.scss';

const ProfileDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
const [offeredSkill, setOfferedSkill] = useState("");
const [requestedSkill, setRequestedSkill] = useState("");
const [mySkills, setMySkills] = useState([]);
const navigate = useNavigate();


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
        // Normaliser Skill → skills
        const userData = res.data; // ✅ tu l’avais oublié !
    const normalizedSkills = Array.isArray(userData.Skill)
    ? userData.Skill.filter(s => s && s.trim() !== '')
    : [];

  setUser({ ...userData, skills: normalizedSkills });
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    const fetchMySkills = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
    
        const userData = res.data.user;
        const normalized = Array.isArray(userData.Skill)
          ? userData.Skill.filter(s => s && s.trim() !== '')
          : [];
    
        setMySkills(normalized); // ✅ propre
      } catch (err) {
        console.error("Failed to fetch current user skills", err);
      }
    };
    
    fetchUser();
    fetchMySkills();
  }, [id]);

  if (!user) return <div className="loading">Loading profile...</div>;
  const handleSendExchangeRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/exchange-request", {
        receiverId: id,
        skillOffered: offeredSkill,
        skillRequested: requestedSkill
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}` // ✅ très important
        }
      });  
      alert("Exchange request sent successfully!");
      setIsExchangeModalOpen(false);
    } catch (error) {
      console.error("Error sending exchange request:", error);
      alert("An error occurred while sending the request.");
    }
  };
  
  return (
    <div className="facebook-profile">
      {/* Banner + Avatar */}
      <div className="cover-photo">
        <div className="profile-image">
          {user.image ? (
            <img src={`http://localhost:3000${user.image}`} alt="profile" />
          ) : (
            <div className="avatar-placeholder">{user.username?.charAt(0)}</div>
          )}
        </div>
      </div>

      {/* Name + Stats */}
      <div className="user-info">
        <h1>{user.firstName} {user.lastName}</h1>
        <p>{user.friends?.length || 0} friends • {user.commonFriends || 0} mutual</p>
        <div className="action-buttons">
          <button>Friend</button>
          <button className="message">Message</button>
          <button onClick={() => setIsExchangeModalOpen(true)} className="exchange-btn">
  🔄 Propose Skill Exchange
</button>
{isExchangeModalOpen && (
  <div className="exchange-modal">
    <h3>📘 Propose a Skill Exchange</h3>

    <label>💡 What skill can you offer?</label>
    <select value={offeredSkill} onChange={(e) => setOfferedSkill(e.target.value)}>
      <option disabled value="">-- Select a skill --</option>
      {mySkills.map((skill, i) => <option key={i}>{skill}</option>)}
    </select>

    <label>🎯 What do you want to learn from {user.firstName}?</label>
    <select value={requestedSkill} onChange={(e) => setRequestedSkill(e.target.value)}>
      <option disabled value="">-- Select a skill --</option>
      {user.skills?.map((skill, i) => <option key={i}>{skill}</option>)}
    </select>

    <div style={{ display: "flex", justifyContent: "center" }}>
      <button className="submit-btn" onClick={handleSendExchangeRequest}>🚀 Send Request</button>
      <button className="cancel-btn" onClick={() => setIsExchangeModalOpen(false)}>❌ Cancel</button>
    </div>
  </div>
)}

        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className="active">Posts</button>
        <button>About</button>
        <button>Friends</button>
        <button>Photos</button>
        <button>Videos</button>
        <button>More ▾</button>
      </div>

      {/* Main Content */}
      <div className="main-section">
        <div className="left">
          <div className="intro">
            <h3>Intro</h3>
            <p>{user.bio || 'No bio provided.'}</p>
          </div>

          <div className="skills">
            <h4>Skills</h4>
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
            <input placeholder={`Write something to ${user.firstName}...`} />
            <div className="actions">
              <button>📷 Photo/Video</button>
              <button>👥 Tag</button>
              <button>😊 Feeling</button>
            </div>
          </div>

          <div className="posts">
            <h4>Posts</h4>
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
