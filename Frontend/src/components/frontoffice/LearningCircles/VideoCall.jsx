import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import StopIcon from "@mui/icons-material/Stop";
import CloseIcon from "@mui/icons-material/Close";
import "./VideoCall.scss";

const VideoCall = ({ roomId }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [userStream, setUserStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("unknown");
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = useRef(null);
  const peerConnections = useRef({});
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null); // Simplifié pour une seule vidéo distante
  const screenShareStream = useRef(null);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // Vérifier les permissions initiales
  const checkPermissions = async () => {
    try {
      const cameraPermission = await navigator.permissions.query({ name: "camera" });
      const microphonePermission = await navigator.permissions.query({ name: "microphone" });
      if (cameraPermission.state === "denied" || microphonePermission.state === "denied") {
        setPermissionStatus("denied");
        setError(
          "Les permissions pour la caméra ou le microphone ont été refusées. Veuillez les accorder dans les paramètres de votre navigateur."
        );
      } else if (cameraPermission.state === "granted" && microphonePermission.state === "granted") {
        setPermissionStatus("granted");
      } else {
        setPermissionStatus("prompt");
      }
    } catch (err) {
      console.error("Erreur lors de la vérification des permissions :", err);
      setError("Impossible de vérifier les permissions. Vérifiez les paramètres de votre navigateur.");
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Initialiser Socket.IO et WebRTC
  useEffect(() => {
    checkPermissions();
    socket.current = io("http://localhost:3000");

    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "Anonymous";
    socket.current.emit("join-room", { roomId, userId, userName });

    socket.current.on("user-joined", ({ userId: newUserId, userName: newUserName, participants: updatedParticipants }) => {
      console.log("Nouvel utilisateur rejoint :", newUserId, newUserName);
      setParticipants(updatedParticipants);
      if (newUserId !== userId && !peerConnections.current[newUserId]) {
        setupPeerConnection(newUserId);
      }
    });

    socket.current.on("receive-message", ({ userId, userName, message }) => {
      setChatMessages((prev) => [...prev, { userId, userName, message }]);
    });

    socket.current.on("user-left", ({ userId: leftUserId, userName: leftUserName, participants: updatedParticipants }) => {
      console.log("Utilisateur quitté :", leftUserId, leftUserName);
      setParticipants(updatedParticipants);
      if (peerConnections.current[leftUserId]) {
        peerConnections.current[leftUserId].close();
        delete peerConnections.current[leftUserId];
      }
      setRemoteStreams((prev) => prev.filter((stream) => stream.userId !== leftUserId));
      if (remoteVideoRef.current && remoteStreams.some(stream => stream.userId === leftUserId)) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socket.current.on("call-made", async ({ offer, from }) => {
      console.log("Appel reçu de", from);
      await handleIncomingCall(offer, from);
    });

    socket.current.on("answer-made", ({ answer, from }) => {
      console.log("Réponse reçue de", from);
      if (peerConnections.current[from]) {
        peerConnections.current[from].setRemoteDescription(new RTCSessionDescription(answer)).catch((err) => {
          console.error("Erreur lors de la définition de la description distante :", err);
        });
      }
    });

    socket.current.on("ice-candidate", ({ candidate, from }) => {
      console.log("ICE candidate reçu de", from);
      if (peerConnections.current[from]) {
        peerConnections.current[from].addIceCandidate(new RTCIceCandidate(candidate)).catch((err) => {
          console.error("Erreur lors de l'ajout du ICE candidate :", err);
        });
      }
    });

    return () => {
      socket.current.emit("leave-room", { roomId, userId });
      socket.current.disconnect();
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      if (userStream) userStream.getTracks().forEach((track) => track.stop());
      if (screenShareStream.current) screenShareStream.current.getTracks().forEach((track) => track.stop());
    };
  }, [roomId]);

  // Configurer la connexion WebRTC
  const setupPeerConnection = (userId) => {
    console.log("Configuration de la connexion peer pour", userId);
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerConnections.current[userId] = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Envoi du ICE candidate à", userId);
        socket.current.emit("ice-candidate", { candidate: event.candidate, roomId, to: userId });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log("Flux distant reçu de", userId, ":", event.streams);
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => {
          const updatedStreams = prev.filter((stream) => stream.userId !== userId);
          updatedStreams.push({ userId, stream: event.streams[0] });
          console.log("Mise à jour des remoteStreams :", updatedStreams);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            console.log("Vidéo distante attachée pour", userId);
          }
          return updatedStreams;
        });
      } else {
        console.error("Aucun flux valide reçu de", userId);
      }
    };

    if (userStream) {
      console.log("Ajout des pistes locales à la connexion peer pour", userId);
      userStream.getTracks().forEach((track) => peerConnection.addTrack(track, userStream));
    }
  };

  const sendMessage = () => {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "Anonymous";
    if (newMessage.trim()) {
      socket.current.emit("send-message", { roomId, userId, userName, message: newMessage });
      setChatMessages((prev) => [...prev, { userId, userName, message: newMessage }]);
      setNewMessage("");
    }
  };

  // Démarrer l'appel vidéo
  const startVideoCall = async () => {
    try {
      if (permissionStatus === "denied") {
        setError(
          "Les permissions sont refusées. Veuillez les accorder dans les paramètres de votre navigateur et rechargez la page."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch((err) => {
        if (err.name === "NotAllowedError") {
          setError(
            "Les permissions pour la caméra ou le microphone ont été refusées. Veuillez les accorder dans les paramètres de votre navigateur."
          );
          setPermissionStatus("denied");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setError(
            "La caméra ou le microphone est déjà utilisé par une autre application ou onglet. Veuillez fermer les autres applications ou onglets."
          );
        } else {
          setError("Échec d'accès à la caméra ou au microphone : " + err.message);
        }
        return null;
      });

      if (stream) {
        console.log("Flux local obtenu :", stream);
        setUserStream(stream);
        localVideoRef.current.srcObject = stream;
        setIsCallActive(true);

        Object.values(peerConnections.current).forEach((pc) => {
          stream.getTracks().forEach((track) => {
            console.log("Ajout de la piste locale au peer :", track);
            pc.addTrack(track, stream);
          });
        });

        for (const userId in peerConnections.current) {
          const pc = peerConnections.current[userId];
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log("Offre envoyée à", userId, ":", offer);
          socket.current.emit("make-call", { offer, roomId, to: userId });
        }
      }
    } catch (err) {
      console.error("Erreur d'accès aux périphériques multimédias :", err);
      setError("Échec de l'accès à la caméra ou au microphone. Vérifiez les permissions.");
    }
  };

  // Gérer un appel entrant
  const handleIncomingCall = async (offer, from) => {
    try {
      if (!userStream) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch((err) => {
          setError("Échec d'accès à la caméra ou au microphone pour l'appel entrant. Vérifiez les permissions.");
          return null;
        });
        if (stream) {
          console.log("Flux local obtenu pour l'appel entrant :", stream);
          setUserStream(stream);
          localVideoRef.current.srcObject = stream;
        }
      }

      if (userStream) {
        let pc = peerConnections.current[from];
        if (!pc) {
          pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
          peerConnections.current[from] = pc;

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              console.log("Envoi du ICE candidate à", from);
              socket.current.emit("ice-candidate", { candidate: event.candidate, roomId, to: from });
            }
          };

          pc.ontrack = (event) => {
            console.log("Flux distant reçu de", from, ":", event.streams);
            if (event.streams && event.streams[0]) {
              setRemoteStreams((prev) => {
                const updatedStreams = prev.filter((stream) => stream.userId !== from);
                updatedStreams.push({ userId: from, stream: event.streams[0] });
                console.log("Mise à jour des remoteStreams dans handleIncomingCall :", updatedStreams);
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = event.streams[0];
                  console.log("Vidéo distante attachée pour", from);
                }
                return updatedStreams;
              });
            }
          };
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        userStream.getTracks().forEach((track) => pc.addTrack(track, userStream));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Réponse envoyée à", from, ":", answer);
        socket.current.emit("make-answer", { answer, to: from });
      }
    } catch (err) {
      console.error("Erreur lors de la gestion de l'appel entrant :", err);
      setError("Échec de la gestion de l'appel entrant.");
    }
  };

  // Activer/désactiver le son
  const toggleMute = () => {
    if (userStream) {
      userStream.getAudioTracks().forEach((track) => { track.enabled = !isMuted; });
      setIsMuted(!isMuted);
    }
  };

  // Activer/désactiver la vidéo
  const toggleVideo = () => {
    if (userStream) {
      userStream.getVideoTracks().forEach((track) => { track.enabled = !isVideoOff; });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Activer/désactiver le partage d'écran
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenShareStream.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        localVideoRef.current.srcObject = screenStream;
        screenTrack.onended = stopScreenShare;
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Erreur lors du partage d'écran :", err);
      setError("Échec du partage d'écran. Vérifiez les permissions.");
    }
  };

  // Arrêter le partage d'écran
  const stopScreenShare = () => {
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach((track) => track.stop());
      screenShareStream.current = null;

      if (userStream) {
        const videoTrack = userStream.getVideoTracks()[0];
        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
        });
        localVideoRef.current.srcObject = userStream;
      }
      setIsScreenSharing(false);
    }
  };

  // Terminer l'appel
  const endCall = () => {
    const userId = localStorage.getItem("userId");
    socket.current.emit("leave-room", { roomId, userId });
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    if (userStream) userStream.getTracks().forEach((t) => t.stop());
    if (screenShareStream.current) screenShareStream.current.getTracks().forEach((t) => t.stop());
    setIsCallActive(false);
    setRemoteStreams([]);
    setParticipants([]);
    navigate("/learning-circles");
  };

  return (
    <div className="call-layout">
      <div className="video-call-container">
        <h1 className="text-2xl font-bold mb-4">Video call : {roomId}</h1>
        {error && <div className="error-message">{error}</div>}

        {/* Grille vidéo */}
        <div className="video-grid">
          {/* Vidéo locale */}
          <div className="video-container local-video-container">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="video-element"
            />
            <div className="video-label">
              You {isScreenSharing ? "(Écran)" : ""}
            </div>
          </div>

          {/* Vidéo distante */}
          <div className="video-container remote-video-container">
            <video
              ref={remoteVideoRef}
              autoPlay
              className="video-element"
            />
            <div className="video-label">
              {remoteStreams.length > 0
                ? (participants.find(p => p.userId === remoteStreams[0].userId)?.userName || `User ${remoteStreams[0].userId}`)
                : "Waiting for remote user..."}
            </div>
          </div>
        </div>

        {/* Barre de contrôle */}
        <div className="control-bar">
          <button
            onClick={toggleMute}
            className={`control-button ${isMuted ? "muted" : ""}`}
            title={isMuted ? "Réactiver le son" : "Couper le son"}
          >
            <MicIcon sx={{ fontSize: 20, color: "white" }} />
          </button>
          <button
            onClick={toggleVideo}
            className={`control-button ${isVideoOff ? "video-off" : ""}`}
            title={isVideoOff ? "Réactiver la vidéo" : "Désactiver la vidéo"}
          >
            <VideocamIcon sx={{ fontSize: 20, color: "white" }} />
          </button>
          <button
            onClick={toggleScreenShare}
            className={`control-button ${isScreenSharing ? "screen-sharing" : ""}`}
            title={isScreenSharing ? "Arrêter le partage" : "Partager l'écran"}
          >
            <StopIcon sx={{ fontSize: 20, color: "white" }} />
          </button>
          <button
            onClick={endCall}
            className="control-button end-call"
            title="Terminer l'appel"
          >
            <CloseIcon sx={{ fontSize: 20, color: "white" }} />
          </button>
        </div>

        {/* Liste des participants */}
        <div className="participants">
          <h2 className="text-xl font-semibold">Participants ({participants.length})</h2>
          <ul className="participant-list">
            {participants.map((participant) => (
              <li key={participant.userId}>
                {participant.userName || `User ${participant.userId}`} -{" "}
                {participant.leftAt ? "Left" : "Active"} (
                {participant.joinedAt ? new Date(participant.joinedAt).toLocaleTimeString("fr-FR") : "N/A"}
                )
              </li>
            ))}
          </ul>
        </div>

        {/* Bouton pour démarrer l'appel */}
        {!isCallActive && (
          <button
            onClick={startVideoCall}
            className="start-call-button"
          >
            Start Call
          </button>
        )}
      </div>

      {/* Zone de conversation à droite */}
      <div className="chat-box">
        <h3>💬 Chat</h3>
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.userId === localStorage.getItem("userId") ? "self" : "other"}`}>
              <strong>{msg.userName || (msg.userId === localStorage.getItem("userId") ? "You" : `User ${msg.userId}`)}:</strong> {msg.message}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Write a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;