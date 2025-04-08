const mongoose = require("mongoose");

const packSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // Prix avant réduction
  discount: { type: Number, default: 0 }, // Pourcentage de réduction
  category: {
    type: String,
    enum: ["premium", "gold", "silver", "basic"],
    required: true,
  },
  icon: { type: String }, // peut être une emoji ou une URL

  // NOUVEAUX CHAMPS ⬇
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  duration: { type: String }, // ex: "3h", "2 jours"
  skills: [{ type: String }], // ex: ["Photoshop", "Illustrator"]
  bonuses: [{ type: String }], // ex: ["Certificat", "PDF offert"]
  prerequisites: [{ type: String }], // ex: ["Notions de HTML"]
  content: [
    {
      title: String,         // Titre de la section
      duration: String       // Durée estimée, ex: "45min"
    }
  ]
});

// Prix après réduction (champ virtuel)
packSchema.virtual("priceAfterDiscount").get(function () {
  return this.price - (this.price * this.discount) / 100;
});

packSchema.set("toJSON", { virtuals: true });

const Pack = mongoose.model("Pack", packSchema);
module.exports = Pack;
