const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  clientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'user',    required: true },
  projectId:  { type: mongoose.Schema.Types.ObjectId, ref: 'project', required: true },
  senderRole: { type: String, enum: ['client', 'admin'], required: true },
  text:       { type: String, default: '' },
  images:     [{ type: String }],
  updateRef:  {
    updateId: { type: mongoose.Schema.Types.ObjectId, ref: 'update' },
    date:     { type: String },
    workDone: { type: String },
  },
  approvalRef: {
    approvalId:  { type: mongoose.Schema.Types.ObjectId, ref: 'approval' },
    title:       { type: String },
    projectName: { type: String },
  },
  ticketRef: {
    ticketId:    { type: mongoose.Schema.Types.ObjectId, ref: 'comment' },
    note:        { type: String },
    projectName: { type: String },
  },
}, { timestamps: true });

const directMessageModel = mongoose.model('directmessage', directMessageSchema);
module.exports = { directMessageModel };
