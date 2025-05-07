import React, { useState, useEffect } from 'react';
import PersonalSpace from './PersonalSpace';
import RoadmapGenerator from './RoadmapGenerator';
import Schedule from './schedule';
import CyberpunkTitle from './CyberpunkTitle';
import RealTimeTranslator from './RealTimeTranslator';
import './Full.scss';

const Full = () => {
  const [activeSection, setActiveSection] = useState('personalSpace');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`dashboard-container ${isLoading ? 'loading' : 'loaded'}`}>
      <div className="dashboard-header">
        <CyberpunkTitle />
        <div className="section-tabs">
          <button 
            className={`tab-btn ${activeSection === 'personalSpace' ? 'active' : ''}`}
            onClick={() => setActiveSection('personalSpace')}
            aria-label="Personal Space"
          >
            <span className="tab-icon">✦</span>
            Personal Space
          </button>
          <button 
            className={`tab-btn ${activeSection === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveSection('roadmap')}
            aria-label="Skill Roadmap"
          >
            <span className="tab-icon">⟁</span>
            Skill Roadmap
          </button>
          <button 
            className={`tab-btn ${activeSection === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveSection('schedule')}
            aria-label="Schedule"
          >
            <span className="tab-icon">◎</span>
            Schedule
          </button>
          <button 
            className={`tab-btn ${activeSection === 'translator' ? 'active' : ''}`}
            onClick={() => setActiveSection('translator')}
            aria-label="Real-Time Translator"
          >
            <span className="tab-icon">🌐</span>
            Translator
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="glass-panel">
          <div className={`dashboard-section ${activeSection === 'personalSpace' ? 'active' : ''}`}>
            <PersonalSpace />
          </div>
          
          <div className={`dashboard-section ${activeSection === 'roadmap' ? 'active' : ''}`}>
            <RoadmapGenerator />
          </div>
          
          <div className={`dashboard-section ${activeSection === 'schedule' ? 'active' : ''}`}>
            <Schedule />
          </div>
          
          <div className={`dashboard-section ${activeSection === 'translator' ? 'active' : ''}`}>
            {/* RealTimeTranslator is now rendered on main content only on translator tab */}
            <div className="translator-content">
              <h2>Real-Time Translator</h2>
              <p>This powerful tool allows you to translate spoken language in real-time, 
                upload text documents for translation, or manually enter text to translate.</p>
              <p>For quick access from any page, use the translator bubble in the bottom left corner.</p>
              
              <div className="translator-features">
                <div className="feature">
                  <h3>🎤 Speech Recognition</h3>
                  <p>Record your voice and get instant translation</p>
                </div>
                <div className="feature">
                  <h3>📄 Document Translation</h3>
                  <p>Upload text files for quick translation</p>
                </div>
                <div className="feature">
                  <h3>💬 Text Translation</h3>
                  <p>Type or paste text for immediate translation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* RealTimeTranslator component is now outside the sections - it will be visible on all pages */}
      <RealTimeTranslator />
      
      <div className="ambient-background">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
      </div>
    </div>
  );
};

Full.displayName = 'DashboardContainer';

export default Full;