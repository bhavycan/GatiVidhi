const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  clientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'user',    required: true },
  projectId:  { type: mongoose.Schema.Types.ObjectId, ref: 'project', required: true },
  senderRole: { type: String, enum: ['client', 'admin'], required: true },
  text:       { type: String, required: true },
  updateRef:  {
    updateId: { type: mongoose.Schema.Types.ObjectId, ref: 'update' },
    date:     { type: String },
    workDone: { type: String },
  },
}, { timestamps: true });

const directMessageModel = mongoose.model('directmessage', directMessageSchema);
module.exports = { directMessageModel };
