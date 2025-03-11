const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title: { type: String, required: true }, // Titre du cours
    category: { type: String, required: true }, // Catégorie du cours
    instructor: { type: Schema.Types.ObjectId, ref: 'users', required: true }, // Enseignant
    pdfUrl: { type: String, required: true }, // Lien vers le fichier PDF du cours
    createdAt: { type: Date, default: Date.now }, // Date de création
});

module.exports = mongoose.model('Course', CourseSchema);