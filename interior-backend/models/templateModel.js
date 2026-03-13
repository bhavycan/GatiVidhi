const mongoose = require('mongoose');

const taskEntrySchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { _id: false });

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  tasks: { type: [taskEntrySchema], default: [] },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const templateModel = mongoose.model('template', templateSchema);
module.exports = { templateModel };
