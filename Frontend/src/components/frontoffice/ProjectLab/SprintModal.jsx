// 📁 src/components/ProjectLab/SprintModal.jsx
import React from "react";
import "./SprintModal.scss";

const SprintModal = ({ sprint, onClose }) => {
  return (
    <div className="sprint-modal-overlay">
      <div className="sprint-modal">
        <h2>📅 Sprint Plan Généré</h2>
        <p><strong>Objectif :</strong> {sprint.objective}</p>
        <p><strong>Deadline :</strong> {new Date(sprint.deadline).toLocaleDateString()}</p>

        {sprint.steps?.length > 0 ? (
          <div className="sprint-steps">
            {sprint.steps.map((step, index) => (
              <div key={index} className="sprint-step">
                <h3>{step.week}</h3>
                <ul>
                  {step.tasks.map((task, i) => (
                    <li key={i}>✅ {task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>⚠️ Aucun détail de sprint généré.</p>
        )}

        <button onClick={onClose}>❌ Fermer</button>
      </div>
    </div>
  );
};

export default SprintModal;
