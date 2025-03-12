const mongoose = require('mongoose');

const AvisSchema = new mongoose.Schema({
  client: { type: String, required: true }, // Nom du client
  rating: { type: Number, required: true, min: 1, max: 5 }, // Note de 1 à 5 étoiles
  description: { type: String, required: true }, // Commentaire
  createdAt: { type: Date, default: Date.now } // Date de création
});

module.exports = mongoose.model('Avis', AvisSchema);
