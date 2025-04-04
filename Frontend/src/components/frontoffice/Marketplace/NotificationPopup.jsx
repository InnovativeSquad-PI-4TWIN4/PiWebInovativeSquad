import React from "react";
import "./NotificationPopup.scss"; // Assure-toi d’avoir ce fichier

const NotificationPopup = ({ message, onClick }) => {
  return (
    <div className="notification-popup" onClick={onClick}>
      {message}
    </div>
  );
};

export default NotificationPopup;
