const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SkillSwipeSchema = new Schema({
  swiper: { type: Schema.Types.ObjectId, ref: "users", required: true },      // celui qui swipe
  target: { type: Schema.Types.ObjectId, ref: "users", required: true },      // celui qui est swipé
  publication: { type: Schema.Types.ObjectId, ref: "Publication", required: true }, // la publication swipée
  direction: { type: String, enum: ["left", "right"], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SkillSwipe", SkillSwipeSchema);