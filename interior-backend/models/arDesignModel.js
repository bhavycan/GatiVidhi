const mongoose = require('mongoose');
const { Schema } = mongoose;

const arDesignSchema = new Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'project', required: true },
  title: { type: String, required: true },
  glbUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const arDesignModel = mongoose.model('ardesign', arDesignSchema);
module.exports = { arDesignModel };
