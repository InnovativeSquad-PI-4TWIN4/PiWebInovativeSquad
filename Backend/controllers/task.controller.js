// ✅ CONTROLLER: task.controller.js
const Task = require('../models/task.model');

exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
    if (!task) return res.status(404).json({ error: 'Tâche introuvable' });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) return res.status(404).json({ error: 'Tâche introuvable' });
    res.status(200).json({ message: 'Tâche supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'email');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
