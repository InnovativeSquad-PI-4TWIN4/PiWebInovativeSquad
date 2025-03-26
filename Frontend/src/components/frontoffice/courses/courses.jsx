import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './Courses.scss';

const Courses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/courses/getallcourses')
      .then(response => {
        setCourses(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des cours :", error);
      });
  }, []);

  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.4, duration: 1 } },
  };

  const normalCourses = courses.filter(c => !c.isPremium);
  const premiumCourses = courses.filter(c => c.isPremium);

  return (
    <section className="courses">
      <h1>Our Courses</h1>

      {/* 📚 Cours normaux */}
      <div className="courses-grid">
        {normalCourses.map((course) => (
          <motion.div
            key={course._id}
            className="course-card"
            variants={cardVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2>{course.title}</h2>
            <p>{course.category}</p>
            <p><strong>Instructeur :</strong> {course.instructor?.name || "Inconnu"}</p>

            {course.pdfUrl && (
              <a 
                href={`http://localhost:3000${course.pdfUrl}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="download-btn"
              >
                Upload PDF
              </a>
            )}
          </motion.div>
        ))}
      </div>

      {/* 🔥 Cours Premiums */}
      {premiumCourses.length > 0 && (
        <>
          <h2 className="premium-title">🔥 Premium Courses</h2>
          <div className="courses-grid">
            {premiumCourses.map((course) => (
              <motion.div
                key={course._id}
                className="course-card premium"
                variants={cardVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.5 }}
              >
                <h2>{course.title}</h2>
                <p>{course.category}</p>
                <p><strong>Instructeur :</strong> {course.instructor?.name || "Inconnu"}</p>

                {course.meetLink && (
                  <a
                    href={course.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meet-btn"
                  >
                    Rejoindre le cours en direct
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Courses;
