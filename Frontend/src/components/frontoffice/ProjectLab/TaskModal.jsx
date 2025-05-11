import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TaskModal.scss';

const TaskModal = ({ project, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [hoveredTaskId, setHoveredTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/tasks/project/${project._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Erreur récupération tâches", err);
    }
  };

  const handleAddTask = async () => {
    try {
      await axios.post(`http://localhost:3000/api/tasks`, {
        ...newTask,
        projectId: project._id,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNewTask({ title: '', description: '', dueDate: '' });
      fetchTasks();
    } catch (err) {
      console.error("Erreur ajout tâche", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:3000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchTasks();
    } catch (err) {
      console.error("Erreur suppression tâche", err);
    }
  };

  const handleStatusUpdate = async (taskId) => {
    try {
      await axios.put(`http://localhost:3000/api/tasks/${taskId}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      console.error("Erreur changement statut", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [project]);

  const renderColumn = (status) => (
    <div className="task-column">
      <h3>{status}</h3>
      {tasks.filter(t => t.status === status).map(task => (
        <div
          key={task._id}
          className="task-card"
          onMouseEnter={() => setHoveredTaskId(task._id)}
          onMouseLeave={() => setHoveredTaskId(null)}
        >
          <h4>{task.title}</h4>
          <p>{task.description}</p>
          <p>📌 Due: {new Date(task.dueDate).toLocaleDateString()}</p>

          {hoveredTaskId === task._id && (
            <div className="task-options">
              <button onClick={() => setEditingTaskId(task._id)}>🔁 Move</button>
              <button onClick={() => handleDeleteTask(task._id)}>🗑 Delete</button>
            </div>
          )}

          {editingTaskId === task._id && (
            <div className="move-box">
              <select
                value={newStatus || task.status}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="Doing">Doing</option>
                <option value="Done">Done</option>
              </select>
              <button onClick={() => handleStatusUpdate(task._id)}>✅ Confirmer</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="task-modal">
      <div className="modal-header">
        <h2>📝 Project tasks : <span>{project.title}</span></h2>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      <div className="columns">
  {["To Do", "Doing", "Done"].map(status => (
    <React.Fragment key={status}>
      {renderColumn(status)}
    </React.Fragment>
  ))}
</div>


      <div className="add-task-form">
        <h3>➕Add a task</h3>
        <input type="text" placeholder="Titre" value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
        <textarea placeholder="Description" value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
        <input type="date" value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
        <button onClick={handleAddTask}>Add</button>
      </div>
    </div>
  );
};

export default TaskModal;
