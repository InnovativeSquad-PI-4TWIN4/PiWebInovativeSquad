import React, { useEffect, useState } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import AddCourses from "./AddCourses";
import { jsPDF } from 'jspdf';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import './CoursesAdmin.scss';

const CoursesAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/courses/getallcourses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Erreur lors du chargement des cours :", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/users/getAllAdmins")
      .then(response => response.json())
      .then(data => setAdmins(data))
      .catch(error => console.error("Erreur lors du chargement des admins :", error));
  }, []);

  const categories = ['Programmation', 'Design', 'Marketing', 'Réseau', 'Développement Web', 'Développement Mobile', 'Mathématique'];

  const filteredAndSortedCourses = courses
    .filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) &&
      (categoryFilter === '' || course.category === categoryFilter)
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'dateAsc': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'dateDesc': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popularity': return (b.popularity || 0) - (a.popularity || 0);
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;

    try {
      const response = await fetch(`http://localhost:3000/courses/deletecourses/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setCourses(courses.filter(course => course._id !== id));
      } else {
        alert("Erreur : " + data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleDownload = (course) => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text("Cours: " + course.title, 10, 10);
    doc.text("Catégorie: " + course.category, 10, 20);
    doc.text("Instructeur: " + (course.instructor?.name || "Inconnu"), 10, 30);
    doc.text("Date de création: " + new Date(course.createdAt).toLocaleDateString(), 10, 40);
    doc.text("Description: " + (course.description || "Aucune description disponible."), 10, 50);
    doc.save(course.title + ".pdf");
    setMessage('Téléchargement effectué avec succès !');
  };

  const handleShowPDF = (pdfUrl) => {
    const isPdf = pdfUrl && pdfUrl.endsWith('.pdf');
    if (isPdf) {
      setPdfFile(pdfUrl);
    } else {
      alert('Le fichier sélectionné n\'est pas un PDF valide.');
    }
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
                {course.pdfUrl && (
                  <div className="pdf-viewer">
                    <button onClick={() => handleShowPDF(course.pdfUrl)}>Afficher le PDF</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && <AddCourses onClose={() => setShowForm(false)} admins={admins} />}

      {/* ✅ Nouveau formulaire de modification stylisé */}
      {editingCourse && (
        <div className="overlay">
          <div className="edit-form-modal">
            <h2>Modifier le cours</h2>
            <form onSubmit={handleUpdate}>
              <label>Titre du cours</label>
              <input
                type="text"
                value={editingCourse.title}
                onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                required
              />

              <label>Catégorie</label>
              <select
                value={editingCourse.category}
                onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <label>Fichier PDF (facultatif)</label>
              <input type="file" onChange={(e) => setEditingCourse({ ...editingCourse, pdfFile: e.target.files[0] })} />

              <div className="form-actions">
                <button type="submit">✅ Sauvegarder</button>
                <button type="button" onClick={() => setEditingCourse(null)}>❌ Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && <div className="success-message">{message}</div>}

      {pdfFile && (
        <div className="pdf-container">
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
            <Viewer fileUrl={pdfFile} />
          </Worker>
        </div>
      )}
    </div>
  );
};

export default CoursesAdmin;
