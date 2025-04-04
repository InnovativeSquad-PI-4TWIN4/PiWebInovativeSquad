import React, { useEffect, useState } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFire, FaCheck, FaCheckCircle } from 'react-icons/fa';
import AddCourses from "./AddCourses";
import './CoursesAdmin.scss';

const CoursesAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

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

  const markMeetAsEnded = async (course) => {
    try {
      const response = await fetch(`http://localhost:3000/premium/mark-meet-ended/${course._id}`, {
        method: 'PUT'
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Le meet a été marqué comme terminé.");
        setCourses(prev => prev.map(c => c._id === course._id ? { ...c, isMeetEnded: true, meetLink: null } : c));
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("❌ Erreur lors de la mise à jour :", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    let endpoint = editingCourse.isPremium
      ? `http://localhost:3000/premium/replay/${editingCourse._id}`
      : `http://localhost:3000/courses/updatecourses/${editingCourse._id}`;

    let body;
    let headers = {};

    if (editingCourse.isPremium) {
      body = JSON.stringify({ videoReplayUrl: editingCourse.videoReplayUrl });
      headers["Content-Type"] = "application/json";
    } else {
      body = new FormData();
      body.append("title", editingCourse.title);
      body.append("category", editingCourse.category);
      body.append("instructor", typeof editingCourse.instructor === "object" ? editingCourse.instructor._id : editingCourse.instructor);
      if (editingCourse.pdfFile) body.append("file", editingCourse.pdfFile);
    }

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        body: body,
        headers: headers,
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Cours mis à jour avec succès !");
        setEditingCourse(null);
        setCourses(prevCourses =>
          prevCourses.map(course =>
            course._id === editingCourse._id
              ? { ...course, ...editingCourse }
              : course
          )
        );
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour :", error);
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
            <div key={course._id} className={`course-card ${course.isPremium ? 'premium-border' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
              <span className="category">{course.category}</span>
              <h3 className="title">
                {course.title}
                {course.isPremium && <FaFire className="premium-icon" />}
                {course.isPremium && course.isMeetEnded && (
                  <FaCheckCircle className="ended-icon" title="Meet terminé" />
                )}
  {course.isPremium && !course.isMeetEnded && (
  <button className="end-meet-btn" onClick={() => markMeetAsEnded(course)}>
    <FaCheck /> Fin Meet
  </button>
)}

              </h3>
              <p className="teacher">Ajouté par : <strong>{course.instructor?.name || "Inconnu"}</strong></p>
              <div className="actions">
                <button className="edit-btn" onClick={() => handleEdit(course)}><FaEdit /> Modifier</button>
                <button className="delete-btn" onClick={() => handleDelete(course._id)}><FaTrash /> Supprimer</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && <AddCourses onClose={() => setShowForm(false)} admins={admins} />}

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

              {!editingCourse.isPremium && (
                <>
                  <label>Fichier PDF (facultatif)</label>
                  <input type="file" onChange={(e) => setEditingCourse({ ...editingCourse, pdfFile: e.target.files[0] })} />
                </>
              )}

              <label>
                <input
                  type="checkbox"
                  checked={editingCourse.isPremium || false}
                  disabled
                /> Cours Premium
              </label>

              {editingCourse.isPremium && editingCourse.isMeetEnded && (
                <>
                  <label>Lien de replay (vidéo)</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={editingCourse.videoReplayUrl || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, videoReplayUrl: e.target.value })}
                  />
                </>
              )}

              <div className="form-actions">
                <button type="submit">✅ Sauvegarder</button>
                <button type="button" onClick={() => setEditingCourse(null)}>❌ Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesAdmin;
