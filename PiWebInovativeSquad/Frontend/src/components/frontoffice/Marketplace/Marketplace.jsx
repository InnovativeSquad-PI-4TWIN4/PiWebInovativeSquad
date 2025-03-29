import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Marketplace.scss';
import RechargeModal from '../RechargeModal/RechargeModal';
import { motion } from 'framer-motion';

const Marketplace = () => {
  const [view, setView] = useState(null); // null | 'courses' | 'premium'
  const [courses, setCourses] = useState([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/courses/getallcourses')
      .then(response => setCourses(response.data))
      .catch(error => console.error("Erreur lors de la récupération des cours :", error));
  }, []);

  const handleAccessPremium = async (courseId) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      alert("Utilisateur non connecté !");
      return;
    }

    let userId = null;

    try {
      const user = JSON.parse(storedUser);
      userId = user?._id || user?.id; // accepte _id ou id selon le format

      console.log("✅ Utilisateur détecté :", user);
      console.log("🆔 ID utilisateur extrait :", userId);
    } catch (error) {
      console.error("❌ Erreur lors du parsing de l'utilisateur :", error);
      alert("Erreur de session utilisateur !");
      return;
    }

    if (!userId) {
      alert("❌ Impossible de récupérer l'ID utilisateur !");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3000/courses/access/${courseId}`, {
        userId,
      });

      if (response.status === 200) {
        window.open(response.data.meetLink, "_blank");
        alert(`✅ Accès autorisé. Nouveau solde : ${response.data.remainingBalance} DT`);
      }
    } catch (err) {
      console.error("❌ Erreur dans handleAccessPremium :", err);
      if (err.response?.status === 403) {
        alert("❌ Solde insuffisant pour accéder à ce cours.");
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
      const response = await axios.get(fileUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur de téléchargement :', error);
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
            {normalCourses.map((course) => (
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
            {premiumCourses.map((course) => (
              <motion.div key={course._id} className="course-card premium" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2>{course.title}</h2>
                <p>{course.category}</p>
                <p><strong>Instructeur :</strong> {course.instructor?.name || "Inconnu"}</p>
                <p>💰 Prix : {course.price}DT</p>
                {course.meetLink && (
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
        <motion.div className="select-card" onClick={() => setView('courses')} whileHover={{ scale: 1.05 }}>
          📘 <h3>Courses</h3>
        </motion.div>
        <motion.div className="select-card" onClick={() => setView('premium')} whileHover={{ scale: 1.05 }}>
          🔥 <h3>Premium Courses</h3>
        </motion.div>
        <motion.div className="select-card" onClick={() => navigate("/publication")} whileHover={{ scale: 1.05 }}>
          🤝 <h3>Exchange Skills</h3>
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
