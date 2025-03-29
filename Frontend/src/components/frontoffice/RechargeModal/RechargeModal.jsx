import React, { useState } from 'react';
import './RechargeModal.scss';
import axios from 'axios';

const RechargeModal = ({ isOpen, onClose, onSuccess, userId }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRecharge = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Montant invalide.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`http://localhost:3000/courses/recharge/${userId}`, {
        amount: parseFloat(amount)
      });
      alert("✅ Recharge effectuée avec succès.");
      onSuccess();
    } catch (err) {
      console.error("Erreur lors de la recharge:", err);
      alert("Erreur serveur lors de la recharge.");
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
          <button className="confirm-btn" onClick={handleRecharge} disabled={loading}>
            {loading ? 'Traitement...' : 'Recharge'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RechargeModal;