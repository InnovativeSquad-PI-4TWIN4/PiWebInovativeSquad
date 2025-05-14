import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectModal from './ProjectModal';
import TaskModal from './TaskModal';
import SprintModal from './SprintModal';
import './ProjectLab.scss';

const ProjectLab = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [generatedSprint, setGeneratedSprint] = useState(null);
  const [projectsWithSprint, setProjectsWithSprint] = useState([]);
  const [sprints, setSprints] = useState([]);

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

  const fetchSprints = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/sprint", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      // ✅ Sécurité : ne garder que les sprints avec projectId valide
      const validSprints = res.data.filter(s => s.projectId && s.projectId._id);
      const sprintProjectIds = validSprints.map(s => s.projectId._id.toString());
  
      setProjectsWithSprint(sprintProjectIds);
      setSprints(validSprints);
    } catch (err) {
      console.error("Erreur récupération des sprints", err);
    }
  };
  

  const generateSprint = async (project) => {
    const goal = prompt("🎯 Entrez l’objectif de ce sprint :");
    const deadline = prompt("📅 Entrez la deadline (ex: 2025-07-01) :");

    if (!goal || !deadline) {
      return alert("⚠️ Objectif et deadline requis !");
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/sprint/generate",
        {
          goal,
          deadline,
          projectId: project._id
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setGeneratedSprint(res.data.sprint);
      fetchSprints();
    } catch (error) {
      console.error("❌ Erreur IA :", error);
      alert("Erreur lors de la génération du sprint.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchUsers();
      fetchSprints();
    }
  }, []);

  const handleViewSprint = (projectId) => {
    const sprint = sprints.find(s => s.projectId && s.projectId._id && s.projectId._id.toString() === projectId.toString());
    if (sprint) {
      setGeneratedSprint(sprint);
    }
  };

  return (
    <div className="project-lab">
      <h1>My collaborative projects</h1>
      <ProjectModal onProjectCreated={fetchProjects} users={users} />

      <div className="project-list">
        {projects.map(project => (
          <div
            className={`project-item ${highlightedId === project._id ? "highlight" : ""}`}
            key={project._id}
          >
            <h3>
              {project.title} {projectsWithSprint.includes(project._id.toString()) && <span className="sprint-badge">✅ Sprint</span>}
            </h3>
            <p>{project.description}</p>
            <div className="project-actions">
              <button onClick={() => {
                setSelectedProject(project);
                setShowTaskModal(true);
              }}>
                View tasks
              </button>

              {projectsWithSprint.includes(project._id.toString()) ? (
                <button onClick={() => handleViewSprint(project._id)}>
                  🔍 View Sprint
                </button>
              ) : (
                <button onClick={() => generateSprint(project)}>
                  📅 Generate Sprint
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && selectedProject && (
        <TaskModal
          project={selectedProject}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {generatedSprint && (
        <SprintModal
          sprint={generatedSprint}
          onClose={() => setGeneratedSprint(null)}
        />
      )}
    </div>
  );
};

export default ProjectLab;
