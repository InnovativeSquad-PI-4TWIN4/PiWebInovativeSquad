const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], // ✅ corrigé
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // ✅ corrigé aussi
  gitLink: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
