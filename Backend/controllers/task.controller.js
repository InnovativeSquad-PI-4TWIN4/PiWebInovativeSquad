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
    const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.status(200).json(task);
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
  exports.addComment = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Tâche non trouvée." });
      }
  
      const comment = {
        userId: req.user.id, // pris depuis le token
        message: req.body.message
      };
  
      task.comments.push(comment);
      await task.save();
  
      res.status(200).json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  