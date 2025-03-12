const mongoose = require("mongoose");
const Schema = mongoose.Schema; // ✅ Déclaration explicite de Schema
const User = require("./User"); // ✅ Assure que le modèle User est bien chargé avant l'utilisation

const CourseSchema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    instructor: { 
        type: Schema.Types.ObjectId, 
        ref: "users", // ✅ Vérifie que la référence correspond bien au nom du modèle User
        required: true 
    },
    pdfUrl: { type: String, required: true }
});

// ✅ Vérifie que le modèle est bien enregistré avant de l'exporter
const Course = mongoose.model("courses", CourseSchema);
module.exports = Course;
