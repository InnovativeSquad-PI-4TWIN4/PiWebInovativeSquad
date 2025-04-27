// src/components/frontoffice/WheelOfFortune/WheelOfFortune.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WheelOfFortune.scss";
import { motion } from "framer-motion";

const rewards = [
  { label: "10DT", value: 10 },
  { label: "30DT", value: 30 },
  { label: "50DT", value: 50 },
  { label: "Cours Premium Gratuit", value: "premium" },
  { label: "Rien", value: 0 },
];

const WheelOfFortune = () => {
  const [eligible, setEligible] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;
        setUserId(user._id);
        const res = await axios.get(`http://localhost:3000/api/wheel/check-eligibility/${user._id}`);
        setEligible(res.data.eligible);
      } catch (err) {
        console.error("Erreur dans la vérification de l'éligibilité :", err);
      }
    };

    checkEligibility();
  }, []);

  const spinWheel = () => {
    setSpinning(true);
    setTimeout(async () => {
      const randomIndex = Math.floor(Math.random() * rewards.length);
      const reward = rewards[randomIndex];
      setResult(reward);
      setSpinning(false);

      if (reward.value === 10 || reward.value === 30 || reward.value === 50) {
        try {
          await axios.post(`http://localhost:3000/api/wheel/update-solde/${userId}`, { amount: reward.value });

          // 🔄 Mettre à jour aussi localStorage pour afficher le nouveau solde sans recharger
          const user = JSON.parse(localStorage.getItem("user"));
          const updatedUser = { ...user, solde: (user.solde || 0) + reward.value };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
          console.error("Erreur lors de la mise à jour du solde :", err);
        }
      }
    }, 2500); // 2,5 secondes pour simuler la rotation
  };

  return (
    <div className="wheel-container">
      <h1>🎉 Wheel of Luck 🎉</h1>
      {eligible ? (
        <div className="wheel-content">
          <motion.div
            className={`wheel ${spinning ? "spinning" : ""}`}
            animate={{ rotate: spinning ? 1080 : 0 }}
            transition={{ duration: 2.5 }}
          >
            🎈
          </motion.div>
          <button onClick={spinWheel} disabled={spinning} className="spin-btn">
            {spinning ? "En cours..." : "Spinning the wheel"}
          </button>
          {result && (
            <div className="result">
              <h2>Résultat : {result.label}</h2>
            </div>
          )}
        </div>
      ) : (
        <p className="not-eligible">Validez au moins un quiz IA pour jouer 🚀</p>
      )}
    </div>
  );
};

export default WheelOfFortune;
