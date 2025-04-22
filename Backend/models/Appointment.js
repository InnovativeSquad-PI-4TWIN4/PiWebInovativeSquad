const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  skill: { type: String, required: true },
  date: { type: Date, required: true },
  link: { type: String, required: true }, // lien Jitsi
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
