function ChatMessage({ role, text }) {
    return (
      <div className={`chat-message ${role === "user" ? "user" : "bot"}`}>
        <span>{text}</span>
      </div>
    );
  }
  
  export default ChatMessage;