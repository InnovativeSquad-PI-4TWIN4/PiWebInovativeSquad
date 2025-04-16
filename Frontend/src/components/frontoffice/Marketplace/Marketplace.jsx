import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Marketplace.scss';
import RechargeModal from '../RechargeModal/RechargeModal';
import { motion } from 'framer-motion';

const Marketplace = () => {
  const [view, setView] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [paidCourses, setPaidCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/courses/getallcourses')
      .then(response => setCourses(response.data))
      .catch(error => console.error("Erreur lors de la récupération des cours :", error));

    const paid = JSON.parse(localStorage.getItem('paidCourses')) || [];
    setPaidCourses(paid);
  }, []);

  const handleAccessPremium = async (courseId) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Utilisateur non connecté !");
      return;
    }

    let userId;
    try {
      const user = JSON.parse(storedUser);
      userId = user?._id || user?.id;
    } catch {
      alert("Erreur de session utilisateur !");
      return;
    }

    if (!userId) {
      alert("Impossible de récupérer l'ID utilisateur !");
      return;
    }

    if (paidCourses.includes(courseId)) {
      try {
        const res = await axios.get(`http://localhost:3000/courses/getcourses/${courseId}`);
        const course = res.data;
        window.open(course.isMeetEnded && course.videoReplayUrl ? course.videoReplayUrl : course.meetLink, "_blank");
      } catch (err) {
        alert("Erreur lors de l'accès au cours déjà payé.");
      }
      return;
    }

    try {
      const res = await axios.post(`http://localhost:3000/courses/access/${courseId}`, { userId });
      if (res.status === 200) {
        window.open(res.data.meetLink, "_blank");
        alert(`✅ Accès autorisé. Nouveau solde : ${res.data.remainingBalance} DT`);
        const updated = [...new Set([...paidCourses, courseId])];
        localStorage.setItem('paidCourses', JSON.stringify(updated));
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

  const handleDownloadAndOpen = async (pdfUrl, title) => {
    const fileUrl = `http://localhost:3000${pdfUrl}`;
    window.open(fileUrl, '_blank');
    try {
      const res = await axios.get(fileUrl, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erreur téléchargement :', err);
    }
  };

  const normalCourses = courses.filter(c => !c.isPremium);
  const premiumCourses = courses.filter(c => c.isPremium);

  const renderView = () => {
    if (view === 'courses') {
      return (
        <>
          <button className="back-btn" onClick={() => setView(null)}>⬅</button>
          <h2>📘 Free Courses</h2>
          <div className="courses-grid">
            {normalCourses.map(course => (
              <motion.div key={course._id} className="course-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2>{course.title}</h2>
                <p>{course.category}</p>
                <p><strong>Instructeur :</strong> {course.instructor?.name || "Inconnu"}</p>
                {course.pdfUrl && (
                  <button
                    className="download-btn"
                    onClick={() => handleDownloadAndOpen(course.pdfUrl, course.title)}
                  >
                    Télécharger PDF
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </>
      );
    }

    if (view === 'premium') {
      return (
        <>
          <button className="back-btn" onClick={() => setView(null)}>⬅</button>
          <h2>🔥 Premium Courses</h2>
          <div className="courses-grid">
            {premiumCourses.map(course => (
              <motion.div key={course._id} className="course-card premium" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2>{course.title}</h2>
                <p>{course.category}</p>
                <p><strong>Instructeur :</strong> {course.instructor?.name || "Inconnu"}</p>
                <p>💰 Prix : {course.price} DT</p>

                {paidCourses.includes(course._id) ? (
                  course.isMeetEnded && course.videoReplayUrl ? (
                    <a
                      href={course.videoReplayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="replay-btn"
                    >
                      ▶️ Voir l'enregistrement
                    </a>
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
        </>
      );
    }

    return (
      <div className="marketplace-cards">
      <motion.div className="select-card" onClick={() => navigate('/marketplace/free')} whileHover={{ scale: 1.05 }}>
  📘 <h3>Courses</h3>
      </motion.div>
        <motion.div className="select-card" onClick={() => navigate('/marketplace/premium')} whileHover={{ scale: 1.05 }}>
          🔥 <h3>Premium Courses</h3>
        </motion.div>
      </div>
    );
  };

  return (
    <section className="courses">
      <h1>🎓 Welcome to the Marketplace</h1>
      {renderView()}
      {showRechargeModal && (
        <RechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={() => {
            setShowRechargeModal(false);
            window.location.reload();
          }}
          userId={selectedUserId}
        />
      )}
    </section>
  );
};

export default Marketplace;
