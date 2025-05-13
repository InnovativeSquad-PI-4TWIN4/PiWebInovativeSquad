import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import 'highlight.js/styles/atom-one-dark.css'; // 🌙 Dark mode pour le markdown
const socket = io("http://localhost:3000");
import './CodeRoom.scss';

const CodeRoom = () => {
  const { roomId } = useParams();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isMuted, setIsMuted] = useState(false);
  const [callStartedAt, setCallStartedAt] = useState(null); 
  const [callDuration, setCallDuration] = useState('00:00');
  const [showValidation, setShowValidation] = useState(false);
  const [user, setUser] = useState(null);
  const [validationSent, setValidationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [quiz, setQuiz] = useState([]);
const [showQuiz, setShowQuiz] = useState(false);
const [quizAnswers, setQuizAnswers] = useState({});
const [quizValidated, setQuizValidated] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const localStream = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      console.warn("⚠️ No user found in localStorage");
    }
    socket.emit("join-room", roomId);
    console.log(`✅ Joined room: ${roomId}`);
    socket.on("exchange-completed", () => {
      alert("✅ Exchange completed successfully! Redirecting to your profile...");
      navigate("/profiles");
    });
    
    socket.on("user-joined", (data) => {
      toast.success(`✅ ${data.username || "A user"} joined the room!`);
    });
    socket.on("init", (initialCode) => {
      setCode(initialCode);
    });

    socket.on("code-change", (newCode) => {
      setCode(newCode);
    });

    socket.on("call-made", async (data) => {
      const pc = peerConnection.current;
    
      if (pc.signalingState !== "stable") {
        console.warn("⏳ Skipping setRemoteDescription because state is:", pc.signalingState);
        return;
      }
    
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
    
      socket.emit("make-answer", { answer, to: data.socket });
    });
    

    socket.on("answer-made", async (data) => {
      const pc = peerConnection.current;
    
      if (pc.signalingState !== "have-local-offer") {
        console.warn("⚠️ Skipping answer because signaling state is not 'have-local-offer'");
        return;
      }
    
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    });
    

    socket.on("ice-candidate", async (data) => {
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("init");
      socket.off("code-change");
      socket.emit("leave-room", roomId);
    };
  }, [roomId]);

  useEffect(() => {
    let timerInterval;
    if (callStartedAt) {
      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartedAt) / 1000);
        const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        setCallDuration(`${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [callStartedAt]);

  const startCall = async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      peerConnection.current = new RTCPeerConnection();
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
      });

      peerConnection.current.onicecandidate = event => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, roomId });
        }
      };

      peerConnection.current.ontrack = event => {
        const audioElement = document.getElementById("remoteAudio");
        if (audioElement) {
          audioElement.srcObject = event.streams[0];
          playNotificationSound(); // ✅ Play sound when connected
        }
      };

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("make-call", { offer, roomId });

      console.log("📞 Calling...");
      setCallStartedAt(Date.now()); // 🕒 Start the timer
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3');
    audio.play().catch((e) => console.log("Audio autoplay blocked:", e));
  };

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const hangUp = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
    setCallStartedAt(null); // Stop the timer
    setCallDuration('00:00');
    console.log("❌ Call ended");
    // ✅ Show validation form after hangup
  setShowValidation(true);
  };
  const fetchQuiz = async () => {
    try {
      const res = await axios.post("http://localhost:3000/exchange-request/quiz", {
        code,
        language
      });
      setQuiz(res.data.quiz);
      setShowQuiz(true);
    } catch (err) {
      toast.error("❌ Failed to fetch quiz");
    }
  };
  
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("code-change", { roomId, code: newCode });
  };
  const exampleCodes = {
    javascript: `
  function greet(name) {
    return "Hello, " + name + "!";
  }
  console.log(greet("World"));
  `,
    python: `
  def greet(name):
      return "Hello, " + name
  
  print(greet("World"))
  `,
    html: `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Hello</title>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
  </html>
  `
  };
  // const generateExampleCode = async () => {
  //   try {
  //     setIsLoading(true);
  
  //     const response = await axios.post("https://api.openai.com/v1/chat/completions", {
  //       model: "gpt-3.5-turbo",
  //       messages: [
  //         { role: "system", content: "You are a coding assistant." },
  //         { role: "user", content: `Give me a beginner example code in ${language}.` }
  //       ]
  //     }, {
  //       headers: {
  //         Authorization: `Bearer ${openAiApiKey}`,
  //         "Content-Type": "application/json",
  //       },
  //     });
  
  //     const aiCode = response.data.choices[0].message.content;
  //     setCode(aiCode.trim());
  //   } catch (error) {
  //     if (error.response && error.response.status === 429) {
  //       alert("⚠️ Too many requests. Please wait and try again later.");
  //     } else {
  //       console.error("Error generating AI code:", error);
  //       alert("An error occurred while generating the code.");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleAICodeHelp = async () => {
    if (!aiPrompt.trim()) return toast.error("Please enter a description!");
    try {
      setAiLoading(true);
  
      const res = await axios.post("http://localhost:3000/exchange-request/generate-code", {
        prompt: aiPrompt,
        language
      });
  
      if (res.data?.generatedCode) {
        setCode(res.data.generatedCode.trim());
        toast.success("✅ Code généré avec succès !");
      } else {
        toast.error("⚠️ Aucune réponse de l'IA.");
      }
  
    } catch (err) {
      console.error("AI Error:", err);
      toast.error("❌ Erreur lors de l'appel à l'IA.");
    } finally {
      setAiLoading(false);
    }
  };
  
  const handleExplainCode = async () => {
    try {
      
      setIsLoading(true);
      setExplanation("");
  
      const response = await axios.post("http://localhost:3000/exchange-request/explain-code", {
        code,
        language,
      });
  
      if (response.data && response.data.explanation) {
        setExplanation(response.data.explanation);
toast.success("✅ Code explained by AI!", { autoClose: 3000 });
      } else {
        toast.error("❌ No explanation received.");
      }
    } catch (error) {
      console.error("Explain Error:", error);
      toast.error("❌ Failed to contact AI for explanation.");
    } finally {
      setIsLoading(false);
    }
  };
  
    
  const handleRun = () => {
    try {
      const consoleLog = [];
      const originalConsole = console.log;
      console.log = (msg) => consoleLog.push(msg);

      if (language === 'javascript') {
        eval(code);
      } else {
        consoleLog.push('⚡️ Code execution only for JavaScript.');
      }

      console.log = originalConsole;
      setOutput(consoleLog.join('\n'));
    } catch (err) {
      setOutput(`❌ Error: ${err.message}`);
    }
  };
  const handleAutoFix = async () => {
    try {
      setIsLoading(true);
  
      const response = await axios.post("http://localhost:3000/exchange-request/fix-code", {
        code,
        language,
      });
  
      if (response.data && response.data.fixedCode) {
        setCode(response.data.fixedCode.trim());
        toast.success("✅ Code improved by AI!");
      } else {
        toast.error("❌ AI couldn't fix the code.");
      }
    } catch (error) {
      console.error("AI Fix Error:", error);
      toast.error("❌ Failed to contact AI service.");
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const goBack = () => {
    navigate("/manage-profile");
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
      .then(() => alert('📋 Code copied to clipboard!'))
      .catch(() => alert('❌ Failed to copy!'));
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skillbridge-code.${language === 'html' ? 'html' : language === 'python' ? 'py' : 'js'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitValidation = async (result) => {
    try {
      if (!user || !user._id) {
        toast.error("User not loaded. Please refresh the page!");
        return;
      }
  
      const res = await fetch(`http://localhost:3000/exchange-request/${roomId}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user._id, result }),
      });
  
      if (res.ok) {
        toast.success("✅ Thank you! Your feedback is recorded."); // ✅ Beautiful toast
        setShowValidation(false); // ✅ Cache les boutons après vote

         // Après la validation, vérifier si l'échange est terminé
      const data = await res.json();
      if (data.exchangeCompleted) {
        socket.emit("exchange-completed", { roomId });
      }

      } else {
        throw new Error("Validation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Could not validate the exchange"); // ✅ Better error toast
    }
  };
  const iconButtonStyle = {
  padding: '10px',
  border: 'none',
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: '15px',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: '0.3s',
};

  
 
  return (
  // <div style={{ minHeight: '100vh', backgroundColor: '#121212', padding: '20px', color: '#e0e0e0' }}>
  <div className={`dashboard-container ${isLoading ? 'loading' : 'loaded'}`}>

    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
  
   {/* <h1  className="cyberpunk-title">
            <span className="title-main"> Private Room </span>
            <span className="title-divider">//</span>
            <span className="title-highlight">Collaboration</span>
          </h1> */}
          <header className="dashboard-header">
  <div className="cyberpunk-title-container">
    <div className="title-decorations">
      <div className="circuit-line left"></div>
      <div className="circuit-line right"></div>
    </div>
    
    <h1 className="cyberpunk-title">
      <span className="title-main">Code Room</span>
      <span className="title-divider">//</span>
      <span className="title-highlight">Collaboration</span>
    </h1>
    
    <div className="subtitle-container">
      <div className="loading-bar">
        <div className="loading-progress"></div>
      </div>
      <p className="subtitle">Live Code & Knowledge Sharing</p>
    </div>
  </div>
</header>

  <ToastContainer 
  position="top-right" 
  autoClose={3000} 
  hideProgressBar={false} 
  newestOnTop={false} 
  closeOnClick 
  rtl={false} 
  pauseOnFocusLoss 
  draggable 
  pauseOnHover 
  theme="colored"
/>

        {/* ⏱️ Timer */}
        {callStartedAt && (
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#333' }}>
            ⏳ Call Duration: <strong>{callDuration}</strong>
          </p>
        )}
{}
{showValidation && !quizValidated ? (
  <div style={{ textAlign: "center", marginTop: "20px" }}>
    <button onClick={fetchQuiz} style={buttonStyle}>🧪 Start Quiz to Validate</button>
  </div>
) : showValidation && quizValidated && !validationSent ? (
  <div style={{ textAlign: "center", marginTop: "30px" }}>
    <h3>✅ You passed the quiz. Validate your exchange?</h3>
    <button
      onClick={() => { submitValidation("success"); setValidationSent(true); }}
      style={{ ...buttonStyle, backgroundColor: "green", color: "white", marginRight: "10px" }}
    >
      ✅ Yes, I learned
    </button>
    <button
      onClick={() => { submitValidation("fail"); setValidationSent(true); }}
      style={{ ...buttonStyle, backgroundColor: "red", color: "white" }}
    >
      ❌ No, I didn\'t
    </button>
  </div>
) : null}

{showQuiz && (
  <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", marginTop: "20px", color: "#333", position: "relative" }}>
    {/* Bouton de fermeture */}
    <button 
      onClick={() => setShowQuiz(false)} 
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: "#ff4d4f",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "5px 10px",
        cursor: "pointer"
      }}
    >
      ❌ Fermer le Quiz
    </button>

    <h3 style={{ color: "#1DA1F2" }}>🧠 Validation Quiz</h3>
    {quiz.map((q, index) => (
      <div key={index} style={{ marginBottom: "15px" }}>
        <p><strong>{q.question}</strong></p>
        {q.options.map((option, i) => (
          <label 
            key={i} 
            style={{ 
              display: "block", 
              padding: "8px 12px", 
              marginBottom: "8px", 
              backgroundColor: "#f0f0f0", 
              borderRadius: "5px", 
              cursor: "pointer", 
              color: "#000" 
            }}
          >
            <input
              type="radio"
              name={`question-${index}`}
              value={option}
              onChange={() =>
                setQuizAnswers(prev => ({ ...prev, [index]: option }))
              }
              style={{ marginRight: "10px" }}
            />
            {option}
          </label>
        ))}
      </div>
    ))}
    <button
      onClick={() => {
        const allCorrect = quiz.every(
          (q, idx) => quizAnswers[idx] === q.answer
        );
        if (allCorrect) {
          toast.success("✅ Quiz passed. You can now validate!");
          setQuizValidated(true);
          setShowQuiz(false);
        } else {
          toast.error("❌ Incorrect answers. Try again.");
        }
      }}
      style={{ marginTop: "20px", ...buttonStyle }}
    >
      ✅ Submit Quiz
    </button>
  </div>
)}



        {/* 🎙️ Voice Controls */}
       <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
  <button onClick={startCall} style={{ ...iconButtonStyle, backgroundColor: '#ffffff' }} title="Start Call">📞</button>
  <button onClick={toggleMute} style={{ ...iconButtonStyle, backgroundColor: '#ffffff' }} title={isMuted ? "Unmute" : "Mute"}>
    {isMuted ? "🎤" : "🔇"}
  </button>
  <button onClick={hangUp} style={{ ...iconButtonStyle, backgroundColor: '#ffffff' }} title="Hang Up">❌</button>
  <button onClick={goBack} style={{ ...iconButtonStyle, backgroundColor: '#ffffff' }} title="Back">🔙</button>
</div>


        {/* Audio element for remote user */}
        <audio id="remoteAudio" autoPlay style={{ display: 'none' }}></audio>

        {/* Language Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <select value={language} onChange={handleLanguageChange} style={{ padding: '10px', fontSize: '16px', borderRadius: '5px' }}>
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="python">Python</option>
          </select>
        </div>

        {/* Code Editor */}
        <div>
        {language === "html" ? (
  <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
    {/* 📝 Editeur HTML à gauche */}
    <div style={{ flex: 1 }}>
     
      <Editor
  height="900px" // Augmenter la hauteur
  language={language}
  theme="vs-dark"
  value={code}
  onChange={handleCodeChange}
  options={{
    fontSize: 16, // Agrandir le texte aussi si tu veux
    minimap: { enabled: false }, // Tu peux désactiver la mini-map pour plus de place
  }}
/>

    </div>

    {/* 🔍 Preview à droite */}
    <div style={{
      flex: 1,
      border: "1px solid #ccc",
      borderRadius: "8px",
      overflow: "hidden",
      background: "#fff"
    }}>
      <iframe
        srcDoc={code}
        title="Live Preview"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  </div>
) : (
  // Pour les autres langages (JS, Python, etc.)
  <div style={{ marginTop: '20px' }}>
    <Editor
  height="600px" // Augmenter la hauteur
  width="1200px"
  language={language}
  theme="vs-dark"
  value={code}
  onChange={handleCodeChange}
  options={{
    fontSize: 16, // Agrandir le texte aussi si tu veux
    minimap: { enabled: false }, // Tu peux désactiver la mini-map pour plus de place
  }}
/>

  </div>
)}

        </div>
        <div style={{ marginTop: "20px", textAlign: "center" }}>
  <input
    type="text"
    value={aiPrompt}
    onChange={(e) => setAiPrompt(e.target.value)}
    placeholder="💡 Describe what you want to build (e.g. login form with validation)"
    style={{
      width: "60%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "16px"
    }}
  />
  <button
    onClick={handleAICodeHelp}
    disabled={aiLoading}
    style={{
      marginLeft: "10px",
      padding: "10px 20px",
      backgroundColor: "#00b894",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer"
    }}
  >
    👥 AI Help Me Code
  </button>
</div>


      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
  <button onClick={handleRun} style={{ ...iconButtonStyle, backgroundColor: '#AAAAAA' }} title="Run Code">▶️</button>
  <button onClick={handleCopy} style={{ ...iconButtonStyle, backgroundColor: '#AAAAAA' }} title="Copy Code">📋</button>
  <button onClick={handleDownload} style={{ ...iconButtonStyle, backgroundColor: '#AAAAAA' }} title="Download Code">📥</button>
  <button onClick={goBack} style={{ ...iconButtonStyle, backgroundColor: '#AAAAAA' }} title="Back">🔙</button>
  <button onClick={() => {
    if (exampleCodes[language]) {
      setCode(exampleCodes[language]);
    } else {
      alert('No example available for this language.');
    }
  }} style={{ ...iconButtonStyle, backgroundColor: '#AAAAAA' }} title="Load Example">
    🎯
  </button>
  <button onClick={handleAutoFix} disabled={isLoading} style={{ ...iconButtonStyle, backgroundColor: '#AAAAAA' }} title="AI Fix Code">
    🛠
  </button>
  <button onClick={handleExplainCode} disabled={isLoading} style={{ ...iconButtonStyle, backgroundColor: '#AAAAAA' }} title="Explain Code">
    📘 
  </button>
  {isLoading && <div className="spinner" style={{ width: 24, height: 24 }} />}
</div>



        
      {explanation && (
  <div style={{
    background: '#1e1e1e',
    color: '#f8f8f2',
    padding: '20px',
    marginTop: '30px',
    borderRadius: '10px',
    fontFamily: 'monospace',
    position: 'relative'
  }}>
    {/* Bouton Fermer */}
    <button 
      onClick={() => setExplanation("")} 
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: '#ff4d4f',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 10px',
        cursor: 'pointer'
      }}
    >
      ❌ Fermer
    </button>

    <h3 style={{ color: '#00e676' }}>💡 AI Explanation</h3>
    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
      {explanation}
    </ReactMarkdown>
  </div>
)}



        <div style={{ marginTop: '30px', background: '#1e1e1e', color: '#00ff90', padding: '20px', borderRadius: '10px', fontFamily: 'monospace' }}>
          <h3 style={{ color: '#fff' }}>🧪 Output:</h3>
          <pre>{output || '/* Output will appear here */'}</pre>
        </div>
      </div>
    
<div className="ambient-background">
  <div className="particle particle-1"></div>
  <div className="particle particle-2"></div>
  <div className="particle particle-3"></div>
  <div className="particle particle-4"></div>
</div>

    </div>
    
  );
};


const buttonStyle = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
};


export default CodeRoom;
