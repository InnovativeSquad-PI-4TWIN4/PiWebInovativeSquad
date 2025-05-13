const Project = require('../models/project.model');
const User = require("../models/User");
const transporter = require('../config/nodemailer');
const mongoose = require('mongoose');

exports.createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;
    const createdBy = req.user.userId; // ✅ remplacer req.user.id par req.user.userId

    // 🔧 Optionnel : inclure aussi le créateur dans les membres s'il ne l'est pas déjà
    const fullMembers = members.includes(createdBy) ? members : [...members, createdBy];

    const project = new Project({
      title,
      description,
      members: fullMembers, // ✅ utiliser la liste complète ici
      createdBy
    });

    await project.save();

    const inviter = await User.findById(createdBy);
    const invitedUsers = await User.find({ _id: { $in: members } });

    console.log("📨 Utilisateurs invités :", invitedUsers.map(u => u.email));

    await Promise.all(invitedUsers.map(async (user) => {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `📬 Invitation au projet "${title}"`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2>Bonjour ${user.name || "utilisateur"},</h2>
              <p><strong>${inviter?.name || "Quelqu'un"} ${inviter?.surname || ""}</strong> vous a invité à collaborer sur le projet <strong>${title}</strong>.</p>
              <p>Description : ${description}</p>
              <p>Connectez-vous à SkillBridge pour accéder au projet.</p>
              <br/>
              <a href="http://localhost:5173/project-lab" style="background-color:#00b894;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
                Rejoindre le projet
              </a>
            </div>
          `
        });
        console.log(`✅ Email envoyé à ${user.email}`);
      } catch (emailErr) {
        console.error(`❌ Échec d'envoi de l'email à ${user.email} :`, emailErr.message);
      }
    }));

    res.status(201).json(project);
  } catch (err) {
    console.error("❌ Erreur lors de la création du projet :", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    console.log("Utilisateur connecté :", req.user);
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // ✅ Correction : récupérer les projets créés OU avec le user comme membre
    const projects = await Project.find({
      $or: [
        { members: userId },
        { createdBy: userId }
      ]
    }).populate("members", "email");

    res.status(200).json(projects);
  } catch (err) {
    console.error("❌ Erreur getAllProjects:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.addMemberToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
