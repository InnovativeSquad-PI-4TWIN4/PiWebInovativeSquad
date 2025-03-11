import React, { useState } from 'react';
import { FaUpload, FaCheck, FaTimes } from 'react-icons/fa';
import './AddCourses.scss';

const AddCourses = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [teacher, setTeacher] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Listes de catégories et d'enseignants
  const categories = ['Programmation', 'Design', 'Marketing', 'Réseau', 'Développement Web', 'Développement Mobile', 'Mathématique'];
  const teachers = ['Alice Dupont', 'Bob Martin', 'Charlie Durand'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nouveau cours ajouté :', { title, category, teacher, file: selectedFile });
    alert(`Cours "${title}" créé avec succès!`);

    // Réinitialisation du formulaire après soumission
    setTitle('');
    setCategory('');
    setTeacher('');
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose(); // ✅ Ferme le formulaire après la soumission
  };

  return (
    <div className="add-course">
      {/* Bouton de fermeture */}
      <button className="close-button" onClick={onClose}>
        <FaTimes />
      </button>

      <h2>Ajouter un nouveau cours</h2>
      <form className="add-course-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="courseTitle">Titre du cours :</label>
          <input 
            id="courseTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entrez le titre du cours"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="courseCategory">Catégorie du cours :</label>
          <select 
            id="courseCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">-- Choisir une catégorie --</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="courseTeacher">Nom de l’enseignant :</label>
          <select 
            id="courseTeacher"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            required
          >
            <option value="">-- Choisir un enseignant --</option>
            {teachers.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Document PDF du cours :</label>
          <input 
            id="pdfUpload"
            type="file" 
            accept="application/pdf" 
            onChange={handleFileChange} 
            style={{ display: 'none' }}
          />
          <label htmlFor="pdfUpload" className="upload-label">
            <FaUpload className="icon" /> Choisir un fichier PDF
          </label>
          {selectedFile && <span className="file-name">{selectedFile.name}</span>}
          {previewUrl && (
            <div className="pdf-preview">
              <embed src={previewUrl} type="application/pdf" width="100%" height="300px" />
              <p>{selectedFile.name}</p>
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          <FaCheck className="icon" /> Créer le cours
        </button>
      </form>
    </div>
  );
};

export default AddCourses;
