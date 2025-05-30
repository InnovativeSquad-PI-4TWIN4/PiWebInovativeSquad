const mongoose = require("mongoose");

const exchangeRequestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // 👈 doit correspondre exactement à mongoose.model('users', ...)
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // 👈 pareil ici
    required: true,
  },
  skillOffered: { type: String, required: true },
  skillRequested: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  roomId: {
    type: String,
    default: null
  },
  senderValidation: {
    type: String,
    enum: ["pending", "success", "fail"],
    default: "pending"
  },
  receiverValidation: {
    type: String,
    enum: ["pending", "success", "fail"],
    default: "pending"
  },
  validations: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      result: { type: String, enum: ['success', 'fail'] },
      validatedAt: { type: Date, default: Date.now }
    }
  ]
  
});


module.exports = mongoose.model("ExchangeRequest", exchangeRequestSchema);
