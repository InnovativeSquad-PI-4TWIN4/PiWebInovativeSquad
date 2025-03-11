const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/coursesController");

// Routes CRUD pour les cours
router.post("/addcourses", coursesController.createCourse);
router.get("/getallcourses", coursesController.getAllCourses);
router.get("/getcourses/:id", coursesController.getCourseById);
router.put("/updatecourses/:id", coursesController.updateCourse);
router.delete("/deletecourses/:id", coursesController.deleteCourse);

module.exports = router;