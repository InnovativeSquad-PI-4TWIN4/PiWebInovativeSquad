const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateUser = require("../middleware/authMiddleware");
require("dotenv").config();

const JWT_SECRET = process.env.SESSION_SECRET || "default_secret_key";

exports.signup = async (req, res) => {
  try {
    let { name, surname, email, password, dateOfBirth, Skill } = req.body;

    if (!name || !surname || !email || !password || !dateOfBirth || !Skill) {
      return res.status(400).json({ status: "FAILED", message: "All fields are required!" });
    }

    // Nettoyage et validation
    name = name.trim();
    surname = surname.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();
    Skill = Skill.trim();

    if (!/^[a-zA-Z ]+$/.test(name)) {
      return res.status(400).json({ status: "FAILED", message: "Invalid name format." });
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.status(400).json({ status: "FAILED", message: "Invalid email format." });
    }

    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ status: "FAILED", message: "Invalid date format (YYYY-MM-DD)." });
    }

    if (password.length < 8) {
      return res.status(400).json({ status: "FAILED", message: "Password must be at least 8 characters long." });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: "FAILED", message: "Email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      surname,
      email,
      password: hashedPassword,
      dateOfBirth: date,
      Skill,
      role: "client", // Assignation par défaut
      isActive: true, // L'utilisateur est activé par défaut
    });

    await newUser.save();

    return res.status(201).json({
      status: "SUCCESS",
      message: "Sign-up successful!",
    });
  } catch (err) {
    console.error("Sign-up error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};
// ✅ Connexion d'un utilisateur
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "FAILED", message: "Email and password are required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: "FAILED", message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ status: "FAILED", message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      status: "SUCCESS",
      message: "Sign-in successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        Skill: user.Skill,
        role: user.role,
        isActive: user.isActive,  // Renvoi de l'état du compte
      }
    });
  } catch (err) {
    console.error("Sign-in error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};

// ✅ Upload d'image
exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "FAILED", message: "No file uploaded." });
    }

    return res.status(200).json({
      status: "SUCCESS",
      message: "File uploaded successfully.",
      filePath: `/images/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};

// ✅ Mise à jour du profil d'un utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, surname, email, password, dateOfBirth, Skill } = req.body;

    // Vérifie que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "FAILED", message: "User not found." });
    }

    // Mise à jour des champs seulement si ceux-ci sont fournis
    if (name) user.name = name;
    if (surname) user.surname = surname;
    if (email) user.email = email;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (Skill) user.Skill = Skill;

    // Si un nouveau mot de passe est fourni, il est haché avant d'être sauvegardé
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Sauvegarde des modifications
    await user.save();

    return res.status(200).json({
      status: "SUCCESS",
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        Skill: user.Skill,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};


// ✅ Suppression du profil d'un utilisateur
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifie que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "FAILED", message: "User not found." });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ status: "SUCCESS", message: "Profile deleted successfully." });
  } catch (err) {
    console.error("Delete profile error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "FAILED", message: "User not found." });
    }

    // Activation du compte
    user.isActive = true;
    await user.save();

    return res.status(200).json({
      status: "SUCCESS",
      message: "Account activated successfully.",
    });
  } catch (err) {
    console.error("Activate account error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};

// Désactiver un compte utilisateur
exports.deactivateAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "FAILED", message: "User not found." });
    }

    // Désactivation du compte
    user.isActive = false;
    await user.save();

    return res.status(200).json({
      status: "SUCCESS",
      message: "Account deactivated successfully.",
    });
  } catch (err) {
    console.error("Deactivate account error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};