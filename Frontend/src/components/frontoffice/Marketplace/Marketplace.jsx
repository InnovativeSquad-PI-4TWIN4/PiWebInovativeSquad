import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Marketplace.scss';
import { motion } from 'framer-motion';

const Marketplace = () => {
  const [view, setView] = useState(null); // null | 'courses' | 'premium'
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/courses/getallcourses')
      .then(response => setCourses(response.data))
      .catch(error => console.error("Erreur lors de la récupération des cours :", error));
  }, []);

  const handleAccessPremium = async (courseId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Utilisateur non connecté !");

    try {
      const response = await axios.post(`http://localhost:3000/courses/access/${courseId}`, { userId });
      if (response.status === 200) {
        window.open(response.data.meetLink, "_blank");
        alert(`✅ Accès autorisé. Nouveau solde : ${response.data.remainingBalance} DT`);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        alert("❌ Solde insuffisant pour accéder à ce cours.");
      } else {
        alert("Erreur serveur.");
      }
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
                  <a href={`http://localhost:3000${course.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="download-btn">
                    Télécharger PDF
                  </a>
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
    </section>
  );
};

export default Marketplace;
