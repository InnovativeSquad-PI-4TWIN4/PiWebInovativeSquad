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
   verified: Boolean,
   resetPasswordToken: String,          // ✅ Nouveau champ pour le token
   resetPasswordExpires: Date           // ✅ Nouveau champ pour la date d'expiration
    });
    
module.exports = mongo.model('users', User);