import React, { useState } from "react";
import "./packs.scss";

const AddPacks = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]); // ✅ PDF state
  const [exam, setExam] = useState([]);

  const icons = [
    { name: "🔥 Flamme", value: "flame.png" },
    { name: "💎 Diamant", value: "diamond.png" },
    { name: "⭐ Étoile", value: "star.png" },
    { name: "🎁 Cadeau", value: "gift.png" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !price || !category) {
      alert("⚠️ Veuillez remplir tous les champs !");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("discount", discount || 0);
    formData.append("category", category);
    formData.append("icon", icon);
    formData.append("exam", JSON.stringify(exam));


    pdfFiles.forEach((file) => {
      formData.append("pdfs", file);
      
    });

    try {
      const response = await fetch("http://localhost:3000/packs/createPack", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Pack ajouté avec succès !");
        onClose();
      } else {
        setError(result.message || "Erreur lors de l'ajout du pack.");
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du pack :", error);
      setError("❌ Erreur lors de l'ajout du pack. Vérifiez la console !");
    }
  };
  const handleAddQuestion = () => {
    setExam([...exam, { question: "", options: ["", "", "", ""], correctAnswer: "" }]);
  };
  
  const handleQuestionChange = (index, field, value) => {
    const updatedExam = [...exam];
    if (field === "question") updatedExam[index].question = value;
    else if (field === "correctAnswer") updatedExam[index].correctAnswer = value;
    setExam(updatedExam);
  };
  
  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedExam = [...exam];
    updatedExam[qIndex].options[optIndex] = value;
    setExam(updatedExam);
  };
  
  return (
    <div className="add-pack-container">
      <button className="close-button" onClick={onClose}>✖</button>
      <h2>Ajouter un nouveau pack</h2>

      {error && <div className="error-message">{error}</div>}

      <form className="add-pack-form" onSubmit={handleSubmit} encType="multipart/form-data">
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

        <div className="form-group">
          <label>Ajouter des fichiers PDF (dans l'ordre voulu) :</label>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setPdfFiles(Array.from(e.target.files))}
          />
        </div>
        <div className="form-group">
  <label>Ajouter un Examen :</label>
  {exam.map((q, index) => (
    <div key={index} className="exam-question-block">
      <input
        type="text"
        placeholder={`Question ${index + 1}`}
        value={q.question}
        onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
        required
      />

      <div className="options-block">
        {q.options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(index, i, e.target.value)}
            required
          />
        ))}
      </div>

      <input
        type="text"
        placeholder="Réponse correcte"
        value={q.correctAnswer}
        onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
        required
      />
    </div>
  ))}
  <button type="button" onClick={handleAddQuestion} className="add-question-btn">
    ➕ Ajouter une question
  </button>
</div>

        <button type="submit" className="submit-button">
          Créer le pack
        </button>
      </form>
    </div>
  );
};

export default AddPacks;
