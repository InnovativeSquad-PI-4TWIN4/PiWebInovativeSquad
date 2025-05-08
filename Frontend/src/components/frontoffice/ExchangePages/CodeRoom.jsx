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
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("make-answer", { answer, to: data.socket });
    });

    socket.on("answer-made", async (data) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
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
        toast.success("✅ Code explained by AI!");
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
  
  
 
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#eef1f5', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#1DA1F2', marginBottom: '10px' }}>💻 Code Room - Private Collaboration</h1>

        {/* ⏱️ Timer */}
        {callStartedAt && (
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#333' }}>
            ⏳ Call Duration: <strong>{callDuration}</strong>
          </p>
        )}
{showValidation && (
  <div style={{ marginTop: "30px", textAlign: "center" }}>
    <h3>Did you successfully exchange skills?</h3>
    <button 
      onClick={() => { submitValidation("success"); setValidationSent(true); }} 
      disabled={validationSent}
      style={{
        margin: "10px",
        padding: "10px 20px",
        backgroundColor: validationSent ? "gray" : "green",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: validationSent ? "not-allowed" : "pointer"
      }}
    >
      ✅ Yes, I learned
    </button>
    <button 
      onClick={() => { submitValidation("fail"); setValidationSent(true); }} 
      disabled={validationSent}
      style={{
        margin: "10px",
        padding: "10px 20px",
        backgroundColor: validationSent ? "gray" : "red",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: validationSent ? "not-allowed" : "pointer"
      }}
    >
      ❌ No, I didn't
    </button>
  </div>
)}


        {/* 🎙️ Voice Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={startCall} style={buttonStyle}>📞 Start Call</button>
          <button onClick={toggleMute} style={buttonStyle}>
            {isMuted ? "🎤 Unmute" : "🔇 Mute"}
          </button>
          <button onClick={hangUp} style={{ ...buttonStyle, backgroundColor: 'red' }}>❌ Hang Up</button>
          <button onClick={goBack} style={{ ...buttonStyle, backgroundColor: '#ccc', color: 'black' }}>🔙 Back</button>
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
        <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', marginTop: '20px' }}>
          <Editor
            height="400px"
            language={language}
            theme="vs-light"
            value={code}
            onChange={handleCodeChange}
          />
        </div>

        {/* Run Output */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={handleRun} style={{ ...buttonStyle, backgroundColor: '#1DA1F2' }}>
  ▶️ Run Code
</button>
<button onClick={handleCopy} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            📋 Copy Code
          </button>
          <button onClick={handleDownload} style={{ padding: '10px 20px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            📥 Download Code
          </button>
          <button onClick={goBack} style={{ padding: '10px 20px', backgroundColor: '#ccc', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            🔙 Back
          </button>
          <button 
  onClick={() => {
    if (exampleCodes[language]) {
      setCode(exampleCodes[language]);
    } else {
      alert('No example available for this language.');
    }
  }}
  style={{ ...buttonStyle, backgroundColor: '#6a0dad' }}
>
  🎯 Load Example
</button>

<button 
  onClick={handleAutoFix} 
  disabled={isLoading}
  style={{ ...buttonStyle, backgroundColor: '#8e44ad' }}
>
  🛠 AI Fix Code
</button>
<button 
  onClick={handleExplainCode} 
  disabled={isLoading}
  style={{ ...buttonStyle, backgroundColor: '#17a2b8' }}
>
  📘 Explain Code
</button>

        </div>
        {explanation && (
  <div style={{
    background: '#1e1e1e',
    color: '#f8f8f2',
    padding: '20px',
    marginTop: '30px',
    borderRadius: '10px',
    fontFamily: 'monospace'
  }}>
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
      <ToastContainer position="top-right" autoClose={3000} />

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
