const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { activateUser, deactivateUser } = require("../controllers/userController");
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware");
const User = require("../models/User");

// ✅ Routes principales
router.post("/signup", userController.signup);
router.post("/signin", userController.signin);

// ✅ Gestion des utilisateurs
router.put("/updateProfile/:id", authenticateUser, userController.updateProfile);
router.delete("/delete-profile/:id", authenticateUser, userController.deleteProfile);
// Route pour activer un utilisateur (admin uniquement)
router.patch("/activate/:id", authenticateUser, isAdmin, activateUser);

// Route pour désactiver un utilisateur (admin uniquement)
router.patch("/deactivate/:id", authenticateUser, isAdmin, deactivateUser);
router.get("/profile", authenticateUser, userController.getProfile);
router.get("/getAllUsers", authenticateUser,userController.getAllUsers);
router.get('/users/:id', authenticateUser, userController.getUserById);

// ✅ Gestion des approbations des utilisateurs
router.post("/request-approval", authenticateUser, userController.requestApproval);
router.get("/pending", authenticateUser, userController.getPendingUsers);
router.post("/approve/:id", authenticateUser, userController.approveUser);
router.post("/reject/:id", authenticateUser, userController.rejectUser);

// ✅ Récupérer tous les administrateurs
router.get("/getAllAdmins", authenticateUser, userController.getAllAdmins);
// ✅ Ajouter un administrateur (réservé aux admins)
router.post("/addAdmin", authenticateUser, isAdmin, userController.addAdmin);

router.post("/rechargeAdmin", userController.rechargeSolde);
router.post("/updateAdminPassword", userController.updateAdminPassword);

router.get('/verify-email/:token', userController.verifyEmail);
router.get("/pdf-progress/:packId", authenticateUser,userController.getPdfProgress);
router.post("/pdf-progress/:packId",authenticateUser, userController.savePdfProgress);

router.post("/save-exam-score/:packId", authenticateUser, userController.saveExamScore);
router.get("/get-exam-score/:packId", authenticateUser, userController.getExamScore);

router.post("/mark-certified", userController.markAsCertified);

router.get('/email/:email', userController.getUserByEmail);
router.get("/certificates/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.certificates || user.certificates.length === 0) {
      return res.status(200).json([]); // ✅ même si vide, la route renvoie un tableau
    }

    res.status(200).json(user.certificates); // ✅ Ceci doit être à l’intérieur du try
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération certificats", error });
  }
});

// ✅ Route de test email déplacée hors du bloc précédent
router.get("/test-email", async (req, res) => {
  const { sendEmail } = require("../controllers/userController");
  const success = await sendEmail(
    "ton.email@gmail.com",
    "Test depuis SkillBridge",
    "<p>🎉 Ceci est un test d'email envoyé depuis la nouvelle configuration !</p>"
  );
  res.send(success ? "Email envoyé ✅" : "Échec ❌");
});

  
  


module.exports = router;