import React, { useState } from "react";
import "./ExamComponent.scss";

const ExamComponent = ({ exam = [], packId, onFinish }) => {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const handleAnswer = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleSubmit = async () => {
    let correct = 0;
    exam.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });

    const finalScore = `${correct} / ${exam.length}`;
    setScore(finalScore);

    if (onFinish) onFinish(finalScore);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/users/save-exam-score/${packId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: finalScore }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Erreur API :", err);
      } else {
        console.log("✅ Score enregistré avec succès !");
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'enregistrement du score :", error);
    }
  };

  if (!exam.length) {
    return <p>Aucun examen n’est disponible pour ce pack.</p>;
  }

  return (
    <div className="exam-container">
      <h3>📝 Examen final du pack</h3>

      {exam.map((q, i) => (
        <div key={i} className="exam-question">
          <p><strong>Q{i + 1} :</strong> {q.question}</p>
          {q.options.map((opt, j) => (
            <label key={j} className="exam-option">
              <input
                type="radio"
                name={`q-${i}`}
                value={opt}
                checked={answers[i] === opt}
                onChange={() => handleAnswer(i, opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      {score ? (
        <p className="exam-score">✅ Note obtenue : <strong>{score}</strong></p>
      ) : (
        <button className="submit-exam-btn" onClick={handleSubmit}>
          ✅ Valider l'examen
        </button>
      )}
    </div>
  );
};

export default ExamComponent;
