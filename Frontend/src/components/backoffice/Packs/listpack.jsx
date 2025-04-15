import React, { useEffect, useState } from "react";
import axios from "axios";
import AddPacks from "./packs";
import { FaEdit, FaTrash } from "react-icons/fa";
import Modal from "react-modal";
import UpdatePackForm from "./updatepack";
import "./listpack.scss";

Modal.setAppElement("#root");

const PackAdmin = () => {
  const [packs, setPacks] = useState([]);
  const [isAddPackOpen, setIsAddPackOpen] = useState(false);
  const [isUpdatePackOpen, setIsUpdatePackOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/packs/getAllPacks")
      .then((response) => setPacks(response.data))
      .catch((error) => console.error("Erreur chargement packs:", error));
  }, []);

  const openAddPackForm = () => setIsAddPackOpen(true);
  const closeAddPackForm = () => setIsAddPackOpen(false);
  const openUpdatePackForm = (pack) => {
    setSelectedPack(pack);
    setIsUpdatePackOpen(true);
  };
  const closeUpdatePackForm = () => {
    setSelectedPack(null);
    setIsUpdatePackOpen(false);
  };

  const calculateDiscountedPrice = (price, discount) => price - (price * discount) / 100;

  const handleDeletePack = (id) => {
    axios
      .delete(`http://localhost:3000/packs/deletePack/${id}`)
      .then(() => {
        setPacks(packs.filter((pack) => pack.id !== id));
        console.log("Pack supprimé");
      })
      .catch((error) => console.error("Erreur suppression:", error));
  };

  const getBadgeColor = (category) => {
    switch (category) {
      case "premium": return "badge-premium";
      case "gold": return "badge-gold";
      case "silver": return "badge-silver";
      default: return "badge-default";
    }
  };

  return (
    <div className="pack-admin-container">
      <div className="header-actions">
        <h2>Packs Management</h2>
        <button className="btn-add" onClick={openAddPackForm}>+ ADD pack</button>
      </div>

      <Modal
        isOpen={isAddPackOpen}
        onRequestClose={closeAddPackForm}
        className="modal-form"
        overlayClassName="modal-overlay"
      >
        <AddPacks onClose={closeAddPackForm} />
      </Modal>

      <div className="pack-grid">
        {packs.map((pack) => {
          const discounted = calculateDiscountedPrice(pack.price, pack.discount);
          return (
<div key={pack.id} className={`pack-card category-${pack.category}`}>
<div className="card-header">
                <span className="category-badge">{pack.category}</span>
              </div>
              <h3 className="pack-title">{pack.title}</h3>
              <p className="author">Ajouté par : <strong>{pack.addedBy || "Inconnu"}</strong></p>
              <p className="pack-desc">{pack.description}</p>
              <div className="price-box">
                <p className="original">{pack.price} DT</p>
                <p className="discounted">{discounted.toFixed(2)} DT</p>
              </div>
              <div className="card-actions">
                <button className="btn-edit" onClick={() => openUpdatePackForm(pack)}>
                  <FaEdit /> Modifier
                </button>
                <button className="btn-delete" onClick={() => handleDeletePack(pack.id)}>
                  <FaTrash /> Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isUpdatePackOpen}
        onRequestClose={closeUpdatePackForm}
        className="modal-form"
        overlayClassName="modal-overlay"
      >
        <UpdatePackForm pack={selectedPack} onClose={closeUpdatePackForm} onUpdatePack={setPacks} />
      </Modal>
    </div>
  );
};

export default PackAdmin;
