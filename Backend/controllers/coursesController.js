const Course = require("../models/Courses");

// ✅ Ajouter un nouveau cours
exports.addCourse = async (req, res) => {
    console.log("🔍 Données reçues :", req.body);
    console.log("📂 Fichier reçu :", req.file);

    const { title, category, instructor } = req.body;
    const pdfFile = req.file;

    if (!title || !category || !instructor || !pdfFile) {
        return res.status(400).json({ message: "Tous les champs sont requis !" });
    }

    try {
        const newCourse = new Course({
            title,
            category,
            instructor,
            pdfUrl: `/uploads/${pdfFile.filename}`
        });

        await newCourse.save();
        res.status(201).json({ message: "Cours ajouté avec succès !" });

    } catch (error) {
        console.error("❌ Erreur lors de l'ajout du cours :", error);
        res.status(500).json({ message: "Erreur lors de la création du cours", error });
    }
};



// ✅ Récupérer tous les cours
// ✅ Récupérer tous les cours avec le nom et l'email de l'instructeur
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate("instructor", "name email");
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des cours", error });
    }
};

// ✅ Récupérer un cours par ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate("instructor", "name email");
        if (!course) return res.status(404).json({ message: "Cours non trouvé" });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du cours", error });
    }
};

// ✅ Mettre à jour un cours
exports.updateCourse = async (req, res) => {
    try {
        const { title, category, instructor } = req.body;
        let pdfUrl = req.file ? "/uploads/" + req.file.filename : undefined;

        const updatedFields = { title, category, instructor };
        if (pdfUrl) updatedFields.pdfUrl = pdfUrl;

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true }
        ).populate("instructor", "name");

        if (!updatedCourse) {
            return res.status(404).json({ message: "Cours non trouvé" });
        }

        res.status(200).json({ message: "Cours mis à jour avec succès", course: updatedCourse });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du cours :", error);
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

// ✅ Supprimer un cours
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: "Cours non trouvé" });
        res.status(200).json({ message: "Cours supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du cours", error });
    }
};