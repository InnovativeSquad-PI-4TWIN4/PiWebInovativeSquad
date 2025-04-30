import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "./VideoCall.scss";

const VideoCall = ({ roomId }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [userStream, setUserStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]); 
  const [isMuted, setIsMuted] = useState(false); 
  const [isVideoOff, setIsVideoOff] = useState(false); 
  const socket = useRef(null);
  const peerConnections = useRef({});
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef([]); 

  useEffect(() => {
    socket.current = io("http://localhost:3000");

    socket.current.emit("join-room", roomId);
  
    socket.current.on("user-joined", (userId) => {
      console.log("New user joined:", userId);
      setupPeerConnection(userId);
    });

    socket.current.on("callIncoming", async (data) => {
      console.log("Incoming call:", data);
      await handleIncomingCall(data);
    });

    socket.current.on("answer-made", (data) => {
      handleAnswer(data);
    });

    socket.current.on("ice-candidate", (data) => {
      handleICECandidate(data);
    });

    return () => {
      socket.current.disconnect();
      Object.values(peerConnections.current).forEach((pc) => {
        pc.close();
      });
    };
  }, [roomId]);

  const setupPeerConnection = (userId) => {
    const peerConnection = new RTCPeerConnection();
    peerConnections.current[userId] = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("ice-candidate", { candidate: event.candidate, roomId });
      }
    };

    peerConnection.ontrack = (event) => {
      const remoteVideoElement = document.createElement("video");
      remoteVideoElement.srcObject = event.streams[0];
      remoteVideoElement.autoplay = true;
      remoteVideoRefs.current.push(remoteVideoElement);
      document.getElementById("video-grid").appendChild(remoteVideoElement);
      
      setRemoteStreams((prevStreams) => [...prevStreams, remoteVideoElement]);
    };
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setUserStream(stream);
      localVideoRef.current.srcObject = stream;

      const userPeerConnection = new RTCPeerConnection();
      stream.getTracks().forEach((track) => {
        userPeerConnection.addTrack(track, stream);
      });

      peerConnections.current["local"] = userPeerConnection;

      userPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current.emit("ice-candidate", { candidate: event.candidate, roomId });
        }
      };

      const offer = await userPeerConnection.createOffer();
      await userPeerConnection.setLocalDescription(offer);

      socket.current.emit("make-call", { offer, roomId });

      setIsCallActive(true);
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const handleIncomingCall = async (data) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setUserStream(stream);
      localVideoRef.current.srcObject = stream;

      const peerConnection = new RTCPeerConnection();

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.current.emit("make-answer", { answer, to: data.socket });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current.emit("ice-candidate", { candidate: event.candidate, roomId });
        }
      };

      peerConnection.ontrack = (event) => {
        const remoteVideoElement = document.createElement("video");
        remoteVideoElement.srcObject = event.streams[0];
        remoteVideoElement.autoplay = true;

        remoteVideoRefs.current.push(remoteVideoElement);
        document.getElementById("video-grid").appendChild(remoteVideoElement);
        setRemoteStreams((prevStreams) => [...prevStreams, remoteVideoElement]);
      };
    } catch (err) {
      console.error("Error handling incoming call:", err);
    }
  };

  const handleAnswer = (data) => {
    if (peerConnections.current) {
      peerConnections.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  };

  const handleICECandidate = (data) => {
    if (peerConnections.current) {
      peerConnections.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const toggleMute = () => {
    const tracks = userStream.getTracks();
    tracks.forEach((track) => {
      if (track.kind === "audio") {
        track.enabled = !isMuted;
      }
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const tracks = userStream.getTracks();
    tracks.forEach((track) => {
      if (track.kind === "video") {
        track.enabled = !isVideoOff;
      }
    });
    setIsVideoOff(!isVideoOff);
  };

  const endCall = () => {
    peerConnections.current.close();
    socket.current.emit("leave-room", roomId);
    setIsCallActive(false);
  };

  return (
    <div className="video-call-container">
      <h1>Video Call in Room: {roomId}</h1>
      
      <div className="video-controls">
        <button onClick={toggleMute}>
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button onClick={toggleVideo}>
          {isVideoOff ? "Turn Video On" : "Turn Video Off"}
        </button>
      </div>

      {!isCallActive && <button onClick={startVideoCall} className="start-call-btn">Start Video Call</button>}

      <div className="video-grid">
        {/* Local video display */}
        <div className="local-video-container">
          <h3>Your Video</h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="local-video"
            style={{ width: "700px", height: "400px", borderRadius: "10px" }}
          />
        </div>
        <div className="local-video-container">
          <h3>Your Video</h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="local-video"
            style={{ width: "700px", height: "400px", borderRadius: "10px" }}
          />
        </div>

        {/* Remote users' videos */}
        <div id="video-grid" style={{ display: "flex", flexWrap: "wrap" }}>
          {remoteStreams.map((stream, index) => (
            <video
              key={index}
              ref={(el) => el && (el.srcObject = stream.srcObject)}
              autoPlay
              style={{ width: "300px", height: "200px", borderRadius: "10px", margin: "10px" }}
            />
          ))}
        </div>
      </div>

      {isCallActive && <button onClick={endCall} className="end-call-btn">End Call</button>}
    </div>
  );
};

export default VideoCall;
