const mongoose = require('mongoose');
const { Schema } = mongoose;

const materialSchema = new Schema({
  label: { type: String, required: true },
  materialName: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const materialModel = mongoose.model('material', materialSchema);
module.exports = { materialModel };
