const User = require("../models/User");
const Course = require("../models/Courses");


// Premium Courses
exports.accessPremiumCourse = async (req, res) => {
  const courseId = req.params.id;
  const userId = req.body.userId;

  console.log("📥 Requête reçue - courseId:", courseId, "userId:", userId);

  // 🔒 Vérification que l'ID utilisateur est valide
  if (!userId || userId === "undefined") {
    return res.status(400).json({ message: "ID utilisateur invalide ou manquant." });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Cours non trouvé." });
    }

    // 🔍 Vérifie que le cours est bien premium
    if (!course.isPremium) {
      return res.status(400).json({ message: "Ce cours n'est pas premium." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // 💰 Vérifie le solde
    if (user.solde >= course.price) {
      user.solde -= course.price;
      await user.save();

      return res.status(200).json({
        message: "Accès autorisé",
        meetLink: course.meetLink,
        remainingBalance: user.solde
      });
    } else {
      return res.status(403).json({ message: "❌ Solde insuffisant." });
    }
  } catch (error) {
    console.error("❌ Erreur dans accessPremiumCourse :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};



// ✅ Ajouter un nouveau cours (avec support Premium)
exports.addCourse = async (req, res) => {
    const { title, category, instructor, isPremium, meetLink, price } = req.body;
    const pdfFile = req.file;
  
    if (!title || !category || !instructor || !pdfFile) {
      return res.status(400).json({ message: "Tous les champs sont requis !" });
    }
  
    try {
      const newCourse = new Course({
        title,
        category,
        instructor,
        pdfUrl: `/uploads/${pdfFile.filename}`,
        isPremium: isPremium === 'true',
        meetLink,
       price: parseFloat(price) || 0// ✅ convertit correctement
      });
  
      await newCourse.save();
      res.status(201).json({ message: "Cours ajouté avec succès !" });
  
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la création du cours", error });
    }
  };
  

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

// ✅ Mettre à jour un cours (avec gestion des champs Premium)
exports.updateCourse = async (req, res) => {
    try {
        const { title, category, instructor, isPremium, meetLink } = req.body;
        let pdfUrl = req.file ? "/uploads/" + req.file.filename : undefined;

        const updatedFields = {
            title,
            category,
            instructor,
            isPremium: isPremium === 'true',
            meetLink
        };

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
