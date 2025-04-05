import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Success.scss'; // (si tu veux styliser un peu)

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Traitement en cours...");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const amount = searchParams.get("amount");

    if (!userId || !amount) {
      setMessage("❌ Paramètres manquants.");
      return;
    }

    const recharge = async () => {
      try {
        const res = await axios.post(`http://localhost:3000/premium/recharge/${userId}`, {
          amount: parseFloat(amount),
        });
        setMessage("✅ Paiement réussi ! Solde rechargé avec succès.");
        setTimeout(() => {
          navigate("/marketplace"); // ou "/profile", comme tu veux
        }, 3000);
      } catch (err) {
        console.error("Erreur de recharge :", err);
        setMessage("❌ Une erreur est survenue lors de la recharge.");
      }
    };

    recharge();
  }, []);

  return (
    <div className="success-page">
      <h2>{message}</h2>
    </div>
  );
};

export default Success;
