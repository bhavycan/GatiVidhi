const mongoose = require('mongoose');
const { Schema } = mongoose;

const approvalSchema = new Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project',
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 300,
  },
  date: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  images: {
    type: [String],
    default: [],
  },
  note: {
    type: String,
    default: '',
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  clientNote: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  respondedAt: {
    type: Date,
    default: null,
  },
  adminSeen: {
    type: Boolean,
    default: false,
  },
  reminderSentAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const approvalModel = mongoose.model('approval', approvalSchema);
module.exports = { approvalModel };
