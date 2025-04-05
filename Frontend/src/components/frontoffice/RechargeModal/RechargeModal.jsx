import React, { useState } from 'react';
import './RechargeModal.scss';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe("pk_test_51R95PeH6REffr..."); // ta clé publique

const RechargeModal = ({ isOpen, onClose, userId }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleStripePayment = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Montant invalide.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, userId }),
      });

      const data = await res.json();
    window.location.href = data.url;


    } catch (error) {
      console.error("Erreur Stripe :", error);
      alert("Erreur lors de la redirection vers Stripe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recharge-modal-overlay">
      <div className="recharge-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>💳 Recharge your balance</h2>
        <div className="input-group">
          <input
            type="number"
            placeholder="Amount in DT"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="btn-group">
          <button className="cancel-btn" onClick={onClose}>Close</button>
          <button className="confirm-btn" onClick={handleStripePayment} disabled={loading}>
            {loading ? 'Redirection...' : 'Payer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RechargeModal;
