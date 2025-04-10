import React, { useState } from "react";
import "./ExamComponent.scss";

const ExamComponent = ({ exam = [], onFinish }) => {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const handleAnswer = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleSubmit = () => {
    let correct = 0;
    exam.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });

    const finalScore = `${correct} / ${exam.length}`;
    setScore(finalScore);

    if (onFinish) onFinish(finalScore);
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
        <p className="exam-score"> Note obtenue : <strong>{score}</strong></p>
      ) : (
        <button className="submit-exam-btn" onClick={handleSubmit}>
          ✅ Valider l'examen
        </button>
      )}
    </div>
  );
};

export default ExamComponent;
