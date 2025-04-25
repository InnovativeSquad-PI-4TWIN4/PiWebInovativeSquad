import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';

const socket = io("http://localhost:3000");

const CodeRoom = () => {
  const { roomId } = useParams();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isMuted, setIsMuted] = useState(false);
  const navigate = useNavigate();

  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    socket.emit("join-room", roomId);
    console.log(`✅ Joined room: ${roomId}`);

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
        console.error("Error adding received ice candidate", e);
      }
    });

    return () => {
      socket.off("init");
      socket.off("code-change");
      socket.emit("leave-room", roomId);
    };
  }, [roomId]);

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
        }
      };

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("make-call", { offer, roomId });

      console.log("📞 Calling...");
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
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
    console.log("❌ Call ended");
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("code-change", { roomId, code: newCode });
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

  const goBack = () => {
    navigate("/profiles");
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#1DA1F2' }}>💻 Code Room - Private Session</h1>

        {/* 🎙️ VOICE CHAT CONTROLS */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button onClick={startCall} style={{ margin: "10px" }}>📞 Start Call</button>
          <button onClick={toggleMute} style={{ margin: "10px" }}>
            {isMuted ? "🎤 Unmute" : "🔇 Mute"}
          </button>
          <button onClick={hangUp} style={{ margin: "10px", backgroundColor: "red", color: "white" }}>❌ Hang Up</button>
        </div>

        {/* AUDIO ELEMENT */}
        <audio id="remoteAudio" autoPlay></audio>

        <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginTop: '20px' }}>
          <Editor
            height="400px"
            language={language}
            theme="vs-light"
            value={code}
            onChange={handleCodeChange}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button onClick={handleRun} style={{ padding: '10px 20px', backgroundColor: '#1DA1F2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            ▶️ Run Code
          </button>
          <button onClick={goBack} style={{ padding: '10px 20px', backgroundColor: '#ccc', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            🔙 Back
          </button>
        </div>

        <div style={{ marginTop: '30px', background: '#1e1e1e', color: '#00ff90', padding: '20px', borderRadius: '10px', fontFamily: 'monospace' }}>
          <h3 style={{ color: '#fff' }}>🧪 Output:</h3>
          <pre>{output || '/* Output will appear here */'}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodeRoom;
