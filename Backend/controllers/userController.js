const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("node:crypto");  // ✅ Utilisation du module natif
const multer = require("multer");
const path = require('path');
const axios = require('axios');


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

exports.requestApproval = async (req, res) => {
  try {
      const { userId } = req.body;

      if (!userId) {
          return res.status(400).json({ message: "userId est requis" });
      }

      const user = await User.findByIdAndUpdate(userId, { status: "pending" });

      if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      res.status(200).json({ message: "Demande envoyée avec succès" });
  } catch (error) {
      console.error("Erreur lors de la demande:", error);
      res.status(500).json({ message: "Erreur lors de la demande", error: error.message });
  }
};

exports.getPendingUsers =[ async (req, res) => {
  const users = await User.find({ status: "pending" });
  res.json(users);
}];

exports.approveUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: "approved", role: "client_approuve" }, // Mise à jour du statut et du rôle
      { new: true } // Retourner l'utilisateur mis à jour
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Envoyer un email de confirmation (si nécessaire)
    //await sendApprovalEmail(userId);

    res.json({ message: "Utilisateur approuvé", user: updatedUser });
  } catch (error) {
    console.error("Erreur lors de l'approbation de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

exports.rejectUser =[ async (req, res) => {
  const userId = req.params.id;
  await User.findByIdAndUpdate(userId, { status: "unapproved" });

  // Envoyer un email de refus
  //await sendRejectionEmail(userId);

  res.json({ message: "Demande refusée" });
}];



// ✅ INSCRIPTION AVEC VÉRIFICATION PAR EMAIL
exports.signup = [
  upload.single("image"),
  async (req, res) => {
    try {
      let { name, surname, email, password, dateOfBirth, Skill, recaptchaToken } = req.body;

      if (!name || !surname || !email || !password || !dateOfBirth || !Skill) {
        return res.status(400).json({ status: "FAILED", message: "Tous les champs sont requis !" });
      }

      name = name.trim();
      surname = surname.trim();
      email = email.trim();
      password = password.trim();
      dateOfBirth = dateOfBirth.trim();
      Skill = Skill.trim();

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ status: "FAILED", message: "Email déjà utilisé." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const image = req.file ? `/public/images/${req.file.filename}` : null;
      const emailToken = crypto.randomBytes(32).toString("hex");

      const newUser = new User({
        name,
        surname,
        email,
        password: hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
        Skill,
        image,
        role: "client",
        isActive: true,
        verified: false,
        emailToken,
      });

      await newUser.save();

      const confirmLink = `${process.env.CLIENT_URL}/verify-email/${emailToken}`;

      await sendEmail(
        email,
        "Vérifiez votre compte SkillBridge",
        `<h2>Bienvenue ${name},</h2>
        <p>Merci de vous être inscrit ! Cliquez sur le bouton ci-dessous pour vérifier votre compte :</p>
        <a href="${confirmLink}" style="padding: 10px 15px; background: #00b894; color: white; border-radius: 5px; text-decoration: none;">Confirmer mon compte</a>
        <p>Si vous n'avez pas demandé cela, ignorez ce message.</p>`
      );

      return res.status(201).json({
        status: "SUCCESS",
        message: "Inscription réussie. Un email de confirmation a été envoyé.",
      });
    } catch (err) {
      console.error("Signup Error:", err);
      return res.status(500).json({ status: "FAILED", message: "Erreur interne du serveur." });
    }
  },
];


// ✅ VÉRIFICATION EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ emailToken: token });

    if (!user) return res.status(400).send("Lien invalide ou expiré.");

    user.emailToken = null;
    user.verified = true;
    await user.save();

    return res.redirect(`${process.env.CLIENT_URL}/signin`);
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).send("Erreur lors de la vérification.");
  }
};

exports.addClient = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, skill } = req.body;

    // Vérification des champs
    if (!firstName || !lastName || !email || !password || !dateOfBirth || !skill) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dateOfBirth: new Date(dateOfBirth),
      skill,
      role: "client",
      isActive: true,
    });

    await newClient.save();
    
    // ✅ Assurer une réponse JSON valide
    return res.status(201).json({
      message: "Client added successfully!",
      client: newClient,
    });

  } catch (error) {
    console.error("Error in addClient:", error);

    // ✅ Toujours envoyer du JSON
    return res.status(500).json({
      message: "Internal server error!",
      error: error.message,
    });
  }
};


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

    if (!user.isActive) {
      return res.status(403).json({ status: "FAILED", message: "Your account has been deactivated. Please contact support." });
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

      if (!userId) {
          return res.status(400).json({ status: "FAILED", message: "ID utilisateur manquant." });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ status: "FAILED", message: "Utilisateur introuvable." });
      }

      await User.findByIdAndDelete(userId);
      return res.status(200).json({ status: "SUCCESS", message: "Compte supprimé avec succès." });
  } catch (err) {
      console.error("Delete profile error:", err);
      return res.status(500).json({ status: "FAILED", message: "Erreur interne du serveur." });
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
      const userId = req.user.userId;
      const user = await User.findById(userId).select("-password").populate("abonnement", "title");
      if (!user) {
          return res.status(404).json({ status: "FAILED", message: "User not found" });
      }

      // 🔥 Ajout du calcul du wallet
      const wallet = Math.floor(user.solde * 1.3) + " pts";

      return res.status(200).json({
          status: "SUCCESS",
          user: {
              _id: user._id.toString(),  // ✅ Assurez-vous que l'ID est une chaîne de caractères
              name: user.name,
              surname: user.surname,
              email: user.email,
              dateOfBirth: user.dateOfBirth,
              Skill: user.Skill,
              role: user.role,
              image: user.image,
              isActive: user.isActive,
              abonnement: user.abonnement, 
              wallet  // ✅ Ajout du wallet dans la réponse
          }
      });
  } catch (err) {
      console.error("Get profile error:", err);
      return res.status(500).json({ status: "FAILED", message: "Internal server error." });
  }
};


exports.rechargeSolde = async (req, res) => {
  try {
      console.log("RechargeSolde appelée"); // Ajoute cette ligne pour voir si elle s'exécute

      const { userId, amount } = req.body;
      if (!userId || !amount) {
          return res.status(400).json({ message: "Tous les champs sont requis" });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      user.solde += amount;
      await user.save();

      res.status(200).json({ message: "Recharge effectuée", newSolde: user.solde });
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

// Route pour récupérer les statistiques des utilisateurs
exports.getClientStats = async (req, res) => {
  try {
    const totalClients = await User.countDocuments(); // Nombre total de clients
    const approvedClients = await User.countDocuments({ status: "approved" }); // Nombre de clients approuvés

    res.json({ totalClients, approvedClients });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques des clients :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
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

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-password'); // exclure le mot de passe

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Fonction pour récupérer uniquement les administrateurs
exports.getAllAdmins = async (req, res) => {
  try {
      const admins = await User.find({ role: "admin" });

      console.log("🔍 Admins récupérés :", admins); // DEBUG

      if (!admins.length) {
          return res.status(404).json({ message: "Aucun administrateur trouvé" });
      }

      return res.status(200).json(admins);
  } catch (error) {
      console.error("❌ Erreur lors de la récupération des admins :", error);
      return res.status(500).json({ message: "Erreur du serveur" });
  }
};

// Activer un utilisateur
exports.activateUser = async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      user.isActive = true; // Supposons que le champ s'appelle "active"
      await user.save();

      res.status(200).json({ message: "Utilisateur activé avec succès." });
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Désactiver un utilisateur
exports.deactivateUser = async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      user.isActive = false;
      await user.save();

      res.status(200).json({ message: "Utilisateur désactivé avec succès." });
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
// ✅ Fonction pour envoyer un email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.AUTH_EMAIL, // ⚡ Utilisation des bonnes variables d'env
        pass: process.env.AUTH_PASS,  // ⚡ Mot de passe d'application Gmail
      },
    });

    const mailOptions = {
      from: `"SkillBridge" <${process.env.AUTH_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email envoyé à ${to}: ${info.response}`);
    return true;
  } catch (error) {
    console.error("❌ Erreur d'envoi d'email", error);
    return false;
  }
};

exports.addAdmin = async (req, res) => {
  try {
    const { firstname, lastname, email, dateOfBirth } = req.body;

    let existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Cet administrateur existe déjà" });
    }

    // ✅ Créer un nouvel administrateur
    const newAdmin = new User({
      name: firstname,
      surname: lastname,
      email,
      dateOfBirth,
      role: "admin",
      isActive: true,
      status: "unapproved",
    });

    await newAdmin.save();

    // ✅ Lien de redirection pour définir le mot de passe
    const resetLink = `${process.env.CLIENT_URL}/update-admin-password?email=${encodeURIComponent(email)}`;



    // ✅ Construire le contenu de l'email
    const emailContent = `
      <p>Hello ${firstname},</p>
      <p>You have been added as an admin on SkillBridge.</p>
      <p><strong>Your login details:</strong></p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p>Click the button below to set your password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Login to Admin Panel</a>
      <p>Please change your password after your first login.</p>
      <p>Best regards.</p>
    `;

    // ✅ Envoyer l'email
    const emailSent = await sendEmail(email, "Welcome as Admin", emailContent);

    if (!emailSent) {
      return res.status(500).json({ message: "Administrateur ajouté, mais échec de l'envoi de l'email" });
    }

    res.status(201).json({ message: "Administrateur ajouté et email envoyé" });

  } catch (error) {
    console.error("❌ Error adding admin:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


exports.updateAdminPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body; // ✅ Supprimer confirmPassword

    console.log("📥 Requête reçue :", req.body); // ✅ Vérifier les données reçues

    // Vérification des champs
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifier si l'admin existe
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    // Hachage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    console.log("✅ Mot de passe mis à jour !");
    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });

  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.savePdfProgress = async (req, res) => {
  const userId = req.user.userId;
  const { pdfId } = req.body;
  const { packId } = req.params;

  try {
    const user = await User.findById(userId);

    const alreadyExists = user.pdfProgress.some(
      (item) => item.pdfId === pdfId && item.packId.toString() === packId
    );

    if (!alreadyExists) {
      user.pdfProgress.push({ packId, pdfId });
      await user.save();
    }

    res.status(200).json({ message: "Progress saved." });
  } catch (err) {
    console.error("Error saving progress", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.getPdfProgress = async (req, res) => {
  const userId = req.user.userId;
  const { packId } = req.params;

  try {
    const user = await User.findById(userId);
    const progress = user.pdfProgress
      .filter((p) => p.packId.toString() === packId)
      .map((p) => p.pdfId);

    res.json({ completedPdfs: progress });
  } catch (err) {
    console.error("Error fetching progress", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};