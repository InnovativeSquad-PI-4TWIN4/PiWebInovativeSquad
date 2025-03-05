// AddCourses.jsx
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddCourse(course);
    onClose(); // Close modal after submission
  };

  return (
    <div className="add-course-modal">
      <div className="modal-content">
        <h2>Ajouter un cours</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={course.title}
            onChange={handleChange}
            placeholder="Titre du cours"
            required
          />
          <textarea
            name="description"
            value={course.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
          <input
            type="text"
            name="category"
            value={course.category}
            onChange={handleChange}
            placeholder="Catégorie"
            required
          />
          <input
            type="text"
            name="instructor"
            value={course.instructor}
            onChange={handleChange}
            placeholder="Instructeur"
            required
          />
          <input
            type="text"
            name="skillsTaught"
            value={course.skillsTaught}
            onChange={handleChange}
            placeholder="Compétences enseignées"
            required
          />
          <input
            type="number"
            name="duration"
            value={course.duration}
            onChange={handleChange}
            placeholder="Durée en minutes"
            required
          />
          <button type="submit">Ajouter le cours</button>
          <button type="button" onClick={onClose}>Annuler</button>
        </form>
      </div>
    </div>
  );
};

export default AddCourses;
