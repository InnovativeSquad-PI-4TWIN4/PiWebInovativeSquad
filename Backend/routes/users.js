const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multerImage = require("../config/multer-picture");
const authenticateUser = require('../middleware/authMiddleware');  // Import du middleware

// Routes
router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
router.post("/upload", multerImage.single("image"), userController.uploadImage);
router.put("/updateProfile/:id", authenticateUser, userController.updateProfile);
router.delete("/deleteProfile/:id", authenticateUser, userController.deleteProfile);
router.patch('/activateAccount/:id', authenticateUser, userController.activateAccount);
router.patch('/deactivateAccount/:id', authenticateUser, userController.deactivateAccount);

module.exports = router;
