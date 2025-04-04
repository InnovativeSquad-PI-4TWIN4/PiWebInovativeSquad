import React, { useEffect, useRef } from 'react';
import './CyberpunkTitle.scss';

const CyberpunkTitle = () => {
  const titleRef = useRef(null);
  
  useEffect(() => {
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
    
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="cyberpunk-title-container">
      <div className="title-decorations">
        <div className="circuit-line left"></div>
        <div className="circuit-line right"></div>
      </div>
      
      <h1 ref={titleRef} className="cyberpunk-title">
        <span className="title-main">Work</span>
        <span className="title-divider">//</span>
        <span className="title-highlight">Smarter</span>
      </h1>
      
      <div className="subtitle-container">
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <p className="subtitle">Advanced Skill Integration Platform</p>
      </div>
    </div>
  );
};

export default CyberpunkTitle;