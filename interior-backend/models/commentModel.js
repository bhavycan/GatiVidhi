const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  note: {
    type: String,
    required: true,
    minlength: 3,
  },
  priorityLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  receivedDate: {
    type: Date,
    default: Date.now,
  },
  projectId: {
    type: mongoose.Types.ObjectId,
    ref: 'project',
    required: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
});

const commentModel = mongoose.model('comment', commentSchema);
module.exports = { commentModel };
