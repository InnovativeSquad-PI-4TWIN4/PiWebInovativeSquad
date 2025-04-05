import React, { useState, useEffect } from "react";
import "./AddCourses.scss";

const AddCourses = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [instructor, setInstructor] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [courseType, setCourseType] = useState(""); // "premium" or "free"
  const [meetLink, setMeetLink] = useState("");
  const [price, setPrice] = useState(80);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return console.error("⚠️ Aucun token trouvé !");

    fetch("http://localhost:3000/users/getAllAdmins", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => Array.isArray(data) ? setAdmins(data) : console.error("❌ Données inattendues", data))
      .catch((err) => console.error("❌ Erreur chargement admins :", err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("⚠️ Seuls les fichiers PDF sont autorisés !");
      setPdfFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title || !category || !instructor ||
      (courseType === "free" && !pdfFile) ||
      (courseType === "premium" && (!meetLink || price === ""))) {
      alert("⚠️ Veuillez remplir tous les champs requis !");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("instructor", instructor);
    formData.append("isPremium", courseType === "premium");

    let endpoint = "http://localhost:3000";

    if (courseType === "premium") {
      endpoint += "/premium/addpremium";
      formData.append("meetLink", meetLink);
      formData.append("price", price);
    } else {
      endpoint += "/courses/addcourses";
      formData.append("file", pdfFile);
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Cour ajouté avec succès !");
        onClose();
      } else {
        alert("❌ Erreur : " + (result.message || "Erreur inconnue"));
      }
    } catch (err) {
      console.error("❌ Erreur ajout cours :", err);
      alert("❌ Erreur lors de l'ajout du cours.");
    }
  };

  return (
    <div className="add-course-container">
      <button className="close-button" onClick={onClose}>✖</button>
      <h2>Add Courses</h2>
      <form className="add-course-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type de cours :</label>
          <select value={courseType} onChange={(e) => setCourseType(e.target.value)} required>
            <option value="">-- Sélectionner un type --</option>
            <option value="free">Gratuit</option>
            <option value="premium">Premium</option>
          </select>
        </div>

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
              <option key={admin._id} value={admin._id}>{admin.name}</option>
            ))}
          </select>
        </div>

        {courseType === "free" && (
          <div className="form-group file-upload">
            <label>Document PDF :</label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} required />
          </div>
        )}

        {courseType === "premium" && (
          <>
            <div className="form-group">
              <label>Lien Google Meet :</label>
              <input type="url" placeholder="Lien Meet" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Prix du cours (DT) :</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0} required />
            </div>
          </>
        )}

        <button type="submit" className="submit-button">Créer le cours</button>
      </form>
    </div>
  );
};

export default AddCourses;
