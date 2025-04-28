// src/components/frontoffice/RobotAssistant/RobotAssistant.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import './RobotAssistant.scss';

const RobotAssistant = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const recognitionRef = useRef(null);

  const askRobot = async () => {
    if (!question.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3000/api/robot/ask', { question });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error('Erreur en interrogeant le robot IA :', err);
      setAnswer('❌ Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeSpeaking = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Votre navigateur ne supporte pas la reconnaissance vocale.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setQuestion(prev => prev ? prev + ' ' + speechResult : speechResult);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Erreur de reconnaissance vocale :', event.error);
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <>
      {isMinimized ? (
        <div className="robot-minimized" onClick={() => setIsMinimized(false)}>
          🤖 Assistant IA 🔼
        </div>
      ) : (
        <div className="robot-assistant">
          <div className="robot-header">
            <h2>🤖 Assistant IA</h2>
            <div className="robot-controls">
              <button className="minimize-btn" onClick={() => setIsMinimized(true)}>➖</button>
              <button className="close-btn" onClick={onClose}>✖️</button>
            </div>
          </div>

          <div className="robot-body">
            <textarea
              placeholder="Pose ta question ici..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="question-actions">
              <button onClick={askRobot} disabled={loading} className="ask-btn">
                {loading ? 'Chargement...' : 'Poser la question'}
              </button>

              <button
                onClick={listening ? stopListening : startListening}
                className={`mic-btn ${listening ? 'listening' : ''}`}
              >
                {listening ? '🛑 Stop Voice' : '🎙️ Parler'}
              </button>
            </div>

            {answer && (
              <div className="answer-container">
                <div className="answer-text">
                  {answer.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="audio-controls">
                  {!isSpeaking && (
                    <button onClick={() => speakText(answer)} className="speak-btn">
                      🎤 Écouter
                    </button>
                  )}
                  {isSpeaking && !isPaused && (
                    <button onClick={pauseSpeaking} className="stop-btn">
                      ⏸️ Pause
                    </button>
                  )}
                  {isSpeaking && isPaused && (
                    <button onClick={resumeSpeaking} className="speak-btn">
                      ▶️ Continuer
                    </button>
                  )}
                  {isSpeaking && (
                    <button onClick={stopSpeaking} className="stop-btn">
                      🛑 Stop
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RobotAssistant;
