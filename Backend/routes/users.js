const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateUser = require('../middleware/authMiddleware');

// ✅ Routes principales
router.post("/signup", userController.signup);
router.post("/signin", userController.signin);

// ✅ Gestion des utilisateurs
router.put("/updateProfile/:id", authenticateUser, userController.updateProfile);
router.delete("/delete-profile/:id", authenticateUser, userController.deleteProfile);
router.patch('/activate-account/:id', authenticateUser, userController.activateAccount);
router.patch('/deactivate-account/:id', authenticateUser, userController.deactivateAccount);
router.get("/profile", authenticateUser, userController.getProfile);
router.get("/getAllUsers", authenticateUser,userController.getAllUsers);

// ✅ Gestion des approbations des utilisateurs
router.post("/request-approval", authenticateUser, userController.requestApproval);
router.get("/pending", authenticateUser, userController.getPendingUsers);
router.post("/approve/:id", authenticateUser, userController.approveUser);
router.post("/reject/:id", authenticateUser, userController.rejectUser);

// ✅ Récupérer tous les administrateurs
router.get("/getAllAdmins", authenticateUser, userController.getAllAdmins);

// ✅ Ajout d'un administrateur (par un autre admin)
router.post("/add-admin", authenticateUser, userController.addAdminByAdmin);
module.exports = router;
