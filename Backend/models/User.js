const mongo = require("mongoose");
const Schema = mongo.Schema;

const User = new Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  dateOfBirth: Date,
  Skill: [String],
  skillsRecommended: { // 🔵 Nouvelles Skills générées par IA
    type: [String],
    default: []
  },
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

  resetPasswordToken: String,
  resetPasswordExpires: Date,
  solde: { type: Number, default: 0 },
  hasCertificate: { type: Boolean, default: false },
  level: {
    type: Number,
    default: 1,
  },
  successfulExchanges: {
    type: Number,
    default: 0,
  },
  
  // ✅ Certificats obtenus
  certificates: [
    {
      category: String,
      url: String,
      date: { type: Date, default: Date.now }
    }
  ],

  // ✅ Disponibilités hebdomadaires pour les échanges
  availability: {
    type: [String], // ex: ["lundi matin", "mardi après-midi", "samedi soir"]
    default: []
  },

  abonnement: [{ type: Schema.Types.ObjectId, ref: "Pack" }],
  pdfProgress: [
    {
      packId: { type: Schema.Types.ObjectId, ref: "Pack" },
      pdfId: String
    }
  ],
  examResults: [
    {
      packId: { type: Schema.Types.ObjectId, ref: "Pack" },
      score: { type: String }
    }
  ],
  favorites: [{ type: Schema.Types.ObjectId, ref: "courses" }]
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

  const alreadyHasPack = this.abonnement.some(p => p.toString() === packId);
  if (alreadyHasPack) {
    throw new Error("Vous avez déjà acheté ce pack.");
  }

  if (this.wallet < priceAfterDiscount) {
    throw new Error("Points insuffisants pour acheter ce pack.");
  }

  this.wallet -= priceAfterDiscount;
  this.abonnement.push(pack._id);

  await this.save();
  return this;
};

module.exports = mongo.model('users', User);
