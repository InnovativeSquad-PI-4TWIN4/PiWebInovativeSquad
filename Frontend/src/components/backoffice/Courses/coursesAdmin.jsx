import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import AddCourses from "./AddCourses";
import './CoursesAdmin.scss';

const CoursesAdmin = () => {
  // Données des cours (simulées pour le moment)
  const [courses] = useState([
    { id: 1, title: 'Introduction à React', category: 'Programmation', teacher: 'Alice Dupont', createdAt: '2023-08-01', popularity: 150 },
    { id: 2, title: 'Design UX/UI', category: 'Design', teacher: 'Bob Martin', createdAt: '2023-06-15', popularity: 95 },
    { id: 3, title: 'Marketing Digital', category: 'Marketing', teacher: 'Charlie Durand', createdAt: '2023-07-20', popularity: 120 },
    { id: 4, title: 'Node.js Avancé', category: 'Programmation', teacher: 'Alice Dupont', createdAt: '2023-09-10', popularity: 80 }
  ]);

  // États pour la recherche, le filtrage et le tri
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');
  const [showForm, setShowForm] = useState(false); // ✅ Ajout de l'état pour gérer le formulaire

  // Liste des catégories disponibles
  const categories = ['Programmation', 'Design', 'Marketing', 'Réseau', 'Développement Web', 'Développement Mobile', 'Mathématique'];


  // Filtrage et tri des cours
  const filteredAndSortedCourses = courses
    .filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) &&
      (categoryFilter === '' || course.category === categoryFilter)
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'dateAsc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'dateDesc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popularity':
          return b.popularity - a.popularity;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="courses-admin">
      {/* Barre de contrôles */}
      <div className="controls">
        {/* Barre de recherche */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher par titre..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        {/* Filtre par catégorie */}
        <select 
          className="category-filter" 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Sélecteur de tri */}
        <select 
          className="sort-select" 
          value={sortOption} 
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="dateDesc">Trier par : Plus récent</option>
          <option value="dateAsc">Trier par : Plus ancien</option>
          <option value="popularity">Trier par : Popularité</option>
        </select>

        {/* Bouton d'ajout de cours */}
        <button className="add-course-button" onClick={() => setShowForm(true)}>
          <FaPlus /> Ajouter un cours
        </button>
      </div>

      {/* Grille des cours */}
      <div className="courses-grid">
        {filteredAndSortedCourses.map((course, index) => (
          <div 
            key={course.id} 
            className="course-card" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="category">{course.category}</span>
            <h3 className="title">{course.title}</h3>
            <p className="teacher">Enseignant : {course.teacher}</p>
          </div>
        ))}
      </div>

      {/* Affichage du formulaire d'ajout de cours */}
      {showForm && <AddCourses onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default CoursesAdmin;
