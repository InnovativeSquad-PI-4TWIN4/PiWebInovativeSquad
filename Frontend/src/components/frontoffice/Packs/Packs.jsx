import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Packs.scss";

const Packs = () => {
  const [packs, setPacks] = useState([]);

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
        return "#f8d7da"; // Rose clair
      case "gold":
        return "#84e8d1"; // Vert
      case "silver":
        return "#cce5ff"; // Bleu clair
      default:
        return "#ffffff";
    }
  };

  // Calcul du prix après réduction
  const getDiscountedPrice = (price, discount) => {
    return price - (price * discount / 100);
  };

  return (
    <div className="packs-container">
      <h2 className="section-title">Explorez Nos Offres </h2>
      <div className="packs-grid">
        {packs.map((pack) => {
          const discountedPrice = getDiscountedPrice(pack.price, pack.discount);
          return (
            <div
              key={pack.id}
              className="pack-card"
              style={{ backgroundColor: getBackgroundColor(pack.category) }}
            >
              <div className="discount-badge">-{pack.discount}%</div>
              <div className="pack-icon">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Packs;
