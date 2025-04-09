const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Note = new Schema({
  title: { 
    type: String, 
    required: true,
    default: "Untitled Note" 
  },
  content: { 
    type: String, 
    required: false, // Changed to not required
    default: "" // Add default empty string
  },
  category: { 
    type: String, 
    default: "Personal" 
  },
  tags: { 
    type: [String], 
    default: [] 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "users", 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('notes', Note);