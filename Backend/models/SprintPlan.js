const mongoose = require('mongoose');

const SprintStepSchema = new mongoose.Schema({
  week: String,
  tasks: [String]
});

const SprintPlanSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  objective: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  steps: [SprintStepSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SprintPlan', SprintPlanSchema);

