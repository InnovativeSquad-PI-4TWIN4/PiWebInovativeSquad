import React from 'react';
import PersonalSpace from './PersonalSpace'; // Assuming PersonalSpace.jsx is in the same directory
import RoadmapGenerator from './RoadmapGenerator'; // Assuming RoadmapGenerator.jsx is in the same directory
import './Full.scss'; // Assuming you create a Full.scss for combined styling
import Schedule from './schedule';

const Full = () => {
  return (
    <div className="full-page-container">
      <div className="full-page-section">
        <PersonalSpace />
      </div>
      <div className="full-page-section">
        <RoadmapGenerator />
      </div>
      <div className="full-page-section">
        <Schedule />
      </div>
    </div>
  );
};

export default Full;