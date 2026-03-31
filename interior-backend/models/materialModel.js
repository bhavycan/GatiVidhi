const mongoose = require('mongoose');
const { Schema } = mongoose;

const materialSchema = new Schema({
  label: { type: String, required: true },
  materialName: { type: String, required: true },
  category: { type: String, default: '' },
  brand: { type: String, default: '' },
  unit: { type: String, default: '' },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const materialModel = mongoose.model('material', materialSchema);
module.exports = { materialModel };
