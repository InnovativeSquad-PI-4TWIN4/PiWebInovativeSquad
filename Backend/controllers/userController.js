const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("node:crypto");  // ✅ Utilisation du module natif
const multer = require("multer");
const path = require('path');

require("dotenv").config();

const JWT_SECRET = process.env.SESSION_SECRET || "default_secret_key";
const RESET_PASSWORD_TOKEN_SECRET = process.env.RESET_PASSWORD_TOKEN_SECRET || "default_reset_secret";

// Configuration de multer pour l'upload de l'image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/"); // Dossier où l'image sera stockée
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Générer un nom de fichier unique
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de taille à 10 Mo
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;  // Types de fichiers autorisés
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images only!"); // Message d'erreur si le fichier n'est pas une image
    }
  }
});

// ✅ INSCRIPTION D'UN UTILISATEUR
exports.signup = [
  upload.single("image"), // Middleware multer pour gérer l'upload de l'image
  async (req, res) => {
    try {
      let { name, surname, email, password, dateOfBirth, Skill } = req.body;

      if (!name || !surname || !email || !password || !dateOfBirth || !Skill) {
        return res.status(400).json({ status: "FAILED", message: "All fields are required!" });
      }

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

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ status: "FAILED", message: "Email is already in use." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Si l'image est téléchargée, on récupère le chemin relatif
      const image = req.file ? `/public/images/${req.file.filename}` : null;
      //const image = req.file ? `images/${req.file.filename}` : null;

      const newUser = new User({
        name,
        surname,
        email,
        password: hashedPassword,
        dateOfBirth: date,
        Skill,
        role: "client",
        isActive: true,
        image,  // Ajout du chemin de l'image
      });

      await newUser.save();
      const token = jwt.sign({ userId: newUser._id }, 'secret_key', { expiresIn: '1h' });

      return res.status(201).json({
        status: "SUCCESS",
        message: "Sign-up successful!",
        token,
      });
      
    } catch (err) {
      console.error("Sign-up error:", err);
      return res.status(500).json({ status: "FAILED", message: "Internal server error." });
    }
  }]

// ✅ CONNEXION D'UN UTILISATEUR
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
        isActive: user.isActive,
      }
    });
  } catch (err) {
    console.error("Sign-in error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};

// ✅ MISE À JOUR DU PROFIL D'UN UTILISATEUR
exports.updateProfile = async (req, res) => {
  try {
      const userId = req.params.id;
      console.log("Update profile request for user ID:", userId);

      const { name, surname, email, password, dateOfBirth, Skill } = req.body;
      console.log("Request body:", req.body);

      const user = await User.findById(userId);
      if (!user) {
          console.log("User not found");
          return res.status(404).json({ status: "FAILED", message: "User not found." });
      }

      // Mise à jour des champs
      if (name) user.name = name;
      if (surname) user.surname = surname;
      if (email) user.email = email;
      if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
      if (Skill) user.Skill = Skill;

      if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
      }

      await user.save();
      console.log("Profile updated successfully");

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

// ✅ SUPPRESSION DU PROFIL D'UN UTILISATEUR
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "FAILED", message: "User not found." });
    }

    await User.findByIdAndDelete(userId);
    return res.status(200).json({ status: "SUCCESS", message: "Profile deleted successfully." });
  } catch (err) {
    console.error("Delete profile error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};

// ✅ ACTIVER LE COMPTE D'UN UTILISATEUR
exports.activateAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "FAILED", message: "User not found." });
    }

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

// ✅ DÉSACTIVER LE COMPTE D'UN UTILISATEUR
exports.deactivateAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "FAILED", message: "User not found." });
    }

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

// ✅ ENVOI DE L'EMAIL DE RÉINITIALISATION
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "FAILED", message: "User not found." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail", // Utilisez le service Gmail
      auth: {
          user: process.env.AUTH_EMAIL, // Utilisez la variable ENV
          pass: process.env.AUTH_PASS   // Utilisez la variable ENV
      }
  });

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">Réinitialiser mon mot de passe</a>
        <p>Ce lien est valide pendant 1 heure.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ status: "SUCCESS", message: "Email de réinitialisation envoyé." });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};

// ✅ RÉINITIALISATION DU MOT DE PASSE
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ status: "FAILED", message: "Token invalide ou expiré." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();
    res.status(200).json({ status: "SUCCESS", message: "Mot de passe réinitialisé avec succès." });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};

// ✅ CONSULTER LE PROFIL D'UN UTILISATEUR
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // ID extrait du token JWT
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ status: "FAILED", message: "User not found" });
    }

    return res.status(200).json({
      status: "SUCCESS",
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        Skill: user.Skill,
        role: user.role,
        image: user.image,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
      // Récupérer tous les utilisateurs sauf ceux ayant le rôle 'admin'
      const users = await User.find({ role: { $ne: 'admin' } });

      if (!users) {
          return res.status(404).json({ message: 'Aucun utilisateur trouvé' });
      }

      // Retourner les utilisateurs trouvés
      return res.status(200).json(users);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur du serveur' });
  }
};