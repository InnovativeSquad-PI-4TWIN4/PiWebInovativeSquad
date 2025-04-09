import React, { useState, useEffect, useRef } from 'react';
import Notes from './Notes';
import KnowledgeNexus from './KnowledgeNexus';
import TherapistChat from './TherapistChat';
import './Personal.scss';

const Personal = () => {
  const [activeSection, setActiveSection] = useState('notes');
  const [isLoading, setIsLoading] = useState(true);
  const titleRef = useRef(null);
  
  useEffect(() => {
    // Simulate loading for smooth transition effect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Glitch effect setup
    const glitchEffect = () => {
      if (titleRef.current) {
        titleRef.current.classList.add('glitch-effect');
        
        setTimeout(() => {
          if (titleRef.current) {
            titleRef.current.classList.remove('glitch-effect');
          }
        }, 200);
      }
    };
    
    // Run glitch effect randomly
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        glitchEffect();
      }
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(glitchInterval);
    };
  }, []);
  
  return (
    <div className={`dashboard-container ${isLoading ? 'loading' : 'loaded'}`}>
      <header className="dashboard-header">
        <div className="cyberpunk-title-container">
          <div className="title-decorations">
            <div className="circuit-line left"></div>
            <div className="circuit-line right"></div>
          </div>
          
          <h1 ref={titleRef} className="cyberpunk-title">
            <span className="title-main">Personal</span>
            <span className="title-divider">//</span>
            <span className="title-highlight">Space</span>
          </h1>
          
          <div className="subtitle-container">
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
            <p className="subtitle">Student Wellness Interface</p>
          </div>
        </div>
        
        <div className="section-tabs">
          <button 
            className={`tab-btn ${activeSection === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveSection('notes')}
            aria-label="Notes"
          >
            <span className="tab-icon">📝</span>
            Notes
          </button>
          <button 
            className={`tab-btn ${activeSection === 'knowledge' ? 'active' : ''}`}
            onClick={() => setActiveSection('knowledge')}
            aria-label="Knowledge Nexus"
          >
            <span className="tab-icon">🧠</span>
            Knowledge Nexus
          </button>
          <button 
            className={`tab-btn ${activeSection === 'therapist' ? 'active' : ''}`}
            onClick={() => setActiveSection('therapist')}
            aria-label="Psychotherapist"
          >
            <span className="tab-icon">💭</span>
            Psychotherapist
          </button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="glass-panel">
          <div className={`dashboard-section ${activeSection === 'notes' ? 'active' : ''}`}>
            <Notes />
          </div>
          
          <div className={`dashboard-section ${activeSection === 'knowledge' ? 'active' : ''}`}>
            <KnowledgeNexus />
          </div>
          
          <div className={`dashboard-section ${activeSection === 'therapist' ? 'active' : ''}`}>
            <TherapistChat />
          </div>
        </div>
      </div>
      
      <div className="ambient-background">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
      </div>
    </div>
  );
};

export default Personal;