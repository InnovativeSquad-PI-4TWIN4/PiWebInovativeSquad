const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  addCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  accessPremiumCourse
} = require("../controllers/coursesController");

// 📌 Route pour ajouter un cours avec un fichier PDF
router.post("/addcourses", upload.single("file"), addCourse);

router.get("/getallcourses", getAllCourses);
router.get("/getcourses/:id", getCourseById);
router.put("/updatecourses/:id", updateCourse);
router.delete("/deletecourses/:id", deleteCourse);

// 🔐 Route pour accès aux cours premium
router.post("/access/:id", accessPremiumCourse);

module.exports = router;
