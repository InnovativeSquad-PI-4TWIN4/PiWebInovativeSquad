import React, { useEffect, useState } from "react";
import axios from "axios";
import AddPacks from "./packs"; // Importez le formulaire AddPacks
import { FaEdit, FaTrash } from "react-icons/fa"; // Importation des icônes pour modifier et supprimer
import Modal from "react-modal"; // Importation de react-modal
import UpdatePackForm from "./updatepack"; // Importer le formulaire de mise à jour

Modal.setAppElement("#root"); // Nécessaire pour le bon fonctionnement de react-modal

const PackAdmin = () => {
  const [packs, setPacks] = useState([]);
  const [isAddPackOpen, setIsAddPackOpen] = useState(false);
  const [isUpdatePackOpen, setIsUpdatePackOpen] = useState(false); // Gestion de l'ouverture du formulaire de mise à jour
  const [selectedPack, setSelectedPack] = useState(null); // Le pack sélectionné à modifier

  useEffect(() => {
    // Récupérer les packs depuis l'API
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
        return "#f8d7da"; // Rose clair
      case "gold":
        return "#84e8d1"; // Vert
      case "silver":
        return "#cce5ff"; // Bleu clair
      default:
        return "#ffffff";
    }
  };

  const openAddPackForm = () => {
    setIsAddPackOpen(true); // Ouvre le formulaire d'ajout de pack
  };

  const closeAddPackForm = () => {
    setIsAddPackOpen(false); // Ferme le formulaire d'ajout de pack
  };

  const openUpdatePackForm = (pack) => {
    setSelectedPack(pack); // Définir le pack à modifier
    setIsUpdatePackOpen(true); // Ouvre le formulaire de mise à jour
  };

  const closeUpdatePackForm = () => {
    setSelectedPack(null); // Réinitialiser le pack sélectionné
    setIsUpdatePackOpen(false); // Ferme le formulaire de mise à jour
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * discount) / 100;
  };

  const handleDeletePack = (id) => {
    axios
      .delete(`http://localhost:3000/packs/deletePack/${id}`)
      .then((response) => {
        setPacks(packs.filter((pack) => pack.id !== id));
        console.log("Pack supprimé avec succès");
      })
      .catch((error) => console.error("Erreur lors de la suppression du pack:", error));
  };

  return (
    <div className="packs-container">
      <h2 className="section-title">Liste des Packs</h2>

      {/* Bouton pour ouvrir le formulaire d'ajout */}
      <button className="add-pack-button" onClick={openAddPackForm}>
        Ajouter un nouveau pack
      </button>

      {/* Affiche le formulaire AddPacks dans un modal */}
      <Modal
        isOpen={isAddPackOpen}
        onRequestClose={closeAddPackForm}
        contentLabel="Ajouter un nouveau pack"
        className="add-pack-modal"
        overlayClassName="modal-overlay"
      >
        <AddPacks onClose={closeAddPackForm} />
      </Modal>

      <div className="packs-grid">
        {packs.map((pack) => {
          const discountedPrice = calculateDiscountedPrice(pack.price, pack.discount);

          return (
            <div key={pack.id} className="pack-card" style={{ backgroundColor: getBackgroundColor(pack.category) }}>
              <div className="discount-badge">-{pack.discount}%</div>
              <div className="pack-icon">
                <h3 className="pack-title">{pack.category}</h3>
                <img src={`/assets/icons/${pack.icon}`} alt="Pack Icon" />
              </div>
              <h3 className="pack-title">{pack.title}</h3>

              <p className="pack-content">
                <strong>Contenu :</strong> {pack.description}
              </p>

              <div className="pack-price">
                <p>
                  <strong>Prix initial :</strong> {pack.price}DT
                </p>
                <p>
                  <strong>Prix après réduction :</strong> {discountedPrice.toFixed(2)}DT
                </p>
              </div>

              <div className="pack-actions">
                {/* Icône pour modifier */}
                <FaEdit className="action-icon" onClick={() => openUpdatePackForm(pack)} />

                {/* Icône pour supprimer */}
                <FaTrash className="action-icon" onClick={() => handleDeletePack(pack.id)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulaire de mise à jour dans un modal */}
      <Modal
        isOpen={isUpdatePackOpen}
        onRequestClose={closeUpdatePackForm}
        contentLabel="Mise à jour du pack"
        className="update-pack-modal"
        overlayClassName="modal-overlay"
      >
        <UpdatePackForm
          pack={selectedPack}
          onClose={closeUpdatePackForm}
          onUpdatePack={setPacks}
        />
      </Modal>
    </div>
  );
};

export default PackAdmin;
