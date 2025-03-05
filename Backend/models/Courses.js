const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Course = new Schema({
    title: { type: String, required: true },  // Titre du cours
    description: { type: String, required: true },  // Brève description
    category: { type: String, required: true },  // Catégorie du cours (ex: Développement, Design, Marketing)
    instructor: { type: Schema.Types.ObjectId, ref: 'users', required: true },  // Créateur du cours
    price: { type: Number, default: 0 },  // Prix du cours (0 si échange de compétences)
    skillsTaught: [{ type: String, required: true }],  // Liste des compétences enseignées
    skillsRequired: [{ type: String }],  // Compétences pré-requises pour suivre le cours
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },  // Niveau requis
    duration: { type: Number, required: true },  // Durée en minutes
    image: { type: String },  // URL de l'image du cours
    content: [{ 
        type: { type: String, enum: ['video', 'article', 'quiz', 'assignment'] }, 
        url: String,  // Lien vers la ressource (vidéo, article, etc.)
        text: String  // Texte pour les articles ou quiz
    }], 
    createdAt: { type: Date, default: Date.now },  // Date de création
    updatedAt: { type: Date, default: Date.now },  // Dernière mise à jour
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },  // État du cours
    rating: { type: Number, default: 0 },  // Note moyenne des utilisateurs
    enrolledUsers: [{ type: Schema.Types.ObjectId, ref: 'users' }],  // Liste des étudiants inscrits
    reviews: [{ 
        user: { type: Schema.Types.ObjectId, ref: 'users' }, 
        rating: { type: Number, min: 1, max: 5 }, 
        comment: String, 
        date: { type: Date, default: Date.now }
    }],  
    isActive: { type: Boolean, default: true } // Statut actif/inactif
    //aiRecommendations: [{ type: Schema.Types.ObjectId, ref: 'courses' }],  // Suggestions d'autres cours par l'IA
    //aiMentorInsights: { type: String }  // Conseils personnalisés de l’IA pour ce cours
});

module.exports = mongoose.model('courses', Course);
