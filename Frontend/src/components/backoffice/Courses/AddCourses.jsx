import React, { useState, useEffect } from "react";
import "./AddCourses.scss";

const AddCourses = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [instructor, setInstructor] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [meetLink, setMeetLink] = useState("");

  // 📌 Charger les administrateurs depuis l'API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Aucun token trouvé !");
      return;
    }

    fetch("http://localhost:3000/users/getAllAdmins", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAdmins(data);
        } else {
          console.error("❌ Erreur: Données inattendues", data);
        }
      })
      .catch((err) => console.error("❌ Erreur lors du chargement des admins :", err));
  }, []);

  // 📌 Gestion de l'upload du fichier PDF
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("⚠️ Seuls les fichiers PDF sont autorisés !");
      setPdfFile(null);
    }
  };

  // 📌 Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !category || !instructor || !pdfFile) {
      alert("⚠️ Veuillez remplir tous les champs requis !");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("instructor", instructor);
    formData.append("file", pdfFile);
    formData.append("isPremium", isPremium);
    formData.append("meetLink", meetLink);

    try {
      const response = await fetch("http://localhost:3000/courses/addcourses", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Cours ajouté avec succès !");
        onClose(); // Fermer le formulaire après l'ajout
      } else {
        alert("❌ Erreur lors de l'ajout du cours : " + result.message);
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du cours :", error);
      alert("❌ Erreur lors de l'ajout du cours. Vérifiez la console !");
    }
  };

  return (
    <div className="add-course-container">
      <button className="close-button" onClick={onClose}>✖</button>
      <h2>Ajouter un nouveau cours</h2>
      <form className="add-course-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Titre du cours :</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Catégorie :</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">-- Choisir une catégorie --</option>
            <option value="Programmation">Programmation</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Réseau">Réseau</option>
            <option value="Développement Web">Développement Web</option>
            <option value="Développement Mobile">Développement Mobile</option>
            <option value="Mathématique">Mathématique</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nom de l’enseignant :</label>
          <select value={instructor} onChange={(e) => setInstructor(e.target.value)} required>
            <option value="">-- Choisir un enseignant --</option>
            {admins.map((admin) => (
              <option key={admin._id} value={admin._id}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group file-upload">
          <label>Document PDF :</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} required />
        </div>

        {/* 🔥 Option Premium */}
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />
            Ce cours est un cours premium
          </label>
        </div>

        {isPremium && (
          <div className="form-group">
            <label>Lien Google Meet (ou autre) :</label>
            <input
              type="url"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              required={isPremium}
            />
          </div>
        )}

        <button type="submit" className="submit-button">Créer le cours</button>
      </form>
    </div>
  );
};

export default AddCourses;
