const mongoose = require('mongoose');

const spendingSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  amount:      { type: Number, required: true },
  date:        { type: Date,   default: Date.now },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'project', default: null },
  projectName: { type: String, default: 'General' },
}, { timestamps: true });

const spendingModel = mongoose.model('spending', spendingSchema);
module.exports = { spendingModel };
