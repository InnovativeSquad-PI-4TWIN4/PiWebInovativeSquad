import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ExchangeRoom";

const ExchangeRoom = () => {
  const { packId } = useParams();
  const [proposals, setProposals] = useState([]);
  const [offeredSkill, setOfferedSkill] = useState("");
  const [requestedSkill, setRequestedSkill] = useState("");

  const handleSendProposal = async () => {
    const proposal = {
      packId,
      offeredSkill,
      requestedSkill
    };

    // Tu peux faire un POST ici pour sauvegarder côté backend
    setProposals((prev) => [...prev, proposal]);

    // Reset
    setOfferedSkill("");
    setRequestedSkill("");
  };

  return (
    <div className="exchange-room">
      <h2>🤝 Propose ton échange de compétences</h2>

      <div className="proposal-form">
        <input
          type="text"
          placeholder="Je propose (ex: React)"
          value={offeredSkill}
          onChange={(e) => setOfferedSkill(e.target.value)}
        />
        <input
          type="text"
          placeholder="Je cherche (ex: Angular)"
          value={requestedSkill}
          onChange={(e) => setRequestedSkill(e.target.value)}
        />
        <button onClick={handleSendProposal}>Proposer un échange</button>
      </div>

      <h3>💡 Échanges proposés</h3>
      <ul className="proposal-list">
        {proposals.map((p, index) => (
          <li key={index}>
            Je propose <strong>{p.offeredSkill}</strong> contre <strong>{p.requestedSkill}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExchangeRoom;
