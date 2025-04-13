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
  verified: { type: Boolean, default: false },
emailToken: { type: String },
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
  pdfProgress: [
    {
      packId: { type: Schema.Types.ObjectId, ref: "Pack" },
      pdfId: String // ou ObjectId si tes PDFs ont des IDs de Mongo
    }
  ],
  examResults: [
    {
      packId: { type: Schema.Types.ObjectId, ref: "Pack" },
      score: { type: String }
    }
  ],
  favorites: [{ type: Schema.Types.ObjectId, ref: "courses" }],
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

User.virtual('wallet').get(function () {
  return Math.floor(this.solde * 1.3) + ' pts';
});

User.methods.buyPack = async function (pack) {
  const packId = pack._id.toString();
  const priceAfterDiscount = pack.price - (pack.price * pack.discount) / 100;

  // 🚫 Vérifier si l'utilisateur possède déjà le pack
  const alreadyHasPack = this.abonnement.some(p => p.toString() === packId);
  if (alreadyHasPack) {
    throw new Error("Vous avez déjà acheté ce pack.");
  }

  // 💸 Vérifier le solde
  if (this.wallet < priceAfterDiscount) {
    throw new Error("Points insuffisants pour acheter ce pack.");
  }

  // ✅ Ajouter le pack
  this.wallet -= priceAfterDiscount;
  this.abonnement.push(pack._id);

  await this.save();
  return this;
};


module.exports = mongo.model('users', User);