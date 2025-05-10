import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./MatchRoom.scss";

const MatchRoom = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/match-rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoom(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération de la room:", err);
        setError("Impossible de charger la room.");
        setLoading(false);
      }
    };
    fetchRoom();

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;
    const userName = user?.name || user?.email;

    if (!userId || !userName) {
      setError("Utilisateur non identifié. Veuillez vous reconnecter.");
      return;
    }

    const newSocket = io("http://localhost:3000", {
      query: { userId },
    });
    setSocket(newSocket);

    // Initialiser WebRTC
    const initWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const configuration = {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        };
        const pc = new RTCPeerConnection(configuration);
        setPeerConnection(pc);

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          const remote = new MediaStream();
          event.streams[0].getTracks().forEach(track => remote.addTrack(track));
          setRemoteStream(remote);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remote;
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            newSocket.emit("ice-match-candidate", {
              candidate: event.candidate,
              roomId,
              to: matchRooms[roomId]?.find(p => p.userId !== userId)?.socketId,
            });
          }
        };
      } catch (err) {
        console.error("Erreur lors de l'initialisation de WebRTC:", err);
        setError("Impossible d'accéder à la caméra/microphone.");
      }
    };

    initWebRTC();

    newSocket.emit("join-match-room", { roomId, userId, userName });

    newSocket.on("room-full", ({ message }) => {
      setError(message);
      newSocket.disconnect();
    });

    newSocket.on("room-conflict", ({ message }) => {
      setError(message);
      newSocket.disconnect();
    });

    newSocket.on("receive-match-message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    newSocket.on("user-joined-match", ({ userId, userName }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { userId, userName, message: `${userName} a rejoint la room`, timestamp: new Date().toISOString() },
      ]);
    });

    newSocket.on("user-left-match", ({ userId, userName }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { userId, userName, message: `${userName} a quitté la room`, timestamp: new Date().toISOString() },
      ]);
    });

    newSocket.on("start-call", async ({ userToCall, name }) => {
      if (!peerConnection) return;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      newSocket.emit("callMatchUser", {
        userToCall,
        signalData: offer,
        from: userId,
        name: userName,
      });
    });

    newSocket.on("matchCallIncoming", async ({ signal, from, name }) => {
      if (!peerConnection) return;

      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      newSocket.emit("make-match-answer", { answer, to: from });
    });

    newSocket.on("match-answer-made", async ({ answer, from }) => {
      if (!peerConnection) return;
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    newSocket.on("ice-match-candidate", ({ candidate }) => {
      if (!peerConnection) return;
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      newSocket.emit("leave-match-room", { roomId, userId });
      newSocket.disconnect();
    };
  }, [roomId, token]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;
      const userName = user?.name || user?.email;
      const msg = { roomId, userId, userName, message };
      socket.emit("send-match-message", msg);
      setMessage("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <div>Chargement de la room...</div>;
  if (error) return <div>{error}</div>;
  if (!room) return <div>Room non trouvée.</div>;

  return (
    <div className="match-room-container">
      <h2>Room Privée</h2>
      <div className="room-content">
        <div className="chat-section">
          <h3>Chat</h3>
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className="message">
                <strong>{msg.userName}: </strong>
                <span>{msg.message}</span>
                <small> ({new Date(msg.timestamp).toLocaleTimeString()})</small>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="chat-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrire un message..."
              className="chat-input"
            />
            <button type="submit" className="send-btn">Envoyer</button>
          </form>
        </div>
        <div className="video-section">
          <h3>Appel Vidéo</h3>
          <div className="video-container">
            <div className="video-wrapper">
              <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
              <span>Vous</span>
            </div>
            <div className="video-wrapper">
              <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
              <span>Interlocuteur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchRoom;