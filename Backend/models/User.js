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
    googleId:{ type: String, },
   secret:{ type: String, },
    verified: Boolean
    });
    
module.exports = mongo.model('users', User);