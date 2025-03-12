import React, { useEffect, useState } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import AddCourses from "./AddCourses";
import { jsPDF } from 'jspdf'; // Importation de jsPDF
import './CoursesAdmin.scss';

const CoursesAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [message, setMessage] = useState('');  // Message de succès

  // ✅ Récupérer les cours
  useEffect(() => {
    fetch("http://localhost:3000/courses/getallcourses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Erreur lors du chargement des cours :", err));
  }, []);

  // ✅ Récupérer les admins (enseignants)
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

  // ✅ Fonction pour supprimer un cours
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;

    try {
      const response = await fetch(`http://localhost:3000/courses/deletecourses/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setCourses(courses.filter(course => course._id !== id)); // Mise à jour de l'état
      } else {
        alert("Erreur : " + data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  // ✅ Fonction pour afficher le formulaire de modification
  const handleEdit = (course) => {
    setEditingCourse(course);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    let body;
    let headers = {};

    if (editingCourse.pdfFile) {
        body = new FormData();
        body.append("title", editingCourse.title);
        body.append("category", editingCourse.category);
        body.append("instructor", typeof editingCourse.instructor === "object" ? editingCourse.instructor._id : editingCourse.instructor);
        body.append("file", editingCourse.pdfFile);
    } else {
        body = JSON.stringify({
            title: editingCourse.title,
            category: editingCourse.category,
            instructor: typeof editingCourse.instructor === "object" ? editingCourse.instructor._id : editingCourse.instructor,
        });
        headers["Content-Type"] = "application/json";
    }

    try {
        const response = await fetch(`http://localhost:3000/courses/updatecourses/${editingCourse._id}`, {
            method: "PUT",
            body: body,
            headers: headers,
        });

        const data = await response.json();
        console.log("Réponse du serveur :", data);

        if (response.ok) {
            alert("Cours mis à jour avec succès !");
            setEditingCourse(null);

            // 🔥 Mise à jour immédiate du state courses
            setCourses(prevCourses => 
                prevCourses.map(course => 
                    course._id === editingCourse._id 
                        ? { ...course, title: editingCourse.title, category: editingCourse.category, instructor: editingCourse.instructor }
                        : course
                )
            );

        } else {
            alert("Erreur : " + data.message);
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
    }
  };

  // ✅ Fonction de téléchargement en PDF
  const handleDownload = (course) => {
    const doc = new jsPDF();

    // Ajouter les informations du cours au PDF
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text("Cours: " + course.title, 10, 10);
    doc.text("Catégorie: " + course.category, 10, 20);
    doc.text("Instructeur: " + (course.instructor?.name || "Inconnu"), 10, 30);
    doc.text("Date de création: " + new Date(course.createdAt).toLocaleDateString(), 10, 40);
    doc.text("Description: " + (course.description || "Aucune description disponible."), 10, 50);

    // Télécharger le fichier PDF
    doc.save(course.title + ".pdf");

    setMessage('Téléchargement effectué avec succès !'); // Message de succès
  };

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
              <div className="actions">
                <button className="edit-btn" onClick={() => handleEdit(course)}><FaEdit /> Modifier</button>
                <button className="delete-btn" onClick={() => handleDelete(course._id)}><FaTrash /> Supprimer</button>
              </div>
              <div className="course-actions">
                <button onClick={() => handleDownload(course)}>Télécharger en PDF</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && <AddCourses onClose={() => setShowForm(false)} admins={admins} />}

      {/* Formulaire de modification */}
      {editingCourse && (
        <div className="edit-form">
          <h2>Modifier le cours</h2>
          <form onSubmit={handleUpdate}>
            <input type="text" value={editingCourse.title} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} />
            <select value={editingCourse.category} onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="file" onChange={(e) => setEditingCourse({ ...editingCourse, pdfFile: e.target.files[0] })} />
            <div className="form-actions">
              <button type="submit">Sauvegarder</button>
              <button type="button" onClick={() => setEditingCourse(null)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Message de succès */}
      {message && <div className="success-message">{message}</div>}
    </div>
  );
};

export default CoursesAdmin;
