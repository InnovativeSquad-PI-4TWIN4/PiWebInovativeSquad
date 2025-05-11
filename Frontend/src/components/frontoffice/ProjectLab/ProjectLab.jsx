import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectModal from './ProjectModal';
import TaskModal from './TaskModal';
import './ProjectLab.scss';

const ProjectLab = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/projects', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProjects(res.data);

      if (res.data.length > 0) {
        const latest = res.data[res.data.length - 1];
        setHighlightedId(latest._id);

        // Supprimer le highlight après 3 secondes
        setTimeout(() => setHighlightedId(null), 3000);
      }
    } catch (err) {
      console.error('Erreur récupération projets', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/users/getAllUsers', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Erreur récupération utilisateurs', err);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      fetchProjects();
      fetchUsers();
    }
  }, []);
  

  return (
    <div className="project-lab">
      <h1>📁 Mes projets collaboratifs</h1>
      <ProjectModal onProjectCreated={fetchProjects} users={users} />

      <div className="project-list">
        {projects.map(project => (
          <div
            className={`project-item ${highlightedId === project._id ? "highlight" : ""}`}
            key={project._id}
          >
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <button onClick={() => {
              setSelectedProject(project);
              setShowTaskModal(true);
            }}>Voir tâches</button>
          </div>
        ))}
      </div>

      {showTaskModal && selectedProject && (
        <TaskModal
          project={selectedProject}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectLab;
