import React, { useEffect, useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import AddCourses from "./AddCourses";
import './CoursesAdmin.scss';

const CoursesAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [admins, setAdmins] = useState([]); // ✅ Liste des admins pour enseignants
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');
  const [showForm, setShowForm] = useState(false);

  // ✅ Récupérer les cours depuis le backend
  useEffect(() => {
    fetch("http://localhost:3000/courses/getallcourses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Erreur lors du chargement des cours :", err));
  }, [courses]); // 👈 Met à jour automatiquement


  // ✅ Récupérer la liste des administrateurs (enseignants) depuis le backend
  useEffect(() => {
    fetch("http://localhost:3000/users/getAllAdmins")
      .then(response => response.json())
      .then(data => setAdmins(data))
      .catch(error => console.error("Erreur lors du chargement des admins :", error));
  }, []);

  // ✅ Catégories disponibles
  const categories = ['Programmation', 'Design', 'Marketing', 'Réseau', 'Développement Web', 'Développement Mobile', 'Mathématique'];

  // ✅ Filtrage et tri des cours
  const filteredAndSortedCourses = courses
    .filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) &&
      (categoryFilter === '' || course.category === categoryFilter)
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'dateAsc': return new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now());
        case 'dateDesc': return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
        case 'popularity': return (b.popularity || 0) - (a.popularity || 0);
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  return (
    <div className="courses-admin">
      <div className="controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher par titre..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <select className="category-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Toutes catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select className="sort-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="dateDesc">Trier par : Plus récent</option>
          <option value="dateAsc">Trier par : Plus ancien</option>
          <option value="popularity">Trier par : Popularité</option>
          <option value="title">Trier par : Titre</option>
        </select>

        <button className="add-course-button" onClick={() => setShowForm(true)}>
          <FaPlus /> Ajouter un cours
        </button>
      </div>

      <div className="courses-grid">
        {filteredAndSortedCourses.length === 0 ? (
          <p>Aucun cours disponible.</p>
        ) : (
          filteredAndSortedCourses.map((course, index) => (
            <div key={course._id} className="course-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <span className="category">{course.category}</span>
              <h3 className="title">{course.title}</h3>
              <p className="teacher">Ajouté par : <strong>{course.instructor?.name || "Inconnu"}</strong></p>
            </div>
          ))
        )}
      </div>

      {showForm && <AddCourses onClose={() => setShowForm(false)} admins={admins} />}
    </div>
  );
};

export default CoursesAdmin;
