const mongoose = require('mongoose');
const { Schema } = mongoose;

const installmentSchema = new Schema({
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidAt: { type: Date, default: null },
  notes: { type: String, default: '' },
  lastReminderAt: { type: Date, default: null },
});

const paymentSchema = new Schema({
  projectId: { type: mongoose.Types.ObjectId, ref: 'project', required: true, unique: true },
  totalAmount: { type: Number, required: true },
  installments: [installmentSchema],
  createdAt: { type: Date, default: Date.now },
});

const paymentModel = mongoose.model('payment', paymentSchema);
module.exports = { paymentModel };
