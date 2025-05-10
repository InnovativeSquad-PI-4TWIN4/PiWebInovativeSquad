const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['To Do', 'Doing', 'Done'],
    default: 'To Do'
  },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  dueDate: Date,
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Task', taskSchema);
