const mongoose = require("mongoose");

const packSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  category: {
    type: String,
    enum: ["premium", "gold", "silver", "basic"],
    required: true,
  },
  icon: { type: String },

  // 📚 Informations pédagogiques
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  duration: { type: String },
  skills: [{ type: String }],
  bonuses: [{ type: String }],
  prerequisites: [{ type: String }],
  content: [
    {
      title: String,
      duration: String,
    }
  ],

  // ✅ Nouveau champ : PDFs liés au pack
  pdfs: [
    {
      title: { type: String },               // Titre du document
      url: { type: String, required: true }, // Lien vers le fichier PDF (stocké localement ou sur cloud)
      locked: { type: Boolean, default: false }, // Pour les verrouiller progressivement
      order: { type: Number },               // Pour gérer l'ordre d'apparition
    }
  ],
  exam: {
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: String
      }
    ]
  }
  
});

// Champ virtuel pour le prix après réduction
packSchema.virtual("priceAfterDiscount").get(function () {
  return this.price - (this.price * this.discount) / 100;
});

packSchema.set("toJSON", { virtuals: true });

const Pack = mongoose.model("Pack", packSchema);
module.exports = Pack;
