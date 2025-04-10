import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import "./Packs.scss";

Modal.setAppElement("#root");

const Packs = () => {
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [abonnements, setAbonnements] = useState([]);


  useEffect(() => {
    const fetchUserAbonnement = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      try {
        const response = await axios.get("http://localhost:3000/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setAbonnements(response.data.user.abonnement || []);
      } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
      }
    };
  
    fetchUserAbonnement();
    axios
      .get("http://localhost:3000/packs/getAllPacks")
      .then((response) => setPacks(response.data))
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
const isPackPurchased = (packId) => {
  return abonnements.some((id) => id === packId || id._id === packId);
};

  const handleBuyPack = async () => {
    if (!selectedPack) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Utilisateur non authentifié !");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/packs/buy-pack",
        { packId: selectedPack._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message || "Achat réussi !");
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'achat !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="packs-container">
      <h1 className="section-title">Explorez Nos Offres</h1>
      <div className="packs-grid">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className="pack-card"
            style={{ backgroundColor: getBackgroundColor(pack.category) }}
            onClick={() => openModal(pack)}
          >
            <div className="discount-badge">-{pack.discount}%</div>
            <div className="pack-icon">📚</div>
            <h3 className="pack-title">{pack.title}</h3>
            <p className="pack-content">
              <strong>Contenu :</strong> {pack.description}
            </p>
            <div className="pack-price">
              <p><strong>Prix initial :</strong> {pack.price}DT</p>
              <p className="discounted-price">
                <strong>Prix après réduction :</strong> {getDiscountedPrice(pack.price, pack.discount).toFixed(2)}DT
              </p>
   

            </div>
          </div>
        ))}
      </div>

      {/* Modal for Pack Details */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="custom-modal"
        overlayClassName="custom-overlay"
      >
        {selectedPack && (
          <>
                        <button onClick={closeModal} className="close-button">X</button>

            <h2 className="modal-title">{selectedPack.title}</h2>
            <div className="modal-content">
              <p><strong>Description :</strong> {selectedPack.description}</p>
              <p><strong>Catégorie :</strong> {selectedPack.category}</p>
              <p><strong>Prix initial :</strong> {selectedPack.price}DT</p>
              <p><strong>Réduction :</strong> {selectedPack.discount}%</p>
              <p><strong>Prix après réduction :</strong> {getDiscountedPrice(selectedPack.price, selectedPack.discount).toFixed(2)}DT</p>

              {isPackPurchased(selectedPack._id) ? (
  <button 
    className="buy-button"
    onClick={() => window.location.href = `/pack/${selectedPack._id}`}
  >
    Voir le Pack
  </button>
) : (
  <button 
    className="buy-button"
    onClick={handleBuyPack}
    disabled={loading}
  >
    {loading ? "Wait secondes please..." : "Buy Now"}
  </button>
  
)}
              

            </div>
            
          </>
        )}
      </Modal>

    </div>
  );
};

export default Packs;
