const mongoose = require("mongoose");

const matchRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // ou "User" si ton modèle User est exporté comme ça
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // ou "User"
    required: true,
  },
  publication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Publication",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MatchChat", // 👈 ajout ici pour stocker la conversation liée
    default: null,
  },
  roomId: {
    type: String,
    default: null,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MatchRequest", matchRequestSchema);