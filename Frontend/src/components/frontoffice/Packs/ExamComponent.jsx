import React, { useState } from "react";
import "./ExamComponent.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";

const ExamComponent = ({ exam = [], packId, onFinish }) => {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize();

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

      const scorePercentage = (correct / exam.length) * 100;

      if (!res.ok) {
        const err = await res.json();
        console.error("API error:", err);
      } else {
        if (scorePercentage >= 70) {
          toast.success(`🎉 Congrats! You passed the exam with ${scorePercentage.toFixed(0)}%!`, {
            position: "top-right",
            autoClose: 5000,
          });

          const celebrationSound = new Audio("/congrat.mp3");
          celebrationSound.play();

          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 10000);
        } else {
          toast.info(`😕 You got ${scorePercentage.toFixed(0)}%. Try again to pass!`, {
            position: "top-right",
            autoClose: 5000,
          });
        }
      }
    } catch (error) {
      console.error("❌ Error saving score:", error);
      toast.error("An error occurred while saving your score.");
    }
  };

  if (!exam.length) {
    return <p>No exam is available for this pack.</p>;
  }

  return (
    <div className="exam-container">
      {showConfetti && <Confetti width={width} height={height} />}
      <h3>📝 Final Exam for this Pack</h3>

      {exam.map((q, i) => (
        <div key={i} className="exam-question">
          <p><strong>Q{i + 1}:</strong> {q.question}</p>
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
        <p className="exam-score">✅ Your Score: <strong>{score}</strong></p>
      ) : (
        <button className="submit-exam-btn" onClick={handleSubmit}>
          ✅ Submit Exam
        </button>
      )}
    </div>
  );
};

export default ExamComponent;
