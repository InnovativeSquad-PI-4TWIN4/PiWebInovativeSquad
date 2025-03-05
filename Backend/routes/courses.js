const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/coursesController");
const authenticateUser = require('../middleware/authMiddleware'); // Middleware d'authentification

// Routes CRUD
router.post("/addcourses", coursesController.createCourse);  // Créer un cours
router.get("/getallcourses", coursesController.getAllCourses);  // Obtenir tous les cours
router.get("/getcourses/:id",coursesController.getCourseById);  // Obtenir un cours par ID
router.put("/updatecourses/:id", coursesController.updateCourse);  // Mettre à jour un cours
router.delete("/deletecourses/:id",coursesController.deleteCourse);  // Supprimer un cours

module.exports = router;