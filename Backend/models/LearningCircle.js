const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LearningCircleSchema = new Schema({
  topic: { type: String, required: true }, // ex: "React Basics"
  description: String,
  skillTag: String, // ex: "React", "Python"
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  
  moderator: { type: Schema.Types.ObjectId, ref: "users" }, // One who leads
  
  participants: [{ type: Schema.Types.ObjectId, ref: "users" }], // Others
  
  maxParticipants: { type: Number, default: 6 },
  scheduledDate: { type: Date, required: true }, // Meetup time
  videoCallLink: String,  // New field for video call link

  createdAt: { type: Date, default: Date.now },
  deleteReason: { type: String, default: null }, // New field for storing the deletion reason

});

module.exports = mongoose.model("LearningCircle", LearningCircleSchema);
