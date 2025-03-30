import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './PremiumCourses.scss';
import RechargeModal from '../RechargeModal/RechargeModal';

const PremiumCourses = () => {
  const [courses, setCourses] = useState([]);
  const [paidCourses, setPaidCourses] = useState([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3000/courses/getallcourses")
      .then(res => {
        const premium = res.data.filter(c => c.isPremium);
        setCourses(premium);
        console.log("✅ Premium courses reçus :", premium);
      })
      .catch(err => console.error("Erreur chargement des cours premium :", err));

    const paid = JSON.parse(localStorage.getItem('paidCourses')) || [];
    setPaidCourses(paid);
  }, []);

  const handleAccessPremium = async (courseId) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return alert("Utilisateur non connecté !");

    let userId;
    try {
      const user = JSON.parse(storedUser);
      userId = user?._id || user?.id;
    } catch {
      return alert("Erreur utilisateur !");
    }

    if (!userId) return alert("Impossible de récupérer l'utilisateur !");

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
        localStorage.setItem("paidCourses", JSON.stringify(updated));
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

  return (
    <section className="courses">
      <button className="back-btn" onClick={() => navigate('/marketplace')}>⬅</button>
      <h2>🔥 Premium Courses</h2>
      <div className="courses-grid">
        {courses.map(course => (
          <motion.div
            key={course._id}
            className="course-card premium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2>{course.title}</h2>
            <p>{course.category}</p>
            <p><strong>Instructeur :</strong> {course.instructor?.name || "Inconnu"}</p>
            <p>💰 Prix : {course.price} DT</p>
            {course.isMeetEnded && <span className="badge"></span>}

            {paidCourses.includes(course._id) ? (
              course.isMeetEnded ? (
                course.videoReplayUrl ? (
                  <a
                    href={course.videoReplayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="replay-btn"
                  >
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
