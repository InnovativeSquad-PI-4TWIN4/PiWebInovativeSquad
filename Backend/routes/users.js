const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { activateUser, deactivateUser } = require("../controllers/userController");
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware");
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

// ✅ Gestion des approbations des utilisateurs
router.post("/request-approval", authenticateUser, userController.requestApproval);
router.get("/pending", authenticateUser, userController.getPendingUsers);
router.post("/approve/:id", authenticateUser, userController.approveUser);
router.post("/reject/:id", authenticateUser, userController.rejectUser);

// ✅ Récupérer tous les administrateurs
router.get("/getAllAdmins", authenticateUser, userController.getAllAdmins);
// ✅ Ajouter un administrateur (réservé aux admins)
router.post("/addAdmin", authenticateUser, isAdmin, userController.addAdmin);


router.post("/updateAdminPassword", userController.updateAdminPassword);




module.exports = router;
