import React, { useState } from 'react';

const AddCourses = ({ onClose, onAddCourse }) => {
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    instructor: '',
    skillsTaught: '',
    duration: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Assure-toi que la durée est un nombre (si ce n'est pas déjà un nombre)
    const courseData = {
      ...course,
      duration: Number(course.duration),  // Assurez-vous que la durée est un nombre
    };

    try {
      const token = localStorage.getItem('token');  // Récupère le token depuis localStorage
      const response = await fetch("http://localhost:3000/courses/addcourses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",  // Ajoute le token si disponible
        },
        body: JSON.stringify(courseData),  // Envoi des données du cours
      });

      const data = await response.json();

      if (response.ok) {
        // Si la création est réussie, appeler onAddCourse pour actualiser l'état
        onAddCourse(courseData);
        alert(data.message); // Affiche un message de succès
      } else {
        alert(data.message); // Affiche un message d'erreur
      }

      onClose(); // Ferme le modal après la soumission
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Erreur lors de la création du cours");
    }
  };

  return (
    <div className="add-course-modal">
      <div className="modal-content">
        <h2>Ajouter un cours</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre du cours</label>
            <input
              type="text"
              id="title"
              name="title"
              value={course.title}
              onChange={handleChange}
              placeholder="Titre du cours"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={course.description}
              onChange={handleChange}
              placeholder="Description du cours"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Catégorie</label>
            <input
              type="text"
              id="category"
              name="category"
              value={course.category}
              onChange={handleChange}
              placeholder="Catégorie du cours"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="instructor">Instructeur</label>
            <input
              type="text"
              id="instructor"
              name="instructor"
              value={course.instructor}
              onChange={handleChange}
              placeholder="Nom de l'instructeur"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="skillsTaught">Compétences enseignées</label>
            <input
              type="text"
              id="skillsTaught"
              name="skillsTaught"
              value={course.skillsTaught}
              onChange={handleChange}
              placeholder="Compétences enseignées"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Durée en minutes</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={course.duration}
              onChange={handleChange}
              placeholder="Durée du cours"
              required
            />
          </div>

          <button type="submit">Ajouter le cours</button>
          <button type="button" onClick={onClose}>Annuler</button>
        </form>
      </div>
    </div>
  );
};

export default AddCourses;