const mongo = require("mongoose");
const Schema  = mongo.Schema;

const User = new Schema({
    name:String,
    surname:String,
    email:String,
    password:String,
    dateOfBirth:Date,
    Skill: String,
    image: String,
    isActive: { type: Boolean, default: true },
    googleId:{ type: String,unique: true, sparse: true },
   secret:{ type: String, },
   role: { 
    type: String, 
    enum: ['admin', 'client', 'client_approuve'], 
    default: 'client' // Par défaut, un utilisateur inscrit est un client
},
status: { type: String, enum: ['unapproved', 'pending', 'approved'], default: 'unapproved' },
   verified: Boolean,
   resetPasswordToken: String,          // ✅ Nouveau champ pour le token
   resetPasswordExpires: Date ,          // ✅ Nouveau champ pour la date d'expiration
     // ✅ Solde en DT
     solde: { type: Number, default: 0 },

     // ✅ Abonnements (packs achetés)
     abonnement: [{ type: Schema.Types.ObjectId, ref: "Pack" }]
 }, { 
     toJSON: { virtuals: true }, 
     toObject: { virtuals: true }
 });
 
 // ✅ Ajout d'un champ virtuel "wallet" qui convertit le solde en points avec 30% de bonus
 User.virtual('wallet').get(function() {
     return Math.floor(this.solde * 1.3) + ' pts'; 
 });
    
module.exports = mongo.model('users', User);