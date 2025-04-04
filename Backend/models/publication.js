const mongo = require('mongoose');
const Schema = mongo.Schema;

const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  replies: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Publication = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  type: {
    type: String,
    enum: ['offer', 'request'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  ],
  comments: [CommentSchema],
});

module.exports = mongo.model('Publication', Publication);