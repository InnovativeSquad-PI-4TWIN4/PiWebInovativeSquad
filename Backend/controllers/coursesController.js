const Course = require("../models/Courses");

// ✅ Ajouter un nouveau cours
exports.createCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json({ message: "Course created successfully", course });
    } catch (error) {
        res.status(500).json({ message: "Error creating course", error });
    }
};

// ✅ Récupérer tous les cours
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate("instructor", "name email");
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching courses", error });
    }
};

// ✅ Récupérer un cours par ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate("instructor", "name email");
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: "Error fetching course", error });
    }
};

// ✅ Mettre à jour un cours
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json({ message: "Course updated successfully", course });
    } catch (error) {
        res.status(500).json({ message: "Error updating course", error });
    }
};

// ✅ Supprimer un cours
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting course", error });
    }
};
