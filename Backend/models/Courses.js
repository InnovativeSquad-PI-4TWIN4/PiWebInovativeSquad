const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User"); // Pour s'assurer que le modèle User est bien enregistré

const CourseSchema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    instructor: { 
        type: Schema.Types.ObjectId, 
        ref: "users", // Vérifie que le nom correspond à celui défini dans mongoose.model
        required: true 
    },
    pdfUrl: {
        type: String,
        required: function () {
          return !this.isPremium; // requis seulement si le cours est gratuit
        }
    },

    // ✅ Champs pour cours premium
    isPremium: { type: Boolean, default: false },
    meetLink: { type: String, default: "" },
    isMeetEnded: { type: Boolean, default: false },
    videoReplayUrl: { type: String, default: "" },
    price: { type: Number, default: 0 }, // 💰 Prix du cours premium

    // 🧠 Nouveau champ pour IA : résumé textuel
    
  // ✅ Champ manquant à ajouter
  courseSummary: { type: String, default: "" }  // <<< Ajoute ceci

}, {
    timestamps: true // ✅ Pour garder createdAt / updatedAt
});

const Course = mongoose.model("courses", CourseSchema);
module.exports = Course;
