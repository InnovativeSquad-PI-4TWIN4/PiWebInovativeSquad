const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/coursesController");
const upload = require("../middleware/upload"); // Middleware Multer // ✅ Ajout de l'import manquant

// Routes CRUD pour les cours
// 📌 Route pour ajouter un cours avec un fichier PDF
router.post("/addcourses", upload.single("file"), coursesController.addCourse);


router.get("/getallcourses", coursesController.getAllCourses);
router.get("/getcourses/:id", coursesController.getCourseById);
router.put("/updatecourses/:id", coursesController.updateCourse);
router.delete("/deletecourses/:id", coursesController.deleteCourse);

module.exports = router;