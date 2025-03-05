import React, { useState, useEffect } from 'react';
import { quizData } from './quizData'; // Import the quiz data
import './overview.scss';

const Overview = () => {
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [scores, setScores] = useState({});
  const [showAnimations, setShowAnimations] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer
  const [quizProgress, setQuizProgress] = useState({}); // Track progress for each challenge
  const [randomizedQuestions, setRandomizedQuestions] = useState({}); // Store randomized questions

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Function to shuffle an array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleChallengeClick = (id) => {
    if (activeChallenge === id) {
      // Close the quiz and reset progress
      setActiveChallenge(null);
      setQuizProgress((prev) => ({ ...prev, [id]: 0 }));
      setUserAnswers((prev) => ({ ...prev, [id]: {} }));
    } else {
      // Open the quiz and randomize questions
      setActiveChallenge(id);
      const challenge = quizData.find((c) => c.id === id);
      if (challenge) {
        const allQuestions = challenge.details.questions;
        const shuffledQuestions = shuffleArray([...allQuestions]).slice(0, 10); // Select 10 random questions
        const randomizedQuestionsWithShuffledOptions = shuffledQuestions.map((q) => ({
          ...q,
          options: shuffleArray([...q.options]), // Shuffle options
        }));
        setRandomizedQuestions((prev) => ({ ...prev, [id]: randomizedQuestionsWithShuffledOptions }));
      }
    }
  };

  const handleAnswerChange = (id, questionIndex, answer) => {
    setUserAnswers((prevAnswers) => {
      const updatedAnswers = {
        ...prevAnswers,
        [id]: {
          ...prevAnswers[id],
          [questionIndex]: prevAnswers[id]?.[questionIndex] === answer ? null : answer,
        },
      };

      // Calculate progress
      const progress = Object.values(updatedAnswers[id]).filter(Boolean).length;
      setQuizProgress((prevProgress) => ({
        ...prevProgress,
        [id]: progress,
      }));

      return updatedAnswers;
    });
  };

  const handleCompleteChallenge = (id) => {
    const challenge = quizData.find((c) => c.id === id);
    if (!challenge) return;

    const questions = randomizedQuestions[id];
    const userAnswersForChallenge = userAnswers[id] || {};
    let correctAnswers = 0;

    questions.forEach((question, index) => {
      if (userAnswersForChallenge[index] === question.answer) {
        correctAnswers++;
      }
    });

    const score = Math.floor((correctAnswers / questions.length) * 100);
    setScores((prevScores) => ({ ...prevScores, [id]: score }));
    if (score === 100) {
      setShowAnimations((prevAnimations) => ({ ...prevAnimations, [id]: true }));
    } else {
      setShowAnimations((prevAnimations) => ({ ...prevAnimations, [id]: false }));
    }
  };

  return (
    <div className="overview">
      <div className="hero-section">
        <h1>Challenges & Games</h1>
        <p>Test your skills and compete with others in advanced challenges.</p>
      </div>

      <div className="challenges-grid">
        {quizData.map((challenge) => (
          <div
            key={challenge.id}
            className={`challenge-card ${activeChallenge === challenge.id ? 'active' : ''}`}
            style={{ background: challenge.background }}
          >
            <div className="challenge-icon">{challenge.icon}</div>
            <h3>{challenge.title}</h3>
            <p>{challenge.description}</p>
            <div className="difficulty-badge">{challenge.difficulty}</div>
            <button
              className={`quiz-toggle-button ${activeChallenge === challenge.id ? 'close-button' : 'start-button'}`}
              onClick={() => handleChallengeClick(challenge.id)}
            >
              {activeChallenge === challenge.id ? "Close Quiz" : "Start Quiz"}
            </button>
            {activeChallenge === challenge.id && randomizedQuestions[challenge.id] && (
              <div className="challenge-details">
                <h4>Instructions</h4>
                <p>{challenge.details.instructions}</p>
                <div className="quiz-progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${(quizProgress[challenge.id] || 0) * 10}%` }}
                  ></div>
                </div>
                {randomizedQuestions[challenge.id].map((question, index) => (
                  <div key={index} className="quiz-question">
                    <h5>{question.question}</h5>
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex}>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={userAnswers[challenge.id]?.[index] === option}
                          onChange={() => handleAnswerChange(challenge.id, index, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ))}
                <button
                  className="complete-button"
                  onClick={() => handleCompleteChallenge(challenge.id)}
                >
                  Complete Challenge
                </button>
                {scores[challenge.id] !== undefined && (
                  <div className="challenge-result">
                    <h4>Your Score: {scores[challenge.id]}</h4>
                    {scores[challenge.id] === 100 ? (
                      showAnimations[challenge.id] && (
                        <div className="congrats-animation">
                          🎉 Congratulations! You nailed it! 🎉
                        </div>
                      )
                    ) : (
                      <ul>
                        <li>Tips to improve:</li>
                        <li>- Review JavaScript fundamentals.</li>
                        <li>- Practice more coding challenges.</li>
                        <li>- Take online courses to enhance your skills.</li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;