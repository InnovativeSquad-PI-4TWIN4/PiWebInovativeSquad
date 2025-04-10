import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EmailVerification.scss";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get(`http://localhost:3000/users/verify-email/${token}`);
        setTimeout(() => navigate("/signin"), 3000);
      } catch (error) {
        console.error("Erreur vérification :", error);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="email-verification-container">
      <div className="email-verification-box">
        <h2>✅ Email vérifié avec succès !</h2>
        <p>Redirection vers la page de connexion...</p>
      </div>
    </div>
  );
};

export default EmailVerification;
