import React, { useEffect, useState } from "react";
import { FaLock, FaCheckCircle, FaFilePdf } from "react-icons/fa";
import axios from "axios";
import ExamComponent from "./ExamComponent"; // Assure-toi que ce fichier existe
import "./PackProgress.scss";

const PackProgress = ({ packId }) => {
  const [resources, setResources] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [exam, setExam] = useState([]);
  const [allPdfsOpened, setAllPdfsOpened] = useState(false);
  const [showExam, setShowExam] = useState(false); // ⬅️ Ajout ici

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
        setExam(res.data.exam || []);
      } catch (err) {
        console.error("Erreur lors du chargement de l'examen:", err);
      }
    };

    if (packId) {
      fetchPdfs();
      fetchProgress();
      fetchExam();
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

{allPdfsOpened  && !showExam && (
  <div className="exam-section">
    <hr />
    <button className="start-exam-btn" onClick={() => setShowExam(true)}>
      🎓 Commencer l'examen
    </button>
  </div>
)}

{showExam && (
  <div className="exam-section">
    <hr />
    <ExamComponent exam={exam.questions || []} />
    </div>
)}

    </div>
  );
};

export default PackProgress;