const Project = require('../models/project.model');
const mongoose = require('mongoose');

exports.createProject = async (req, res) => {
  try {
    const project = new Project({ ...req.body, createdBy: req.user.id });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProjects = async (req, res) => {
    try {
      console.log("Utilisateur connecté :", req.user);
  
      const userId = new mongoose.Types.ObjectId(req.user.userId); // ✅ corrigé ici
      const projects = await Project.find({ members: userId }).populate("members", "email");
  
      res.status(200).json(projects);
    } catch (err) {
      console.error("Erreur getAllProjects:", err.message);
      res.status(500).json({ error: err.message });
    }
  };