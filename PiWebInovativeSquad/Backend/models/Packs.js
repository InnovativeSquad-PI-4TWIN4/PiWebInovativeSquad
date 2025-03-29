const mongoose = require("mongoose");

const packSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // Prix avant réduction
  discount: { type: Number, default: 0 }, // Pourcentage de réduction (ex: 10 pour -10%)
  category: { 
    type: String, 
    enum: ["premium", "gold", "silver", "basic"], // Nouvelles valeurs d'énumération
    required: true 
  },
  
});

// Prix après réduction (champ virtuel)
packSchema.virtual("priceAfterDiscount").get(function () {
  return this.price - (this.price * this.discount) / 100;
});

// Inclure les champs virtuels dans les réponses JSON
packSchema.set("toJSON", { virtuals: true });

const Pack = mongoose.model("Pack", packSchema);
module.exports = Pack;
