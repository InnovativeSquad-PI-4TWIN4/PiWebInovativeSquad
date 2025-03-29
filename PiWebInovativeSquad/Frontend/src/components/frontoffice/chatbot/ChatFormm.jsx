import { useState } from "react";

function ChatForm({ onSendMessage }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage(""); // Clear the input after sending
  };

  return (
    <form onSubmit={handleSubmit} className="chat-form">
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}

export default ChatForm;