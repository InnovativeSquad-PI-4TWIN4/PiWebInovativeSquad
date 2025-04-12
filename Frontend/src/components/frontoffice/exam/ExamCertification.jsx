import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./ExamCertification.scss";

const ExamCertification = ({ onUserUpdate }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const { category } = useParams();

  const normalizeCategory = (cat) => {
    const map = {
      programmation: "Programmation",
      design: "Design",
      marketing: "Marketing",
      reseau: "Réseau",
      devweb: "Développement Web",
      mobile: "Développement Mobile",
      math: "Mathématique",
    };
    return map[cat.toLowerCase()] || cat;
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.post("http://localhost:3000/api/exam-ai/generate", { category });
        if (Array.isArray(res.data.exam)) {
          setQuestions(res.data.exam);
        }
      } catch (err) {
        console.error("❌ Erreur génération exam IA", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [category]);

  const handleChange = (questionIndex, selected) => {
    setAnswers({ ...answers, [questionIndex]: selected });
  };

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) correct++;
    });
    setScore(correct);

    if (correct >= 3) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const normalizedCategory = normalizeCategory(category);

        // Envoi de l'email
        await axios.post("http://localhost:3000/api/email/send-success-certificate", {
          to: user.email,
          name: user.name,
          score: correct,
          category: normalizedCategory,
        });

        // Mise à jour dans la BDD
        await axios.post("http://localhost:3000/api/users/mark-certified", {
          email: user.email,
        });

        // Récupération utilisateur mis à jour depuis backend
        const res = await axios.get(`http://localhost:3000/api/users/email/${user.email}`);
        const updatedUser = res.data;

        // ✅ Mise à jour du localStorage + propagation via App
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (onUserUpdate) {
          console.log("📢 Mise à jour transmise à App.jsx");
          onUserUpdate(updatedUser); // ✅ ✅ ✅ Correction ici
        }

        alert("🎉 Félicitations ! Le certificat a été envoyé par email !");
      } catch (err) {
        console.error("Erreur envoi certificat", err);
        alert("✅ Quiz validé mais erreur d’envoi de certificat.");
      }
    }
  };

  return (
    <div className="exam-container" style={{ padding: "30px", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>
        🎓 Examen IA – <span style={{ textTransform: "capitalize" }}>{normalizeCategory(category)}</span>
      </h2>

      {loading ? (
        <p>⏳ Chargement des questions...</p>
      ) : (
        <form className="exam-form" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {questions.map((q, idx) => (
            <div key={idx} style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <p><strong>Q{idx + 1}:</strong> {q.question}</p>
              {q.choices.map((letter) => (
                <label key={letter} style={{ display: "block", margin: "8px 0", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#f9f9f9", color: "#222", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={letter}
                    onChange={() => handleChange(idx, letter)}
                    checked={answers[idx] === letter}
                    style={{ marginRight: "10px" }}
                  />
                  <span>{letter}. {q.answers[letter]}</span>
                </label>
              ))}
            </div>
          ))}

          <button
            type="button"
            onClick={handleSubmit}
            style={{ marginTop: "30px", backgroundColor: "#4caf50", color: "white", padding: "12px 24px", border: "none", borderRadius: "5px", fontSize: "16px", cursor: "pointer" }}
          >
            ✅ Soumettre l’examen
          </button>

          {score !== null && (
            <p style={{ fontSize: "18px", marginTop: "20px", color: score >= 3 ? "green" : "red" }}>
              Résultat : {score}/5 {score >= 3 ? "✅ Certificat validé !" : "❌ Échec, réessayez"}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default ExamCertification;
