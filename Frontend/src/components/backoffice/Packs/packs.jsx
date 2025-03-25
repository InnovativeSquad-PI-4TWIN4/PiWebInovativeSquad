import React, { useState } from "react";
import "./Packs.scss";

const AddPacks = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState(null);

  const icons = [
    { name: "🔥 Flamme", value: "flame.png" },
    { name: "💎 Diamant", value: "diamond.png" },
    { name: "⭐ Étoile", value: "star.png" },
    { name: "🎁 Cadeau", value: "gift.png" }
  ];
  
  // 📌 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !price || !category) {
      alert("⚠️ Veuillez remplir tous les champs !");
      return;
    }

    const packData = {
      title,
      description,
      price,
      discount: discount || 0, // Default discount to 0 if not provided
      category,
      icon,
    };

    try {
      const response = await fetch("http://localhost:3000/packs/createPack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Pack ajouté avec succès !");
        onClose(); // Close the modal after the pack is added
      } else {
        setError(result.message || "Erreur lors de l'ajout du pack.");
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du pack :", error);
      setError("❌ Erreur lors de l'ajout du pack. Vérifiez la console !");
    }
  };

  return (
    <div className="add-pack-container">
      <button className="close-button" onClick={onClose}>✖</button>
      <h2>Ajouter un nouveau pack</h2>

      {error && <div className="error-message">{error}</div>}

      <form className="add-pack-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Titre du pack :</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description :</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Prix :</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Réduction (%) :</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            min="0"
            max="100"
          />
        </div>

        <div className="form-group">
          <label>Catégorie :</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">-- Choisir une catégorie --</option>
            <option value="premium">Premium</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="basic">Basic</option>
          </select>
        </div>
        <div className="form-group">
<label>Icône du pack :</label>
<select value={icon} onChange={(e) => setIcon(e.target.value)} required>
  <option value="">-- Choisir une icône --</option>
  {icons.map((iconItem) => (
    <option key={iconItem.value} value={iconItem.value}>
      {iconItem.name}
    </option>
  ))}
</select>
{icon && <img src={`/assets/icons/${icon}`} alt="Icône sélectionnée" className="icon-preview" />}
</div>

        <button type="submit" className="submit-button">
          Créer le pack
        </button>
      </form>
    </div>
  );
};

export default AddPacks;
