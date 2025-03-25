import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal"; // Importation du modal
import "./Packs.scss";

Modal.setAppElement("#root"); // Assure l'accessibilité

const Packs = () => {
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null); // Stocke le pack sélectionné
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3000/packs/getAllPacks")
      .then((response) => {
        setPacks(response.data);
      })
      .catch((error) => console.error("Erreur lors du chargement des packs:", error));
  }, []);

  const getBackgroundColor = (category) => {
    switch (category) {
      case "premium":
        return "#f8d7da";
      case "gold":
        return "#84e8d1";
      case "silver":
        return "#cce5ff";
      default:
        return "#ffffff";
    }
  };

  const getDiscountedPrice = (price, discount) => {
    return price - (price * discount) / 100;
  };

  const openModal = (pack) => {
    setSelectedPack(pack);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPack(null);
  };

  return (
    <div className="packs-container">
      <h1 className="section-title">Explorez Nos Offres</h1>
      <div className="packs-grid">
        {packs.map((pack) => {
          const discountedPrice = getDiscountedPrice(pack.price, pack.discount);
          return (
            <div
              key={pack.id}
              className="pack-card"
              style={{ backgroundColor: getBackgroundColor(pack.category) }}
              onClick={() => openModal(pack)} // Ouvre le modal au clic
            >
              <div className="discount-badge">-{pack.discount}%</div>
              <div className="pack-icon">
              📚 
              </div>
              <h3 className="pack-title">{pack.title}</h3>
              <p className="pack-content">
                <strong>Contenu :</strong> {pack.description}
              </p>
              <div className="pack-price">
                <p><strong>Prix initial :</strong> {pack.price}DT</p>
                <p className="discounted-price">
                <strong>Prix après réduction :</strong> {discountedPrice.toFixed(2)}DT
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
  isOpen={modalIsOpen}
  onRequestClose={closeModal}
  className="custom-modal"
  overlayClassName="custom-overlay"
>
  {selectedPack && (
    <>
      <h2 className="modal-title">{selectedPack.title}</h2>
      <div className="modal-content">
        <img src={`/assets/icons/${selectedPack.icon}`} alt="Pack Icon" />
        <p><strong>Description :</strong> {selectedPack.description}</p>
        <p><strong>Catégorie :</strong> {selectedPack.category}</p>
        <p><strong>Prix initial :</strong> {selectedPack.price}DT</p>
        <p><strong>Réduction :</strong> {selectedPack.discount}%</p>
        <p><strong>Prix après réduction :</strong> {getDiscountedPrice(selectedPack.price, selectedPack.discount).toFixed(2)}DT</p>
      </div>
      <button onClick={closeModal} className="close-button">X</button>

    </>
  )}
</Modal>

    </div>
  );
};

export default Packs;
