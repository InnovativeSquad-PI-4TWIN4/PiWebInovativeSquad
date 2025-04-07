import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import './PremiumCourses.scss';
import RechargeModal from '../RechargeModal/RechargeModal';
import SmartQuizModal from "./SmartQuizModal";


const socket = io("http://localhost:3000");

const PremiumCourses = () => {
  const [courses, setCourses] = useState([]);
  const [paidCourses, setPaidCourses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [highlightedCourseId, setHighlightedCourseId] = useState(null);
  const [generatedQuiz, setGeneratedQuiz] = useState({});
  const [showQuizModal, setShowQuizModal] = useState(false); // ✅ pour gérer le popup
  const [activeQuiz, setActiveQuiz] = useState(null); // ✅ pour savoir quel quiz on affiche

  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id || user?.id;
  const paidKey = `paidCourses_${userId}`;

  useEffect(() => {
    const lastHighlightedId = localStorage.getItem("highlightedCourseId");
    if (lastHighlightedId) {
      setHighlightedCourseId(lastHighlightedId);
      setTimeout(() => localStorage.removeItem("highlightedCourseId"), 8000);
    }

    loadCourses();
    const paid = JSON.parse(localStorage.getItem(paidKey)) || [];
    setPaidCourses(paid);

    if (userId) {
      axios.get(`http://localhost:3000/favorites/${userId}`)
        .then(res => setFavorites(res.data.map(c => c._id)))
        .catch(err => console.error("Erreur chargement des favoris :", err));
    }

    socket.on("newPremiumCourse", (newCourse) => {
      const audio = new Audio("/notif.mp3");
      audio.play();

      toast.info(
        <div
          onClick={() => {
            localStorage.setItem("highlightedCourseId", newCourse._id || newCourse.id);
            navigate("/marketplace/premium");
          }}
          style={{ cursor: 'pointer' }}
        >
          🆕 Nouveau cours premium : <strong>{newCourse.title}</strong><br />
          👉 Cliquez ici pour le voir
        </div>,
        { autoClose: 7000 }
      );

      const newId = newCourse._id || newCourse.id;
      setHighlightedCourseId(newId);
      setTimeout(() => loadCourses(), 700);
    });

    return () => {
      socket.off("newPremiumCourse");
    };
  }, [userId]);

  const loadCourses = () => {
    axios.get("http://localhost:3000/courses/getallcourses")
      .then(res => {
        const premium = res.data.filter(c => c.isPremium);
        setCourses(premium);
      })
      .catch(err => console.error("Erreur chargement des cours premium :", err));
  };

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

  const handleGenerateQuiz = async (courseId) => {
    try {
      const res = await axios.post(`http://localhost:3000/premium/generate-quiz/${courseId}`);
      if (res.data.quiz) {
        setGeneratedQuiz(prev => ({ ...prev, [courseId]: res.data.quiz }));
        setActiveQuiz({ courseId, quiz: res.data.quiz }); // ✅ ouvrir avec le quiz
        setShowQuizModal(true);
      }
    } catch (err) {
      alert("❌ Erreur lors de la génération du quiz.");
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
            className={`course-card premium ${highlightedCourseId === course._id ? "highlighted" : ""}`}
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
            {course.courseSummary && <p><strong>Résumé :</strong> {course.courseSummary}</p>}

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

            {course.courseSummary && (
              <button className="quiz-btn" onClick={() => handleGenerateQuiz(course._id)}>
                🧠 Générer le quiz IA
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* ✅ MODAL QUIZ */}
      {showQuizModal && activeQuiz && (
        <SmartQuizModal
          quiz={activeQuiz.quiz}
          onClose={() => {
            setShowQuizModal(false);
            setActiveQuiz(null);
          }}
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
