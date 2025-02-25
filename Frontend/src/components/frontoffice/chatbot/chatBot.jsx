import { useState, useRef, useEffect } from "react";
import "./chat.css";
import ChatForm from "./ChatFormm";
import ChatMessage from "./ChatMessage";

function chatBot() {
  

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    <div className="app-container">
      <div className={`chat-icon ${isChatOpen ? "hidden" : ""}`} onClick={toggleChat}>
        <span role="img" aria-label="chat">
          💬
        </span>
      </div>
      {isChatOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <span>AI Chat</span>
            <button onClick={toggleChat} className="close-chat">
              ×
            </button>
          </div>
          <div className="chat-body" ref={chatBodyRef}>
            {chatHistory.map((msg, index) => (
              <ChatMessage key={index} role={msg.role} text={msg.text} />
            ))}
          </div>
          <ChatForm onSendMessage={handleSendMessage} />
          <button onClick={startListening} className="voice-button" disabled={isListening}>
            {isListening ? "Listening..." : "Start Voice Chat"}
          </button>
          <button onClick={stopSpeaking} className="stop-button" disabled={!isAssistantSpeaking}>
            Stop Speaking
          </button>
        </div>
      )}
    </div>
  );
}

export default chatBot;