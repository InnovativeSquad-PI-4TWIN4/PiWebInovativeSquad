import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import './PremiumCourses.scss';
import RechargeModal from '../RechargeModal/RechargeModal';
import NotificationPopup from './NotificationPopup';
import notificationSound from '../../../assets/notification.mp3';

const PremiumCourses = () => {
  const [courses, setCourses] = useState([]);
  const [paidCourses, setPaidCourses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [highlightedCourseId, setHighlightedCourseId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id || user?.id;
  const paidKey = `paidCourses_${userId}`;

  useEffect(() => {
    axios.get("http://localhost:3000/courses/getallcourses")
      .then(res => {
        const premium = res.data.filter(c => c.isPremium);
        setCourses(premium);
      })
      .catch(err => console.error("Erreur chargement des cours premium :", err));

    const paid = JSON.parse(localStorage.getItem(paidKey)) || [];
    setPaidCourses(paid);

    if (userId) {
      axios.get(`http://localhost:3000/favorites/${userId}`)
        .then(res => setFavorites(res.data.map(c => c._id)))
        .catch(err => console.error("Erreur chargement des favoris :", err));

      const justConnected = sessionStorage.getItem("justConnected");

      if (justConnected === 'true') {
        axios.get(`http://localhost:3000/notifications/${userId}`)
          .then(res => {
            if (res.data.length > 0) {
              const lastNotif = res.data[0];
              setPopupMessage("🆕 Nouveau cours : cliquez ici pour voir !");
              setShowPopup(true);

              const match = lastNotif.message.match(/cours intitulé ['\"](.*?)['\"]/i);
              if (match) {
                const title = match[1].toLowerCase();
                axios.get("http://localhost:3000/courses/getallcourses").then(res => {
                  const course = res.data.find(c => c.title.toLowerCase().includes(title));
                  if (course) {
                    setHighlightedCourseId(course._id);
                    localStorage.setItem("highlightedCourse", course._id);
                  }
                });
              }

              const audio = new Audio(notificationSound);
              audio.play();
            }
          });
        sessionStorage.setItem("justConnected", "false");
      }
    }

    const storedHighlight = localStorage.getItem("highlightedCourse");
    if (storedHighlight) {
      setHighlightedCourseId(storedHighlight);
      localStorage.removeItem("highlightedCourse");

      setTimeout(() => {
        setHighlightedCourseId(null);
      }, 8000);
    }
  }, [userId]);

  const toggleFavorite = async (courseId) => {
    const isFavorite = favorites.includes(courseId);
    const url = isFavorite ? "remove" : "add";

    try {
      await axios.post(`http://localhost:3000/favorites/${url}`, { userId, courseId });
      setFavorites(prev => isFavorite ? prev.filter(id => id !== courseId) : [...prev, courseId]);
    } catch (error) {
      console.error("Erreur favoris :", error);
    }
  };

  const handleAccessPremium = async (courseId) => {
    if (!userId) return alert("Utilisateur non connecté !");

    if (paidCourses.includes(courseId)) {
      try {
        const res = await axios.get(`http://localhost:3000/courses/getcourses/${courseId}`);
        const course = res.data;
        const targetUrl = course.isMeetEnded && course.videoReplayUrl ? course.videoReplayUrl : course.meetLink;
        if (targetUrl) {
          window.open(targetUrl, "_blank");
        } else {
          alert("Aucun lien disponible pour ce cours.");
        }
      } catch (err) {
        alert("Erreur d'accès au cours déjà payé.");
      }
      return;
    }

    try {
      const res = await axios.post(`http://localhost:3000/premium/access/${courseId}`, { userId });
      if (res.status === 200) {
        window.open(res.data.meetLink, "_blank");
        alert(`✅ Accès autorisé. Nouveau solde : ${res.data.remainingBalance} DT`);
        const updated = [...new Set([...paidCourses, courseId])];
        localStorage.setItem(paidKey, JSON.stringify(updated));
        setPaidCourses(updated);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        alert("❌ Solde insuffisant.");
        setSelectedUserId(userId);
        setShowRechargeModal(true);
      } else {
        alert("Erreur serveur.");
      }
    }
  };

  const handleNotificationClick = () => {
    localStorage.setItem("highlightedCourse", highlightedCourseId);
    navigate("/marketplace/premium");
    setShowPopup(false);
  };

  return (
    <section className="courses">
      <button className="back-btn" onClick={() => navigate('/marketplace')}>⬅</button>
      <h2>🔥 Premium Courses</h2>
      <div className="courses-grid">
        {courses.map(course => (
          <motion.div
            key={course._id}
            className={`course-card premium ${highlightedCourseId === course._id ? 'highlighted' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FaHeart
              className={`heart-icon ${favorites.includes(course._id) ? "active" : ""}`}
              onClick={() => toggleFavorite(course._id)}
              title={favorites.includes(course._id) ? "Retirer des favoris" : "Ajouter aux favoris"}
            />

            <h2>{course.title}</h2>
            <p>{course.category}</p>
            <p><strong>Instructeur :</strong> {course.instructor?.name || "Inconnu"}</p>
            <p>💰 Prix : {course.price} DT</p>

            {paidCourses.includes(course._id) ? (
              course.isMeetEnded ? (
                course.videoReplayUrl ? (
                  <a href={course.videoReplayUrl} target="_blank" rel="noopener noreferrer" className="replay-btn">
                    ▶️ Voir l'enregistrement
                  </a>
                ) : (
                  <p className="text-muted">Replay non encore disponible</p>
                )
              ) : (
                <button className="meet-btn" onClick={() => handleAccessPremium(course._id)}>
                  Rejoindre le cours en direct
                </button>
              )
            ) : (
              <button className="meet-btn" onClick={() => handleAccessPremium(course._id)}>
                Rejoindre le cours en direct
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {showPopup && (
        <NotificationPopup
          message={popupMessage}
          onClick={handleNotificationClick}
        />
      )}

      {showRechargeModal && (
        <RechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={() => {
            setShowRechargeModal(false);
            window.location.reload();
          }}
          userId={selectedUserId}
          rechargeUrl="http://localhost:3000/premium/recharge"
        />
      )}
    </section>
  );
};

export default PremiumCourses;
