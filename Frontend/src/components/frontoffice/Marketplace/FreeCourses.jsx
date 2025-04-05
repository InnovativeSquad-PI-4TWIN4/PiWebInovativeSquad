import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './FreeCourses.scss';

const FreeCourses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/courses/getallcourses')
      .then(res => {
        const free = res.data.filter(course => !course.isPremium);
        setCourses(free);
      })
      .catch(err => console.error("Erreur chargement des cours gratuits :", err));
  }, []);

  const handleDownload = async (pdfUrl, title) => {
    const fileUrl = `http://localhost:3000${pdfUrl}`;
    window.open(fileUrl, '_blank');

    try {
      const response = await axios.get(fileUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur téléchargement PDF :", err);
    }
  };

  return (
    <section className="courses">
      <button className="back-btn" onClick={() => navigate('/marketplace')}>⬅</button>
      <h2>📘 Free Courses</h2>
      <div className="courses-grid">
        {courses.map(course => (
          <motion.div key={course._id} className="course-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2>{course.title}</h2>
            <p>{course.category}</p>
            <p><strong>Instructeur :</strong> {course.instructor?.name || "Inconnu"}</p>
            {course.pdfUrl && (
              <button
                className="download-btn"
                onClick={() => handleDownload(course.pdfUrl, course.title)}
              >
                Télécharger PDF
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FreeCourses;
