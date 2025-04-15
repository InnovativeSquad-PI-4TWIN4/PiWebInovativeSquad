// src/components/frontoffice/messenger/VideoCallComponent.jsx
import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // ton backend

const VideoCallComponent = ({ currentUserId, selectedUser }) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

    socket.on("callUser", ({ from, signal }) => {
      setReceivingCall(true);
      setCallerSignal(signal);
    });

    return () => {
      socket.off("callUser");
    };
  }, []);

  const callUser = (id) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      myVideo.current.srcObject = stream;
  
      const peer = new Peer({ initiator: true, trickle: false, stream });
  
      peer.on("signal", (data) => {
        socket.emit("callUser", {
          userToCall: id,
          signalData: data,
          from: currentUserId,
          name: currentUserName,
        });
      });
  
      peer.on("stream", (remoteStream) => {
        userVideo.current.srcObject = remoteStream;
      });
  
      socket.on("callAccepted", (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });
  
      connectionRef.current = peer;
    });
  };  
  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { to: selectedUser._id, signal: data });
    });

    peer.on("stream", (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  return (
    <div className="video-call-container">
      <h3>Video Call</h3>
      
      {!callAccepted && selectedUser && <div style={{ display: "flex", gap: "10px" }}>
        <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />
        <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
      </div> &&(
  <button onClick={() => callUser(selectedUser._id)} className="call-button">
    📞 Call
  </button>
  
)}

      {receivingCall && !callAccepted && (
        <button onClick={answerCall} className="answer-button">
          ✅ Répondre
        </button>
      )}
    </div>
  );
};

export default VideoCallComponent;
