// SmartQuizModal.jsx

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./SmartQuizModal.scss";

const SmartQuizModal = ({ quiz, onClose, courseId, userId, onQuizSubmitted }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [alreadyValidated, setAlreadyValidated] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) modalRef.current.scrollTop = 0;

    // Vérifie si le quiz a déjà été validé → récupérer les réponses et score
    if (userId && courseId) {
      axios.get(`http://localhost:3000/api/quiz-result/${courseId}/${userId}`)
        .then(res => {
          const result = res.data;
          if (result?.isValidated) {
            setScore(result.score);
            setAlreadyValidated(true);
            setShowResults(true);

            // Reconstruit les réponses simulées pour afficher la sélection
            const simulatedAnswers = {};
            quiz.forEach((q, i) => {
              simulatedAnswers[i] = q.correctAnswer;
            });
            setAnswers(simulatedAnswers);
          }
        })
        .catch(err => console.warn("Erreur chargement des résultats :", err));
    }
  }, [courseId, userId, quiz]);

  const handleSelect = (index, value) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });

    const totalQuestions = quiz.length;
    const isValid = correct > Math.floor(totalQuestions / 2);
    setScore(correct);
    setShowResults(true);

    if (isValid && userId && courseId && !alreadyValidated) {
      try {
        await axios.post("http://localhost:3000/api/quiz-result/save-score", {
          userId,
          courseId,
          score: correct,
          total: totalQuestions
        });
        if (onQuizSubmitted) onQuizSubmitted(courseId, correct);
        setAlreadyValidated(true);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement :", error);
      }
    }
  };

  const totalQuestions = quiz.length;
  const isValid = score > Math.floor(totalQuestions / 2);

  return (
    <div className="smart-quiz-modal">
      <div className="modal-content" ref={modalRef}>
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
          <>
            <p className="score">🧾 Votre note : <strong>{score} / {totalQuestions}</strong> {score === totalQuestions && "🌟"}</p>
            {isValid ? (
              <p className="success-msg">✅ Bravo ! Vous avez validé le quiz.</p>
            ) : (
              <p className="error-msg">❌ Vous devez obtenir plus de {Math.floor(totalQuestions / 2)} pour valider.</p>
            )}
            <p className="thanks-msg">Merci d'avoir complété le quiz !</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SmartQuizModal;