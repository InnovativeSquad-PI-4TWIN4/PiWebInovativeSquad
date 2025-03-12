import React, { useState, useEffect } from "react";
import axios from "axios";

const UpdatePackForm = ({ pack, onClose, onUpdatePack }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    discount: 0,
    category: "",
    icon: "",
  });

  useEffect(() => {
    if (pack) {
      setFormData({
        title: pack.title,
        description: pack.description,
        price: pack.price,
        discount: pack.discount,
        category: pack.category,
        icon: pack.icon,
      });
    }
  }, [pack]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mettre à jour le pack
    axios
      .put(`http://localhost:3000/packs/updatePack/${pack.id}`, formData)
      .then((response) => {
        onUpdatePack((prevPacks) =>
          prevPacks.map((p) => (p.id === pack.id ? { ...p, ...formData } : p))
        );
        onClose(); // Fermer le formulaire après mise à jour
      })
      .catch((error) => console.error("Erreur lors de la mise à jour du pack:", error));
  };

  return (
    <div>
      <h2>Mise à jour du pack</h2>
      <form onSubmit={handleSubmit}>
        <label>Titre :</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
        />
        <label>Description :</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
        />
        <label>Prix :</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
        />
        <label>Réduction (%) :</label>
        <input
          type="number"
          name="discount"
          value={formData.discount}
          onChange={handleInputChange}
        />
        <label>Catégorie :</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
        />
        <label>Icône :</label>
        <input
          type="text"
          name="icon"
          value={formData.icon}
          onChange={handleInputChange}
        />
        <button type="submit">Mettre à jour</button>
      </form>
      <button onClick={onClose}>Fermer</button>
    </div>
  );
};

export default UpdatePackForm;
