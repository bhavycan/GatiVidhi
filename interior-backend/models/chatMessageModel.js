const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatMessageSchema = new Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'project', required: true },
  clientId:  { type: mongoose.Schema.Types.ObjectId, ref: 'user',    required: true },
  role:      { type: String, enum: ['user', 'model'], required: true },
  text:      { type: String, required: true },
}, { timestamps: true });

const chatMessageModel = mongoose.model('chatmessage', chatMessageSchema);
module.exports = { chatMessageModel };
