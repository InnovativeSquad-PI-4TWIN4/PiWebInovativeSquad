import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Courses.scss';

const Courses = () => {
  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.4, duration: 1 } },
  };

  const courses = [
    { title: 'Web Development', description: 'Learn to build modern web applications.' },
    { title: 'Data Science', description: 'Master data analysis and machine learning.' },
    { title: 'UI/UX Design', description: 'Design stunning user interfaces.' },
  ];

  return (
    <section className="courses">
      <h1>Our Courses</h1>
      <div className="courses-grid">
        {courses.map((course, index) => (
          <motion.div
            key={index}
            className="course-card"
            variants={cardVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2>{course.title}</h2>
            <p>{course.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Courses;