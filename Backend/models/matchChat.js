const mongoose = require("mongoose");

const matchChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MatchRequest",
      required: true,
      unique: true, // un seul chat par match
    },
  },
  {
    timestamps: true, // createdAt & updatedAt automatiques
  }
);

module.exports = mongoose.model("MatchChat", matchChatSchema);