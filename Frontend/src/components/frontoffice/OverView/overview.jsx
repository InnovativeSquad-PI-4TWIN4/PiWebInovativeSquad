import React, { useState, useEffect } from 'react';
import './overview.scss';

const Overview = () => {
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [scores, setScores] = useState({});
  const [showAnimations, setShowAnimations] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer
  const [quizProgress, setQuizProgress] = useState({}); // Track progress for each challenge
  const [quizQuestions, setQuizQuestions] = useState({}); // Store questions for each challenge

  // Sample challenges data
  const challenges = [
    {
      id: 1,
      title: "JavaScript Quiz",
      description: "Test your JavaScript knowledge with 10 questions.",
      difficulty: "Medium",
      icon: "💻",
      background: "linear-gradient(135deg, rgb(0, 84, 45), rgb(0, 57, 75))",
      details: {
        instructions: "Answer the following JavaScript questions.",
        generateQuestions: () => {
          const questions = [
            { question: "What is the output of `typeof null`?", options: ["object", "null", "undefined", "boolean"], answer: "object" },
            { question: "Which method adds an element to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: "push()" },
            { question: "What does `===` operator check?", options: ["Value only", "Value and type", "Type only", "None of the above"], answer: "Value and type" },
            { question: "What is the purpose of `use strict` in JavaScript?", options: ["Enforce stricter type checking", "Enable ES6 features", "Enforce better coding practices", "None of the above"], answer: "Enforce better coding practices" },
            { question: "What is the output of `2 + '2'`?", options: ["4", "22", "NaN", "Error"], answer: "22" },
            { question: "Which keyword is used to declare a variable in ES6?", options: ["var", "let", "const", "both let and const"], answer: "both let and const" },
            { question: "What is the output of `[] + []`?", options: ["[]", "[object Object]", "''", "Error"], answer: "''" },
            { question: "What does `NaN` stand for?", options: ["Not a Number", "Null and None", "No applicable Number", "None of the above"], answer: "Not a Number" },
            { question: "Which function is used to parse a string to an integer?", options: ["parseInt()", "parseFloat()", "Number()", "toInteger()"], answer: "parseInt()" },
            { question: "What is the output of `typeof NaN`?", options: ["number", "NaN", "undefined", "object"], answer: "number" },
          ];
          return questions.sort(() => Math.random() - 0.5); // Shuffle questions
        },
      },
    },
    {
      id: 2,
      title: "React Quiz",
      description: "Test your React knowledge with 10 questions.",
      difficulty: "Medium",
      icon: "⚛️",
      background: "linear-gradient(135deg, rgb(198, 16, 0), rgb(109, 89, 9))",
      details: {
        instructions: "Answer the following React questions.",
        generateQuestions: () => {
          const questions = [
            { question: "What is React?", options: ["A JavaScript library", "A programming language", "A database", "A CSS framework"], answer: "A JavaScript library" },
            { question: "What is JSX?", options: ["A syntax extension for JavaScript", "A CSS preprocessor", "A database query language", "A testing framework"], answer: "A syntax extension for JavaScript" },
            { question: "What is the purpose of `useState` in React?", options: ["To manage state", "To fetch data", "To style components", "To handle routing"], answer: "To manage state" },
            { question: "What is the virtual DOM?", options: ["A lightweight copy of the real DOM", "A database", "A CSS framework", "A testing tool"], answer: "A lightweight copy of the real DOM" },
            { question: "What is the output of `ReactDOM.render(<App />, document.getElementById('root'))`?", options: ["Renders the App component to the DOM", "Throws an error", "Does nothing", "Creates a new component"], answer: "Renders the App component to the DOM" },
            { question: "What is the purpose of `useEffect` in React?", options: ["To perform side effects", "To manage state", "To style components", "To handle routing"], answer: "To perform side effects" },
            { question: "What is a higher-order component (HOC)?", options: ["A function that takes a component and returns a new component", "A component that renders other components", "A state management tool", "A CSS framework"], answer: "A function that takes a component and returns a new component" },
            { question: "What is the purpose of `key` prop in React?", options: ["To uniquely identify elements in a list", "To style components", "To manage state", "To handle routing"], answer: "To uniquely identify elements in a list" },
            { question: "What is React Router?", options: ["A library for routing in React", "A state management tool", "A CSS framework", "A testing tool"], answer: "A library for routing in React" },
            { question: "What is the purpose of `props` in React?", options: ["To pass data between components", "To manage state", "To style components", "To handle routing"], answer: "To pass data between components" },
          ];
          return questions.sort(() => Math.random() - 0.5); // Shuffle questions
        },
      },
    },
  ];

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleChallengeClick = (id) => {
    if (activeChallenge === id) {
      // Close the quiz and reset progress
      setActiveChallenge(null);
      setQuizQuestions((prev) => ({ ...prev, [id]: null }));
      setQuizProgress((prev) => ({ ...prev, [id]: 0 }));
      setUserAnswers((prev) => ({ ...prev, [id]: {} }));
    } else {
      // Open the quiz and generate new questions
      setActiveChallenge(id);
      const challenge = challenges.find((c) => c.id === id);
      if (challenge) {
        const questions = challenge.details.generateQuestions();
        setQuizQuestions((prev) => ({ ...prev, [id]: questions }));
      }
    }
  };

  const handleAnswerChange = (id, questionIndex, answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [id]: {
        ...prevAnswers[id],
        [questionIndex]: answer,
      },
    }));
    setQuizProgress((prevProgress) => ({
      ...prevProgress,
      [id]: (prevProgress[id] || 0) + 1,
    }));
  };

  const handleCompleteChallenge = (id) => {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge || !quizQuestions[id]) return;

    const questions = quizQuestions[id];
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
        {challenges.map((challenge) => (
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
              className="quiz-toggle-button"
              onClick={() => handleChallengeClick(challenge.id)}
            >
              {activeChallenge === challenge.id ? "Close Quiz" : "Start Quiz"}
            </button>
            {activeChallenge === challenge.id && quizQuestions[challenge.id] && (
              <div className="challenge-details">
                <h4>Instructions</h4>
                <p>{challenge.details.instructions}</p>
                <div className="quiz-progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${(quizProgress[challenge.id] || 0) * 10}%` }}
                  ></div>
                </div>
                {quizQuestions[challenge.id].map((question, index) => (
                  <div key={index} className="quiz-question">
                    <h5>{question.question}</h5>
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex}>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          onChange={() => handleAnswerChange(challenge.id, index, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ))}
                <button
                  className="start-button"
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