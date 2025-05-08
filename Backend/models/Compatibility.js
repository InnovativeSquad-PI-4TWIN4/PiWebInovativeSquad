const mongoose = require("mongoose");

const compatibilitySchema = new mongoose.Schema({
  publication1: { type: mongoose.Schema.Types.ObjectId, ref: "Publication", required: true },
  publication2: { type: mongoose.Schema.Types.ObjectId, ref: "Publication", required: true },
  similarityScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Compatibility", compatibilitySchema);