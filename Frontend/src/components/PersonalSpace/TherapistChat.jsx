import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaBrain, FaChartLine } from 'react-icons/fa';
import { IoMdHappy, IoMdSad, IoMdHeart } from 'react-icons/io';
import './TherapistChat.scss';

const TherapistChat = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: "Hello, I'm your AI therapeutic assistant. How are you feeling today? I'm here to listen and support you.",
      mood: 'neutral',
      timestamp: new Date().toISOString()
    }
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState('neutral');
  const [activeFeature, setActiveFeature] = useState(null);
  
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

  // Conversation context tracking
  const conversationContext = useRef({
    lastMood: 'neutral',
    topics: [],
    lastResponseType: 'greeting'
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    };

    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [chatHistory]);
  
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
    
    // Show loading state
    setLoading(true);
    
    try {
      // Analyze message sentiment to set mood
      const sentiment = analyzeSentiment(messageToSend);
      if (sentiment) {
        setMood(sentiment);
        conversationContext.current.lastMood = sentiment;
      }
      
      // Update conversation topics
      updateConversationTopics(messageToSend);
      
      // Process with AI service
      const response = await generateTherapistResponse([...chatHistory, userMessage], sentiment || mood);
      
      // Add assistant response
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        text: response,
        mood: sentiment || mood,
        timestamp: new Date().toISOString()
      }]);
      
    } catch (error) {
      console.error('Error generating response:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        text: "I'm having trouble processing that. Could you rephrase or try again?",
        mood: 'neutral',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  // Enhanced sentiment analysis with context awareness
  const analyzeSentiment = (text) => {
    text = text.toLowerCase();
    
    const stressWords = ['anxious', 'stressed', 'worry', 'overwhelmed', 'panic', 'pressure', 'burnout'];
    const happyWords = ['happy', 'joy', 'glad', 'great', 'wonderful', 'excited', 'good', 'amazing'];
    const sadWords = ['sad', 'depressed', 'unhappy', 'down', 'miserable', 'tired', 'exhausted', 'lonely'];
    const calmWords = ['calm', 'peaceful', 'relaxed', 'chill', 'fine', 'okay', 'alright', 'content'];
    
    let scores = {
      stressed: 0,
      happy: 0,
      sad: 0,
      calm: 0
    };
    
    stressWords.forEach(word => {
      if (text.includes(word)) scores.stressed += 2;
      if (new RegExp(`\\b${word}\\b`).test(text)) scores.stressed += 3;
    });
    
    happyWords.forEach(word => {
      if (text.includes(word)) scores.happy += 2;
      if (new RegExp(`\\b${word}\\b`).test(text)) scores.happy += 3;
    });
    
    sadWords.forEach(word => {
      if (text.includes(word)) scores.sad += 2;
      if (new RegExp(`\\b${word}\\b`).test(text)) scores.sad += 3;
    });
    
    calmWords.forEach(word => {
      if (text.includes(word)) scores.calm += 2;
      if (new RegExp(`\\b${word}\\b`).test(text)) scores.calm += 3;
    });
    
    // Find highest score
    const max = Math.max(...Object.values(scores));
    
    if (max === 0) return null;
    
    if (max === scores.stressed) return 'stressed';
    if (max === scores.happy) return 'happy';
    if (max === scores.sad) return 'sad';
    if (max === scores.calm) return 'calm';
    
    return null;
  };

  // Track conversation topics
  const updateConversationTopics = (text) => {
    const topics = ['school', 'grades', 'family', 'friends', 'work', 'future', 'health'];
    const mentionedTopics = topics.filter(topic => text.toLowerCase().includes(topic));
    
    if (mentionedTopics.length > 0) {
      conversationContext.current.topics = [
        ...new Set([...conversationContext.current.topics, ...mentionedTopics])
      ].slice(0, 3); // Keep only the 3 most recent topics
    }
  };
  
  // Enhanced AI response generation with conversation context
  const generateTherapistResponse = async (history, currentMood) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    
    const lastMessage = history[history.length - 1].text.toLowerCase();
    const context = conversationContext.current;

    // Response templates with contextual awareness
    const responses = {
      greeting: [
        "Hello! How are you feeling today? I'm here to support you.",
        "Hi there! What's on your mind today?",
        "Welcome back. How has your day been so far?"
      ],
      followUp: {
        happy: [
          "That's wonderful to hear! What specifically about [topic] is making you happy?",
          "I'm glad [topic] is going well for you. How does this positive experience make you feel?",
          "Celebrating these moments is important. What do you think contributed most to this happiness?"
        ],
        stressed: [
          "I understand [topic] can be stressful. What aspect is most challenging for you?",
          "When you think about [topic], what specific concerns come to mind?",
          "Let's break down what's happening with [topic]. Where would you like to start?"
        ],
        sad: [
          "I hear that [topic] is affecting you. Would you like to share more about what's happening?",
          "It sounds like [topic] is difficult right now. What emotions come up when you think about it?",
          "I'm here to listen about [topic]. What would be most helpful to discuss?"
        ],
        calm: [
          "You mentioned [topic]. What's helping you maintain this sense of calm?",
          "It seems [topic] is in a good place. How are you nurturing this balanced state?",
          "This sounds like a positive space. What would you like to explore about [topic]?"
        ]
      },
      reflection: {
        happy: [
          "It's great that [reason] is bringing you joy. How might you create more of these positive moments?",
          "Your happiness about [reason] is contagious! What does this tell you about what's important to you?",
          "Celebrating [reason] is wonderful. What would make this positive experience even better?"
        ],
        stressed: [
          "I hear that [reason] is stressful. What's one small step that might help alleviate this?",
          "When you feel stressed about [reason], what's typically most helpful for you?",
          "Let's focus on [reason]. What's within your control to improve this situation?"
        ],
        sad: [
          "I'm sorry to hear about [reason]. What kind of support would be most helpful right now?",
          "When you feel sad about [reason], what helps you cope?",
          "This sounds difficult. What would make dealing with [reason] a little easier?"
        ]
      },
      default: [
        "Thank you for sharing. How does this make you feel physically in your body?",
        "I appreciate you opening up about this. What thoughts come up when you consider this situation?",
        "That's interesting. Could you tell me more about that?",
        "Let's explore this further. What emotions arise when you think about this?"
      ]
    };

    // Response selection logic with conversation context
    let response;
    const lastTopic = context.topics[context.topics.length - 1] || 'things';
    
    if (/hello|hi|hey/i.test(lastMessage)) {
      response = responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
      context.lastResponseType = 'greeting';
    } 
    else if (context.lastResponseType === 'greeting' && currentMood) {
      const moodResponses = responses.followUp[currentMood];
      response = moodResponses[Math.floor(Math.random() * moodResponses.length)]
        .replace('[topic]', lastTopic);
      context.lastResponseType = 'followUp';
    }
    else if (/(because|reason|why|cause)/i.test(lastMessage) && currentMood) {
      const reason = lastMessage.match(/(because|reason|why|cause)\s+(.*)/i)?.[2] || 'this';
      const moodResponses = responses.reflection[currentMood];
      response = moodResponses[Math.floor(Math.random() * moodResponses.length)]
        .replace('[reason]', reason);
      context.lastResponseType = 'reflection';
    }
    else if (/thank|thanks|appreciate/i.test(lastMessage)) {
      response = "You're very welcome. Remember I'm here whenever you need support.";
      context.lastResponseType = 'default';
    }
    else if (currentMood) {
      response = responses.followUp[currentMood][Math.floor(Math.random() * responses.followUp[currentMood].length)]
        .replace('[topic]', lastTopic);
      context.lastResponseType = 'followUp';
    }
    else {
      response = responses.default[Math.floor(Math.random() * responses.default.length)];
      context.lastResponseType = 'default';
    }
    
    return response;
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
              {msg.role === 'assistant' && (
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
          <div className="message assistant">
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
            disabled={!message.trim()}
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