// PremiumCoursesController.js

const User = require("../models/User");
const Course = require("../models/Courses"); // ou ton modèle de cours
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// ✅ Ajouter un cours premium
exports.addPremiumCourse = async (req, res) => {
  try {
    console.log("📦 Données reçues :", req.body);

    const { title, category, instructor, meetLink, price } = req.body;

    if (!title || !category || !instructor || !meetLink || !price) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const newCourse = new Course({
      title,
      category,
      instructor: new ObjectId(instructor), // ✅ conversion ici
      meetLink,
      price,
      isPremium: true,
      isMeetEnded: false,
      videoReplayUrl: "",
    });

    await newCourse.save();

    res.status(201).json({ message: "✅ Cours premium ajouté avec succès", course: newCourse });
  } catch (error) {
    console.error("❌ Erreur dans addPremiumCourse:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
exports.updatePremiumCourse = async (req, res) => {
  try {
    const { title, category, instructor, videoReplayUrl } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course || !course.isPremium) {
      return res.status(404).json({ message: "Cours premium non trouvé" });
    }

    const updatedFields = {
      title,
      category,
      instructor,
      videoReplayUrl: videoReplayUrl || course.videoReplayUrl
    };

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    res.status(200).json({ message: "Cours premium mis à jour", course: updatedCourse });
  } catch (error) {
    console.error("Erreur update cours premium:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


// ✅ Marquer un cours comme terminé
exports.markMeetEnded = async (req, res) => {
    try {
      const updated = await Course.findByIdAndUpdate(
        req.params.id,
        { $set: { isMeetEnded: true, meetLink: null, isPremium: true } }, // <== AJOUT ici
        { new: true }
      );
  
      if (!updated) return res.status(404).json({ message: "Cours non trouvé" });
  
      res.status(200).json({ message: "Meet marqué comme terminé", updated });
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err });
    }
  };
  

// ✅ Ajouter ou modifier le lien d'enregistrement
// ✅ Ajouter ou modifier le lien d'enregistrement
exports.updateReplayLink = async (req, res) => {
    try {
      const { videoReplayUrl } = req.body;
  
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Cours non trouvé" });
      }
  
      if (!course.isPremium || !course.isMeetEnded) {
        return res.status(400).json({ message: "Le replay ne peut être ajouté que pour un cours premium terminé." });
      }
  
      // 👇 Vérifie que cette ligne existe bien :
      course.videoReplayUrl = videoReplayUrl;
  
      await course.save();
  
      res.status(200).json({ message: "Replay ajouté avec succès", course });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de l'ajout du replay", error });
    }
  };
  

// ✅ Accès aux cours Premium
exports.accessPremiumCourse = async (req, res) => {
  const courseId = req.params.id;
  const userId = req.body.userId;

  if (!userId || userId === "undefined") {
    return res.status(400).json({ message: "ID utilisateur invalide ou manquant." });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Cours non trouvé." });
    }

    if (!course.isPremium) {
      return res.status(400).json({ message: "Ce cours n'est pas premium." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

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

// ✅ Recharge du solde d’un utilisateur
exports.rechargeBalance = async (req, res) => {
  const userId = req.params.id;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "Montant invalide" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.solde += parseFloat(amount);
    await user.save();

    res.status(200).json({ message: "✅ Recharge réussie", newBalance: user.solde });
  } catch (error) {
    console.error("❌ Erreur lors de la recharge :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};