const mongo = require("mongoose");
const Schema = mongo.Schema;

const Message = new Schema({
    conversationId: { type: String, required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
}, { 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

module.exports = mongo.model('messages', Message);
