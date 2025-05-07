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

  console.log('Active section:', activeSection);

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
            <RealTimeTranslator />
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

Full.displayName = 'DashboardContainer';

export default Full;

