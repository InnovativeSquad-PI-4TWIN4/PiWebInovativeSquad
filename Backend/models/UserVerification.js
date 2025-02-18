const mongo = require("mongoose");
const Schema  = mongo.Schema;

const UserVerification = new Schema({
    userId:String,
    uniqueString:String,
    createdAt:Date,
    ExpiredAtAt:Date
    
    });
    
module.exports = mongo.model('usersverification', UserVerification);