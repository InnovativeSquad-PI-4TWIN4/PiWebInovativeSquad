import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaBrain, FaChartLine } from 'react-icons/fa';
import { IoMdHappy, IoMdSad, IoMdHeart } from 'react-icons/io';
import './TherapistChat.scss';

const TherapistChat = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'model',
      text: "Hello, I'm your AI therapeutic assistant. How are you feeling today? I'm here to listen and support you.",
      mood: 'neutral',
      timestamp: new Date().toISOString()
    }
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState('neutral');
  const [activeFeature, setActiveFeature] = useState(null);
  const [conversationContext, setConversationContext] = useState({
    lastMood: 'neutral',
    topics: [],
    lastResponseType: 'greeting'
  });
  
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  
  // Mood indicators
  const moodIcons = {
    stressed: <FaBrain className="mood-icon stressed" />,
    happy: <IoMdHappy className="mood-icon happy" />,
    sad: <IoMdSad className="mood-icon sad" />,
    calm: <IoMdHeart className="mood-icon calm" />,
    neutral: <FaRobot className="mood-icon neutral" />
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Focus input when chat opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Quick action buttons
  const quickActions = [
    { text: "I'm feeling anxious", icon: <FaBrain />, mood: 'stressed' },
    { text: "Had a great day!", icon: <IoMdHappy />, mood: 'happy' },
    { text: "Need to vent", icon: <IoMdSad />, mood: 'sad' },
    { text: "Feeling balanced", icon: <IoMdHeart />, mood: 'calm' }
  ];

  const handleQuickAction = (action) => {
    setMessage(action.text);
    setMood(action.mood);
    inputRef.current.focus();
  };

  const generateTherapistResponse = async (history) => {
    setLoading(true);
    
    try {
      const formattedHistory = history.map(({ role, text }) => ({
        role: role === 'user' ? 'user' : 'model',
        parts: [{ text }]
      }));

      const apiUrl = `${import.meta.env.VITE_API_URL}?key=${import.meta.env.VITE_API_KEY}`;
      
      // Add therapeutic context to the prompt
      const therapeuticPrompt = {
        role: "user",
        parts: [{
          text: `You are a compassionate AI therapist. The user is currently feeling ${mood}. 
          Previous topics discussed: ${conversationContext.topics.join(', ') || 'none'}.
          Respond in a warm, empathetic manner appropriate for therapeutic conversation.
          Keep responses concise but meaningful (2-3 sentences max).`
        }]
      };

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-1.5-flash",
          contents: [therapeuticPrompt, ...formattedHistory],
        }),
      };

      const response = await fetch(apiUrl, requestOptions);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "I'm having trouble understanding. Could you say that differently?";

      // Update conversation context based on response
      updateConversationContext(responseText);

      return responseText;
    } catch (error) {
      console.error("Error generating response:", error);
      return "I'm having technical difficulties. Could you try again?";
    } finally {
      setLoading(false);
    }
  };

  const updateConversationContext = (responseText) => {
    // Simple sentiment analysis from response
    const responseLower = responseText.toLowerCase();
    let detectedMood = mood;
    
    if (responseLower.includes('happy') || responseLower.includes('great') || responseLower.includes('wonderful')) {
      detectedMood = 'happy';
    } else if (responseLower.includes('anxious') || responseLower.includes('stress') || responseLower.includes('overwhelm')) {
      detectedMood = 'stressed';
    } else if (responseLower.includes('sad') || responseLower.includes('difficult') || responseLower.includes('hard')) {
      detectedMood = 'sad';
    } else if (responseLower.includes('calm') || responseLower.includes('peace') || responseLower.includes('relax')) {
      detectedMood = 'calm';
    }

    setMood(detectedMood);
    
    // Detect topics in user's last message
    const userMessage = chatHistory[chatHistory.length - 1]?.text || '';
    const topics = ['work', 'family', 'friends', 'health', 'school', 'future'];
    const mentionedTopics = topics.filter(topic => userMessage.toLowerCase().includes(topic));
    
    if (mentionedTopics.length > 0) {
      setConversationContext(prev => ({
        ...prev,
        topics: [...new Set([...prev.topics, ...mentionedTopics])].slice(0, 3),
        lastMood: detectedMood,
        lastResponseType: 'followUp'
      }));
    }
  };

  const handleSendMessage = async (text = null) => {
    const messageToSend = text || message;
    if (!messageToSend.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user',
      text: messageToSend,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    
    // Generate AI response
    const response = await generateTherapistResponse([...chatHistory, userMessage]);
    
    // Add assistant response
    setChatHistory(prev => [...prev, { 
      role: 'model', 
      text: response,
      mood: mood,
      timestamp: new Date().toISOString()
    }]);
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`therapist-container mood-${mood}`}>
      <div className="therapist-header">
        <div className="therapist-title">
          <div className={`therapist-mood ${mood}`}>
            {moodIcons[mood]}
          </div>
          <h2>AI Therapeutic Assistant</h2>
        </div>
        <div className="therapist-controls">
          <button 
            className={`feature-btn ${activeFeature === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveFeature(activeFeature === 'insights' ? null : 'insights')}
            title="View insights"
          >
            <FaChartLine />
          </button>
        </div>
      </div>
      
      {activeFeature === 'insights' && (
        <div className="insights-panel">
          <h3>Your Emotional Patterns</h3>
          <div className="mood-chart">
            <div className="chart-bar stressed" style={{ height: '30%' }}>
              <span>Stressed</span>
            </div>
            <div className="chart-bar happy" style={{ height: '45%' }}>
              <span>Happy</span>
            </div>
            <div className="chart-bar sad" style={{ height: '20%' }}>
              <span>Sad</span>
            </div>
            <div className="chart-bar calm" style={{ height: '35%' }}>
              <span>Calm</span>
            </div>
          </div>
          <p>Based on our recent conversations, you've shown resilience during stressful periods.</p>
          <button 
            className="close-insights"
            onClick={() => setActiveFeature(null)}
          >
            Close
          </button>
        </div>
      )}
      
      <div className="therapist-chat-body" ref={chatBodyRef}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-header">
              {msg.role === 'model' && (
                <div className={`message-mood ${msg.mood || 'neutral'}`}>
                  {moodIcons[msg.mood || 'neutral']}
                </div>
              )}
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="message-content">
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message model">
            <div className="message-content loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className={`quick-action ${action.mood}`}
            onClick={() => handleQuickAction(action)}
          >
            {action.icon} {action.text}
          </button>
        ))}
      </div>
      
      <div className="therapist-input">
        <div className="input-container">
        <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="send-btn"
            onClick={() => handleSendMessage()}
            disabled={!message.trim() || loading}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
      
      <div className="therapist-footer">
        <p>This AI assistant provides supportive listening but is not a substitute for professional care.</p>
        <p>In crisis situations, please contact your campus counseling center or emergency services.</p>
      </div>
    </div>
  );
};

export default TherapistChat;