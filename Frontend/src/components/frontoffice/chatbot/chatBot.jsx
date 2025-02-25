import { useState, useRef, useEffect } from "react";
import "./chat.css";
import ChatForm from "./ChatFormm";
import ChatMessage from "./ChatMessage";

function chatBot() {
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const chatBodyRef = useRef();
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const isVoiceCommand = useRef(false); // Flag to differentiate voice commands from text messages

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition API is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true; // Continuously listen
    recognitionRef.current.interimResults = false; // Only final results
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      console.log("Listening...");
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      console.log("Stopped listening.");
      // Restart listening if it stops unexpectedly
      if (!isAssistantSpeaking) {
        startListening();
      }
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("You said:", transcript);

      // Wake word detection
      if (transcript.includes("assistant")) {
        setIsChatOpen(true); // Open chat window
        const userMessage = transcript.replace("assistant", "").trim();
        if (userMessage) {
          isVoiceCommand.current = true; // Mark as a voice command
          handleSendMessage(userMessage);
        }
      }

      // Stop command
      if (transcript.includes("stop")) {
        stopSpeaking();
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    // Initialize Speech Synthesis
    speechSynthesisRef.current = window.speechSynthesis;

    // Start listening automatically when the app is launched
    startListening();
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const generateBotResponse = async (history) => {
    setChatHistory((prev) => [...prev, { role: "model", text: "thinking..." }]);

    const updateHistory = (text) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "thinking..."),
        { role: "model", text },
      ]);
    };

    const formattedHistory = history.map(({ role, text }) => ({
      role: role === "user" ? "user" : "model",
      parts: [{ text }],
    }));

    const apiUrl = `${import.meta.env.VITE_API_URL}?key=${import.meta.env.VITE_API_KEY}`;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-1.5-flash",
        contents: formattedHistory,
      }),
    };

    try {
      const response = await fetch(apiUrl, requestOptions);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const apiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from API";
      updateHistory(apiResponseText);

      // Speak only if the message is from a voice command
      if (isVoiceCommand.current) {
        speak(apiResponseText);
      }
      isVoiceCommand.current = false; // Reset the flag
    } catch (error) {
      console.error("Error fetching response:", error);
      updateHistory(`Error: ${error.message}`);
    }
  };

  const handleSendMessage = (text) => {
    const newHistory = [...chatHistory, { role: "user", text }];
    setChatHistory(newHistory);
    generateBotResponse(newHistory);
  };

  const speak = (text) => {
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel(); // Stop any ongoing speech
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2; // Increase speech rate (1.0 is normal, 1.2 is faster)
    utterance.onstart = () => setIsAssistantSpeaking(true);
    utterance.onend = () => {
      setIsAssistantSpeaking(false);
      // Restart listening after the assistant finishes speaking
      startListening();
    };
    speechSynthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
      setIsAssistantSpeaking(false);
    }
  };

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