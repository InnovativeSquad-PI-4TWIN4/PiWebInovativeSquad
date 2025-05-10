const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MatchRoomSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "users", required: true }], // Deux utilisateurs
  createdAt: { type: Date, default: Date.now },
  roomId: { type: String, required: true, unique: true }, // ID unique pour la room
});

module.exports = mongoose.model("MatchRoom", MatchRoomSchema);