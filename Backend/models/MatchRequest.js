const mongoose = require("mongoose");
const User = require("../models/User"); // ✅ Chemin correct

const matchRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },   // 🔁 ref corrigé
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }, // 🔁 ref corrigé
  publication: { type: mongoose.Schema.Types.ObjectId, ref: "Publication", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MatchRequest", matchRequestSchema);