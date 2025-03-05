import React, { useEffect, useState } from "react";
import axios from "axios";
import AddCourse from "./AddCourses"; // Import the AddCourse component
import "./CoursesAdmin.scss";

const Coursesadmin = () => {
  const [courses, setCourses] = useState([]);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null); // État pour stocker le cours sélectionné

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:3000/courses/getallcourses");
      setCourses(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des cours :", error);
    }
  };

  const handleDelete = async (courseId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/courses/deletecourses/${courseId}`);
      if (response.status === 200) {
        // Si la suppression réussie, actualise la liste des cours
        fetchCourses();
        alert("Cours supprimé avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du cours :", error);
      alert("Erreur lors de la suppression du cours");
    }
  };

  const handleAddCourse = () => {
    fetchCourses(); // Fetch courses again to refresh the list
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course); // Mettre à jour l'état avec les détails du cours
  };

  const handleCloseDetails = () => {
    setSelectedCourse(null); // Fermer les détails
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Liste des Cours</h2>

      {/* Button to open AddCourse component */}
      <button
        onClick={() => setIsAddCourseOpen(true)}
        className="bg-green-500 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Ajouter un cours
      </button>

      {/* Conditionally render AddCourse component */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <AddCourse onClose={() => setIsAddCourseOpen(false)} onAddCourse={handleAddCourse} />
        </div>
      )}

      {/* Display courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="course-card">
            <h3 className="text-lg font-bold mb-2 text-gray-800">{course.title}</h3>
            <p className="text-gray-600 mb-2">{course.description}</p>
            <p className="text-sm text-blue-500 mb-1">Catégorie : {course.category}</p>
            <p className="text-sm text-green-600 mb-2">Durée: {course.duration} min</p>
            <div className="mt-4 flex justify-between">
              <button onClick={() => handleViewDetails(course)} className="button details">Détails</button>
              <button onClick={() => alert(`Modifier le cours ID : ${course._id}`)} className="button edit">Modifier</button>
              <button 
                onClick={() => handleDelete(course._id)} 
                className="button delete"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to display course details */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Détails du Cours</h3>
            <p><strong>Titre :</strong> {selectedCourse.title}</p>
            <p><strong>Description :</strong> {selectedCourse.description}</p>
            <p><strong>Catégorie :</strong> {selectedCourse.category}</p>
            <p><strong>Instructeur :</strong> {selectedCourse.instructor}</p>
            <p><strong>Compétences enseignées :</strong> {selectedCourse.skillsTaught}</p>
            <p><strong>Durée :</strong> {selectedCourse.duration} min</p>
            <button onClick={handleCloseDetails} className="bg-red-500 text-white py-2 px-4 rounded mt-4">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coursesadmin;