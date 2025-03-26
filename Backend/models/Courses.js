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
    pdfUrl: { type: String, required: true },

    // ✅ Champs pour cours premium
    isPremium: { type: Boolean, default: false },
    meetLink: { type: String, default: "" }
}, {
    timestamps: true // ✅ Pour garder createdAt / updatedAt
});

const Course = mongoose.model("courses", CourseSchema);
module.exports = Course;
