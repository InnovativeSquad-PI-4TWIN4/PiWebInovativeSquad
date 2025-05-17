import { useState, useEffect, useRef } from "react";
import "./Home.scss";
import { FaBrain, FaRobot, FaBookOpen, FaExchangeAlt, FaRocket, FaComment, FaUserGraduate, FaUserTie, FaUserAlt, FaMapMarkedAlt, FaCalendarAlt, FaMicrophone } from "react-icons/fa";
import { BsTranslate, BsChatSquareText, BsFilePdf } from "react-icons/bs";

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState("welcome");
  const [geminiResponse, setGeminiResponse] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [glitchTitle, setGlitchTitle] = useState(false);
  const [neuralEffect, setNeuralEffect] = useState(false);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const terminalHistoryRef = useRef([]);
  const neuralNetworkRef = useRef(null);

  // Neural Network Animation
  useEffect(() => {
    if (neuralNetworkRef.current && activeSection === "welcome") {
      const canvas = neuralNetworkRef.current;
      const ctx = canvas.getContext("2d");
      let animationFrameId;
      let particles = [];
      let connections = [];
      
      // Set canvas dimensions
      const handleResize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        initializeParticles();
      };
      
      window.addEventListener('resize', handleResize);
      handleResize();
      
      // Initialize particles
      function initializeParticles() {
        particles = [];
        connections = [];
        const particleCount = Math.min(40, Math.floor(canvas.width * canvas.height / 15000));
        
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            vx: Math.random() * 0.5 - 0.25,
            vy: Math.random() * 0.5 - 0.25,
            active: Math.random() > 0.5,
            color: Math.random() > 0.7 ? '#0ff' : Math.random() > 0.5 ? '#f0c' : '#93f'
          });
        }
        
        // Create connections
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            if (Math.random() > 0.85) {
              connections.push({
                from: i,
                to: j,
                active: false,
                pulsePosition: 0,
                pulseSpeed: Math.random() * 0.05 + 0.02,
                pulseActive: false
              });
            }
          }
        }
      }
      
      // Animation function
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw connections
        connections.forEach(connection => {
          const fromParticle = particles[connection.from];
          const toParticle = particles[connection.to];
          
          const dx = toParticle.x - fromParticle.x;
          const dy = toParticle.y - fromParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < canvas.width / 4) {
            connection.active = true;
            
            ctx.beginPath();
            ctx.moveTo(fromParticle.x, fromParticle.y);
            ctx.lineTo(toParticle.x, toParticle.y);
            
            const baseOpacity = Math.max(0, 1 - (distance / (canvas.width / 4))) * 0.3;
            ctx.strokeStyle = `rgba(0, 255, 255, ${baseOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            // Pulse effect on random connections
            if (Math.random() < 0.001 && !connection.pulseActive) {
              connection.pulseActive = true;
              connection.pulsePosition = 0;
            }
            
            if (connection.pulseActive) {
              connection.pulsePosition += connection.pulseSpeed;
              
              if (connection.pulsePosition > 1) {
                connection.pulseActive = false;
                connection.pulsePosition = 0;
              } else {
                const pulseX = fromParticle.x + dx * connection.pulsePosition;
                const pulseY = fromParticle.y + dy * connection.pulsePosition;
                
                ctx.beginPath();
                ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#f0c';
                ctx.fill();
              }
            }
          } else {
            connection.active = false;
          }
        });
        
        // Update and draw particles
        particles.forEach(particle => {
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Bounce off edges
          if (particle.x < 0 || particle.x > canvas.width) {
            particle.vx = -particle.vx;
          }
          
          if (particle.y < 0 || particle.y > canvas.height) {
            particle.vy = -particle.vy;
          }
          
          // Randomly change activity state
          if (Math.random() < 0.005) {
            particle.active = !particle.active;
          }
          
          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = particle.active ? particle.color : 'rgba(255,255,255,0.3)';
          ctx.fill();
          
          // Glow effect for active particles
          if (particle.active) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particle.color === '#0ff' ? '0,255,255' : particle.color === '#f0c' ? '255,0,204' : '153,51,255'}, 0.2)`;
            ctx.fill();
          }
        });
        
        animationFrameId = window.requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.cancelAnimationFrame(animationFrameId);
      };
    }
  }, [activeSection]);

  // Circuit animation effect
  useEffect(() => {
    if (canvasRef.current && activeSection === "welcome") {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      // Set canvas dimensions
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Circuit grid params
      const gridSpacing = 50;
      const nodeRadius = 1;
      const nodeChance = 0.3;
      const lines = [];
      const pulses = [];
      const gridColor = "rgba(0, 255, 255, 0.15)";
      const primaryColor = "#0ff";
      const secondaryColor = "#f0c";
      
      const initGrid = () => {
        for (let x = 0; x < canvas.width; x += gridSpacing) {
          for (let y = 0; y < canvas.height; y += gridSpacing) {
            if (Math.random() < nodeChance) {
              // Chance to create horizontal line
              if (x + gridSpacing < canvas.width && Math.random() < 0.3) {
                lines.push({
                  x1: x,
                  y1: y,
                  x2: x + gridSpacing,
                  y2: y,
                  color: Math.random() < 0.8 ? primaryColor : secondaryColor,
                  opacity: 0.2 + Math.random() * 0.3
                });
                
                if (Math.random() < 0.3) {
                  pulses.push({
                    x1: x,
                    y1: y,
                    x2: x + gridSpacing,
                    y2: y,
                    pos: 0,
                    speed: 0.5 + Math.random() * 1.5,
                    size: 2 + Math.random() * 2,
                    color: Math.random() < 0.7 ? primaryColor : secondaryColor
                  });
                }
              }
              
              // Chance to create vertical line
              if (y + gridSpacing < canvas.height && Math.random() < 0.3) {
                lines.push({
                  x1: x,
                  y1: y,
                  x2: x,
                  y2: y + gridSpacing,
                  color: Math.random() < 0.8 ? primaryColor : secondaryColor,
                  opacity: 0.2 + Math.random() * 0.3
                });
                
                if (Math.random() < 0.3) {
                  pulses.push({
                    x1: x,
                    y1: y,
                    x2: x,
                    y2: y + gridSpacing,
                    pos: 0,
                    speed: 0.5 + Math.random() * 1.5,
                    size: 2 + Math.random() * 2,
                    color: Math.random() < 0.7 ? primaryColor : secondaryColor
                  });
                }
              }
            }
          }
        }
      };
      
      initGrid();
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw lines
        lines.forEach(line => {
          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1);
          ctx.lineTo(line.x2, line.y2);
          ctx.strokeStyle = line.color.replace(')', `, ${line.opacity})`).replace('rgb', 'rgba');
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        
        // Draw moving pulses
        pulses.forEach(pulse => {
          pulse.pos += pulse.speed;
          if (pulse.pos > 100) {
            pulse.pos = 0;
          }
          
          const percent = pulse.pos / 100;
          const x = pulse.x1 + (pulse.x2 - pulse.x1) * percent;
          const y = pulse.y1 + (pulse.y2 - pulse.y1) * percent;
          
          ctx.beginPath();
          ctx.arc(x, y, pulse.size, 0, Math.PI * 2);
          ctx.fillStyle = pulse.color;
          ctx.fill();
          
          // Add glow effect
          ctx.beginPath();
          ctx.arc(x, y, pulse.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = pulse.color.replace(')', ', 0.3)').replace('rgb', 'rgba');
          ctx.fill();
        });
        
        // Draw grid nodes
        for (let x = 0; x < canvas.width; x += gridSpacing) {
          for (let y = 0; y < canvas.height; y += gridSpacing) {
            if (Math.random() < nodeChance) {
              ctx.beginPath();
              ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
              ctx.fillStyle = gridColor;
              ctx.fill();
            }
          }
        }
        
        requestAnimationFrame(animate);
      };
      
      const animationId = requestAnimationFrame(animate);
      
      return () => {
        cancelAnimationFrame(animationId);
      };
    }
  }, [activeSection]);

  // Load effect
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    // Title glitch effect on interval
    const glitchInterval = setInterval(() => {
      setGlitchTitle(true);
      setTimeout(() => {
        setGlitchTitle(false);
      }, 200);
    }, 5000);
    
    return () => {
      clearInterval(glitchInterval);
    };
  }, []);
  
  // Terminal effect functions
  const addToTerminalHistory = (message, isUser = false) => {
    const newEntry = { message, isUser, timestamp: new Date().toLocaleTimeString() };
    terminalHistoryRef.current = [...terminalHistoryRef.current, newEntry];
    return newEntry;
  };
  
  const processGeminiRequest = async (input) => {
    addToTerminalHistory(input, true);
    setIsProcessing(true);
    
    // Initialize the "thinking" dots
    let thinkingMessage = "SYSTEM > Analyzing input";
    const thinkingEntry = addToTerminalHistory(thinkingMessage);
    
    // Simulate thinking with dots
    const thinkInterval = setInterval(() => {
      thinkingMessage += ".";
      if (thinkingMessage.endsWith("....")) {
        thinkingMessage = "SYSTEM > Analyzing input";
      }
      terminalHistoryRef.current[terminalHistoryRef.current.length - 1] = {
        ...thinkingEntry,
        message: thinkingMessage
      };
      setGeminiResponse(prev => prev + ""); // Force update
    }, 300);
    
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}?key=${import.meta.env.VITE_API_KEY}`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-1.5-flash",
          contents: [{ role: "user", parts: [{ text: input }] }]
        })
      });
      
      clearInterval(thinkInterval);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const apiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from API";
      
      // Remove thinking message and add actual response
      terminalHistoryRef.current = terminalHistoryRef.current.filter(entry => entry !== thinkingEntry);
      addToTerminalHistory(`GEMINI > ${apiResponseText}`);
      setGeminiResponse(apiResponseText);
    } catch (error) {
      clearInterval(thinkInterval);
      terminalHistoryRef.current = terminalHistoryRef.current.filter(entry => entry !== thinkingEntry);
      addToTerminalHistory(`ERROR > ${error.message}`);
      setGeminiResponse(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleGeminiSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() !== "") {
      processGeminiRequest(userInput);
      setUserInput("");
    }
  };

  // Neural network toggle effect
  const toggleNeuralEffect = () => {
    setNeuralEffect(!neuralEffect);
  };

  return (
    <div className={`dashboard-container ${isLoaded ? "loaded" : "loading"}`}>
      {/* Circuit background */}
      <canvas ref={canvasRef} className="circuit-background"></canvas>
      
      {/* Ambient particles */}
      <div className="ambient-background">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
      </div>

      {/* Dashboard header */}
      <div className="dashboard-header">
        <div className="cyberpunk-title-container">
          <div className="title-decorations">
            <div className="circuit-line left"></div>
            <div className="circuit-line right"></div>
          </div>
          <h1 
            ref={titleRef}
            className={`cyberpunk-title ${glitchTitle ? "glitch-effect" : ""}`} 
            data-text="NEURO SKILL SYNC"
          >
            
            <span className="title-highlight">SKILL</span>
            <span className="title-divider">/</span>
            <span className="title-main">SYNC</span>
          </h1>
          <div className="subtitle-container">
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
            <p className="subtitle">AI-POWERED SKILL EXCHANGE PLATFORM</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="section-tabs">
          <button 
            className={`tab-btn ${activeSection === "welcome" ? "active" : ""}`}
            onClick={() => setActiveSection("welcome")}
          >
            <FaRocket className="tab-icon" /> Welcome
          </button>
          <button 
            className={`tab-btn ${activeSection === "ai-features" ? "active" : ""}`}
            onClick={() => setActiveSection("ai-features")}
          >
            <FaBrain className="tab-icon" /> AI Features
          </button>
          <button 
            className={`tab-btn ${activeSection === "gemini-interface" ? "active" : ""}`}
            onClick={() => setActiveSection("gemini-interface")}
          >
            <FaRobot className="tab-icon" /> Gemini Terminal
          </button>
          <button 
            className={`tab-btn ${activeSection === "skills-marketplace" ? "active" : ""}`}
            onClick={() => setActiveSection("skills-marketplace")}
          >
            <FaExchangeAlt className="tab-icon" /> Skills Exchange
          </button>
          <button 
            className={`tab-btn ${activeSection === "learning" ? "active" : ""}`}
            onClick={() => setActiveSection("learning")}
          >
            <FaBookOpen className="tab-icon" /> Learning Hub
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="dashboard-content">
        <div className="glass-panel">
          {/* Welcome Section */}
          <div className={`dashboard-section ${activeSection === "welcome" ? "active" : ""}`}>
            <div className="neural-network-container">
              <canvas ref={neuralNetworkRef} className="neural-network-canvas"></canvas>
              <div className="welcome-content">
                <h2 className="section-title">
                  Welcome to the <span className="neon-text">Next Gen</span> Learning Experience
                </h2>
                <p className="welcome-text">
                  SkillBridge is an AI-powered skill exchange and learning platform that combines
                  cutting-edge AI technology with human expertise to create a unique learning ecosystem.
                </p>
                
                <div className="feature-cards">
                  <div className="feature-card">
                    <div className="feature-icon">
                      <FaBrain />
                    </div>
                    <h3>AI-Powered Learning</h3>
                    <p>Advanced algorithms customize your learning experience based on your skills and goals</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <FaExchangeAlt />
                    </div>
                    <h3>Skill Exchange</h3>
                    <p>Trade your expertise for knowledge in a dynamic peer-to-peer marketplace</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <FaRocket />
                    </div>
                    <h3>Accelerated Growth</h3>
                    <p>Learn faster with AI assistance and real-time feedback from experts</p>
                  </div>
                </div>
                
                <div className="welcome-cta">
                  <button className="cta-button primary" onClick={() => setActiveSection("ai-features")}>
                    Explore AI Features
                  </button>
                  <button className="cta-button secondary" onClick={() => setActiveSection("skills-marketplace")}>
                    Browse Skills Marketplace
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Features Section */}
<div className={`dashboard-section ${activeSection === "ai-features" ? "active" : ""}`}>
  <div className="section-header">
    <h2 className="section-title">
      <span className="neon-text">AI-Powered</span> Learning Ecosystem
    </h2>
    <p className="section-subtitle">
      Our integrated AI tools enhance every aspect of your learning journey
    </p>
  </div>
  
  <div className="ai-features-grid">
    <div className="ai-feature-card">
      <div className="feature-icon">
        <FaUserTie />
      </div>
      <h3>AI Therapist</h3>
      <p>Mental health support designed for learners experiencing stress or burnout</p>
      <div className="feature-hover">
        <a href="http://localhost:5173/Full" className="hover-icon">Try Now</a>
      </div>
    </div>
    
    <div className="ai-feature-card">
      <div className="feature-icon">
        <BsFilePdf />
      </div>
      <h3>PDF Summarizer</h3>
      <p>Extract key concepts and summaries from lengthy educational materials</p>
      <div className="feature-hover">
        <a href="http://localhost:5173/Full" className="hover-icon">Try Now</a>
      </div>
    </div>
    
    <div className="ai-feature-card">
      <div className="feature-icon">
        <FaCalendarAlt />
      </div>
      <h3>Schedule Generator</h3>
      <p>Create optimized learning schedules that fit around your existing commitments</p>
      <div className="feature-hover">
        <a href="http://localhost:5173/Full" className="hover-icon">Try Now</a>
      </div>
    </div>
    
    <div className="ai-feature-card">
      <div className="feature-icon">
        <BsTranslate />
      </div>
      <h3>AI Translator</h3>
      <p>Real-time translation of educational content in multiple languages</p>
      <div className="feature-hover">
        <a href="http://localhost:5173/Full" className="hover-icon">Try Now</a>
      </div>
    </div>
    
    <div className="ai-feature-card">
      <div className="feature-icon">
        <FaMicrophone />
      </div>
      <h3>Voice Chat Assistant</h3>
      <p>Hands-free learning through natural voice conversations with AI</p>
      <div className="feature-hover">
        <a href="http://localhost:5173/Full" className="hover-icon">Try Now</a>
      </div>
    </div>
    
    <div className="ai-feature-card">
      <div className="feature-icon">
        <FaMapMarkedAlt />
      </div>
      <h3>Roadmap Generator</h3>
      <p>Personalized learning paths that guide you from beginner to expert</p>
      <div className="feature-hover">
        <a href="http://localhost:5173/Full" className="hover-icon">Try Now</a>
      </div>
    </div>
    
    <div className="ai-feature-card">
      <div className="feature-icon">
        <FaUserGraduate />
      </div>
      <h3>Course Generator</h3>
      <p>Create custom courses on topics not available in our course library</p>
      <div className="feature-hover">
        <a href="http://localhost:5173/Full" className="hover-icon">Try Now</a>
      </div>
    </div>
    
    <div className="ai-feature-card">
      <div className="feature-icon">
        <BsChatSquareText />
      </div>
      <h3>AI Chatbot</h3>
      <p>24/7 learning assistant to answer questions and provide guidance</p>
      <div className="feature-hover">
        <a href="http://localhost:5173/Full" className="hover-icon">Try Now</a>
      </div>
    </div>
  </div>
  

</div>
          
          {/* Gemini Interface Section */}
          <div className={`dashboard-section ${activeSection === "gemini-interface" ? "active" : ""}`}>
            <div className="gemini-container">
              <div className="gemini-header">
                <div className="gemini-title">
                  <FaRobot className="gemini-icon" />
                  <h2>Gemini <span className="version-tag">v1.5</span> Terminal</h2>
                </div>
                <div className="gemini-status">
                  <div className={`status-indicator ${isProcessing ? "processing" : "ready"}`}></div>
                  <span>{isProcessing ? "Processing..." : "Ready"}</span>
                </div>
              </div>
              
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-controls">
                    <span className="control close"></span>
                    <span className="control minimize"></span>
                    <span className="control maximize"></span>
                  </div>
                  <div className="terminal-title">gemini@neuro-skill-sync:~</div>
                </div>
                
                <div className="terminal-content">
                  <div className="terminal-welcome">
                    <p className="welcome-line">GEMINI NEURAL INTERFACE v1.5.1</p>
                    <p className="welcome-line">Copyright (c) 2025 NeuroSkillSync</p>
                    <p className="welcome-line">Type your query below to interact with Gemini API</p>
                    <p className="welcome-line">-------------------------------------------</p>
                  </div>
                  
                  <div className="terminal-history">
                    {terminalHistoryRef.current.map((entry, index) => (
                      <div 
                        key={index} 
                        className={`terminal-entry ${entry.isUser ? "user-entry" : "system-entry"}`}
                      >
                        <span className="entry-timestamp">[{entry.timestamp}]</span>
                        <span className="entry-content">{entry.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <form onSubmit={handleGeminiSubmit} className="terminal-input-container">
                  <span className="input-prompt">$</span>
                  <input
                    type="text"
                    className="terminal-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask Gemini anything..."
                    disabled={isProcessing}
                  />
                </form>
              </div>
              
              <div className="terminal-suggestions">
                <p className="suggestion-title">Try asking about:</p>
                <div className="suggestion-chips">
                  <button 
                    className="suggestion-chip"
                    onClick={() => setUserInput("Generate a learning roadmap for JavaScript")}
                  >
                    Learning roadmap
                  </button>
                  <button 
                    className="suggestion-chip"
                    onClick={() => setUserInput("Summarize key concepts of machine learning")}
                  >
                    Concept summary
                  </button>
                  <button 
                    className="suggestion-chip"
                    onClick={() => setUserInput("Create a 4-week study schedule for web development")}
                  >
                    Study schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Skills Marketplace Section */}
          <div className={`dashboard-section ${activeSection === "skills-marketplace" ? "active" : ""}`}>
            <div className="section-header">
              <h2 className="section-title">
                Skills <span className="neon-text">Marketplace</span>
              </h2>
              <p className="section-subtitle">
                Exchange knowledge and expertise in our peer-to-peer learning community
              </p>
            </div>
            
            <div className="marketplace-filters">
              <div className="filter-group">
                <div className="filter-label">Sample:</div>
                <div className="filter-options">
                
                </div>
              </div>
              
              
            </div>
            
            <div className="skills-grid">
              {/* Skill Cards */}
              {[
                {
                  title: "Advanced React Development",
                  instructor: "Alex Chen",
                  rating: 4.9,
                  reviews: 87,
                  image: "react",
                  tags: ["Programming", "Frontend", "JavaScript"]
                },
                {
                  title: "UX/UI Design Fundamentals",
                  instructor: "Maya Williams",
                  rating: 4.8,
                  reviews: 124,
                  image: "uxui",
                  tags: ["Design", "UX", "Creative"]
                },
                {
                  title: "Machine Learning with Python",
                  instructor: "Dr. Raj Patel",
                  rating: 4.9,
                  reviews: 156,
                  image: "ml",
                  tags: ["Programming", "Data Science", "AI"]
                },
                {
                  title: "Digital Marketing Strategy",
                  instructor: "Sarah Johnson",
                  rating: 4.7,
                  reviews: 93,
                  image: "marketing",
                  tags: ["Business", "Marketing", "Strategy"]
                },
                {
                  title: "Blockchain Development",
                  instructor: "Mike Zhang",
                  rating: 4.8,
                  reviews: 72,
                  image: "blockchain",
                  tags: ["Programming", "Cryptocurrency", "Web3"]
                },
                {
                  title: "Cybersecurity Essentials",
                  instructor: "Elena Novak",
                  rating: 4.9,
                  reviews: 108,
                  image: "security",
                  tags: ["IT", "Security", "Networking"]
                },
                
              ].map((skill, index) => (
                <div key={index} className="skill-card">
                  <div className={`skill-image ${skill.image}`}>
                    <div className="skill-overlay">
                      <span className="view-btn">View Details</span>
                    </div>
                  </div>
                  <div className="skill-info">
                    <h3 className="skill-title">{skill.title}</h3>
                    <div className="skill-instructor">
                      <FaUserAlt className="instructor-icon" />
                      <span>{skill.instructor}</span>
                    </div>
                    <div className="skill-rating">
                      <div className="stars">
                        {"★".repeat(Math.floor(skill.rating))}
                        {skill.rating % 1 !== 0 ? "½" : ""}
                        {"☆".repeat(5 - Math.ceil(skill.rating))}
                      </div>
                      <span className="reviews">({skill.reviews} reviews)</span>
                    </div>
                    <div className="skill-tags">
                      {skill.tags.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="marketplace-cta">
  <a href="http://localhost:5173/marketplace">
    <button className="skill-exchange-btn">
      <FaExchangeAlt className="btn-icon" />
      Offer Your Skills
    </button>
  </a>
  <a href="http://localhost:5173/marketplace">
    <button className="browse-more-btn">
      Browse All Skills
    </button>
  </a>
</div>
          </div>
          
          {/* Learning Hub Section */}
          <div className={`dashboard-section ${activeSection === "learning" ? "active" : ""}`}>
            <div className="section-header">
              <h2 className="section-title">
                Learning <span className="neon-text">Hub</span>
              </h2>
              <p className="section-subtitle">
                Connect with instructors, join learning rooms, and access real-time sessions
              </p>
            </div>
            
            <div className="learning-features">
              <div className="learning-feature">
                <div className="feature-icon">
                  <FaComment />
                </div>
                <div className="feature-content">
                  <h3>Real-time Chat</h3>
                  <p>Connect with instructors and fellow learners through text, voice, and video</p>
                </div>
              </div>
              
              <div className="learning-feature">
                <div className="feature-icon">
                  <FaUserGraduate />
                </div>
                <div className="feature-content">
                  <h3>Virtual Classrooms</h3>
                  <p>Join interactive learning rooms with specialized tools for effective teaching</p>
                </div>
              </div>
              
              <div className="learning-feature">
                <div className="feature-icon">
                  <FaBookOpen />
                </div>
                <div className="feature-content">
                  <h3>AI Course Library</h3>
                  <p>Browse our extensive collection of AI-enhanced courses across all disciplines</p>
                </div>
              </div>
            </div>
            
            
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default Home;
