const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multerImage = require("../config/multer-picture");
const authenticateUser = require('../middleware/authMiddleware'); // Middleware d'authentification
const User = require("../models/User");

// ✅ Routes principales
router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
//router.post("/upload", multerImage.single("image"), userController.uploadImage);

// ✅ Mise à jour du profil (nécessite d'être connecté)
router.put("/updateProfile/:id", authenticateUser, userController.updateProfile);

// ✅ Suppression du profil (nécessite d'être connecté)
router.delete("/delete-profile/:id", authenticateUser, userController.deleteProfile);

// ✅ Activation et désactivation du compte (nécessite d'être connecté)
router.patch('/activate-account/:id', authenticateUser, userController.activateAccount);
router.patch('/deactivate-account/:id', authenticateUser, userController.deactivateAccount);

// ✅ Réinitialisation du mot de passe
router.post("/forgot-password", userController.forgotPassword);    // Envoi de l'email de réinitialisation
router.post("/reset-password/:token", userController.resetPassword); // Réinitialisation du mot de passe

// ✅ Récupérer le profil de l'utilisateur connecté
router.get("/profile", authenticateUser, userController.getProfile);
router.get("/getAllUsers",authenticateUser,userController.getAllUsers);
//Approuve un client 
router.post("/request-approval", authenticateUser, userController.requestApproval);
router.get("/pending", authenticateUser,userController.getPendingUsers);
router.post("/approve/:id", authenticateUser, userController.approveUser);
router.post("/reject/:id", authenticateUser, userController.rejectUser);

router.get("/stats", userController.getClientStats);
// ✅ Ajout d'un administrateur
router.post("/add-admin", authenticateUser, userController.addAdmin);

module.exports = router;
