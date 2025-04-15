// src/components/frontoffice/signup/VerifyPending.jsx
import React from "react";
import "./EmailVerification.scss";

const VerifyPending = () => (
  <div className="email-verification-container">
    <div className="email-verification-box">
      <h2>📩 Vérification en attente</h2>
      <p>Un lien de confirmation a été envoyé à votre adresse email.</p>
      <p>Merci de vérifier votre boîte de réception.</p>
    </div>
  </div>
);

export default VerifyPending;
