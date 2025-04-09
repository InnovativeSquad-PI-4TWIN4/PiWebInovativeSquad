import React, { useState } from "react";
import "./SmartQuizModal.scss";

const SmartQuizModal = ({ quiz, onClose }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (index, value) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  return (
    <div className="smart-quiz-modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>🧠 Quiz IA</h2>

        {quiz.map((q, i) => (
          <div className="question-block" key={i}>
            <p className="question"><strong>{i + 1}. {q.question}</strong></p>

            {q.type === "mcq" && q.options.map((opt, idx) => (
              <label key={idx} className="option">
                <input
                  type="radio"
                  name={`q-${i}`}
                  value={opt}
                  checked={answers[i] === opt}
                  onChange={() => handleSelect(i, opt)}
                  disabled={showResults}
                />
                {opt}
              </label>
            ))}

            {q.type === "boolean" && ["Vrai", "Faux"].map((bool, idx) => (
              <label key={idx} className="option">
                <input
                  type="radio"
                  name={`q-${i}`}
                  value={bool === "Vrai"}
                  checked={answers[i] === (bool === "Vrai")}
                  onChange={() => handleSelect(i, bool === "Vrai")}
                  disabled={showResults}
                />
                {bool}
              </label>
            ))}

            {showResults && (
              <div className={`result ${answers[i] === q.correctAnswer ? 'correct' : 'incorrect'}`}>
                <p>✅ Réponse correcte : {q.type === "boolean" ? (q.correctAnswer ? "Vrai" : "Faux") : q.correctAnswer}</p>
                <small>💡 {q.explanation}</small>
              </div>
            )}
          </div>
        ))}

        {!showResults ? (
          <button className="submit-btn" onClick={handleSubmit}>Soumettre</button>
        ) : (
          <p className="thanks-msg">🎉 Merci d'avoir complété le quiz !</p>
        )}
      </div>
    </div>
  );
};

export default SmartQuizModal;
