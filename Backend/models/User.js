const mongo = require("mongoose");
const Schema = mongo.Schema;

const User = new Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  dateOfBirth: Date,
  Skill: String,
  image: String,
  isActive: { type: Boolean, default: true },
  googleId: { type: String, unique: true, sparse: true },
  secret: { type: String },
  role: {
    type: String,
    enum: ['admin', 'client', 'client_approuve'],
    default: 'client'
  },
  status: { type: String, enum: ['unapproved', 'pending', 'approved'], default: 'unapproved' },
  verified: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  solde: { type: Number, default: 0 },
  abonnement: [{ type: Schema.Types.ObjectId, ref: "Pack" }],
  favorites: [{ type: Schema.Types.ObjectId, ref: "courses" }],
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

User.virtual('wallet').get(function () {
  return Math.floor(this.solde * 1.3) + ' pts';
});

User.methods.buyPack = async function (pack) {
  const packPrice = pack.priceAfterDiscount;

  if (this.wallet < packPrice) {
    throw new Error("Points insuffisants pour acheter ce pack.");
  }

  this.wallet -= packPrice;
  this.abonnement.push(pack._id);

  await this.save();
  return this;
};

module.exports = mongo.model('users', User);