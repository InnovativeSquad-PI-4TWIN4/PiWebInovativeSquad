// src/components/frontoffice/RobotAssistant/RobotButton.jsx
import React from 'react';
import { motion } from 'framer-motion';
import './RobotButton.scss';

const RobotButton = ({ onClick }) => {
  return (
    <motion.button
      className="robot-button"
      onClick={onClick}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      🤖
    </motion.button>
  );
};

export default RobotButton;
