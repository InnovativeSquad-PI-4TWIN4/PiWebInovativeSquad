import React, { useEffect, useState } from "react";
import { FaLock, FaCheckCircle, FaFilePdf } from "react-icons/fa";
import axios from "axios";
import ExamComponent from "./ExamComponent";
import "./PackProgress.scss";

const PackProgress = ({ packId }) => {
  const [resources, setResources] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [exam, setExam] = useState([]);
  const [existingScore, setExistingScore] = useState(null);
  const [allPdfsOpened, setAllPdfsOpened] = useState(false);
  const [showExam, setShowExam] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:3000/users/pdf-progress/${packId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompleted(res.data.completedPdfs || []);
    };

    const fetchPdfs = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/packs/${packId}/pdfs`);
        const fixedData = res.data.pdfs.map((pdf) => ({
          ...pdf,
          url: pdf.url.startsWith("http") ? pdf.url : `http://localhost:3000${pdf.url}`,
        }));
        setResources(fixedData);
      } catch (err) {
        console.error("Erreur lors du chargement des PDF :", err);
      }
    };

    const fetchExam = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/packs/getPackById/${packId}`);
        setExam(res.data.exam?.questions || []);
      } catch (err) {
        console.error("Erreur lors du chargement de l'examen:", err);
      }
    };

    const fetchScore = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/users/get-exam-score/${packId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.score) setExistingScore(res.data.score);
      } catch (err) {
        console.error("Erreur lors du chargement du score:", err);
      }
    };

    if (packId) {
      fetchPdfs();
      fetchProgress();
      fetchExam();
      fetchScore();
    }
  }, [packId]);

  useEffect(() => {
    if (resources.length > 0 && completed.length === resources.length) {
      setAllPdfsOpened(true);
    }
  }, [resources, completed]);

  const handleOpen = async (res) => {
    window.open(res.url, "_blank");

    if (!completed.includes(res._id)) {
      setCompleted((prev) => [...prev, res._id]);

      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/users/pdf-progress/${packId}`,
        { pdfId: res._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    }
  };

  return (
    <div className="pack-progress-container">
      {resources.map((res, index) => {
        const isUnlocked = index === 0 || completed.includes(resources[index - 1]._id);
        const isDone = completed.includes(res._id);

        return (
          <div className="pack-item" key={res._id}>
            <div className={`status-icon ${isDone ? "done" : isUnlocked ? "unlocked" : "locked"}`}>
              {isDone ? <FaCheckCircle /> : isUnlocked ? <FaFilePdf /> : <FaLock />}
            </div>
            <div className="pack-content">
              <p>{res.title}</p>
              <button className="open-button" onClick={() => handleOpen(res)} disabled={!isUnlocked}>
                {isUnlocked ? "Ouvrir" : "Verrouillé"}
              </button>
            </div>
          </div>
        );
      })}

      {allPdfsOpened && existingScore && (
        <div className="exam-score-display">
          <hr />
          <p>🎓 You had already passed the exam. Mark  : <strong>{existingScore}</strong></p>
        </div>
      )}

      {allPdfsOpened && !existingScore && !showExam && (
        <div className="exam-section">
          <hr />
          <button className="start-exam-btn" onClick={() => setShowExam(true)}>
            🎓 Start Exam
          </button>
        </div>
      )}

      {showExam && !existingScore && (
        <div className="exam-section">
          <hr />
          <ExamComponent exam={exam} packId={packId} />
        </div>
      )}
    </div>
  );
};

export default PackProgress;