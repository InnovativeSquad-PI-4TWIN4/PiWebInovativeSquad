import React, { useEffect, useState } from "react";
import axios from "axios";
import AddCourse from "./AddCourses"; // Import the AddCourse component
import "./CoursesAdmin.scss";

const Coursesadmin = () => {
  const [courses, setCourses] = useState([]);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

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

  const handleAddCourse = () => {
    fetchCourses(); // Fetch courses again to refresh the list
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
              <button onClick={() => alert(`Détails du cours ID : ${course._id}`)} className="button details">Détails</button>
              <button onClick={() => alert(`Modifier le cours ID : ${course._id}`)} className="button edit">Modifier</button>
              <button onClick={() => alert(`Supprimer le cours ID : ${course._id}`)} className="button delete">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coursesadmin;
