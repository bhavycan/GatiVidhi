const Joi = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const workerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  adminId: { type: String, default: null },
  assignedClientId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
  assignedProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'project', default: null },
  updateImages: { type: [String], default: [] },
  date: { type: Date, default: Date.now },
  notes: { type: String },
  notifications: [{
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  }],
});

const validateWorker = (worker) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    adminId: Joi.string().optional().allow(null),
    assignedClientId: Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
      return value;
    }, 'ObjectId Validation').optional().allow(null),
    assignedProjectId: Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
      return value;
    }, 'ObjectId Validation').optional().allow(null),
    updateImages: Joi.array().items(Joi.string()).optional(),
    date: Joi.date().optional(),
    notes: Joi.string().optional(),
  });

  return schema.validate(worker);
};

const Worker = mongoose.model('worker', workerSchema);
module.exports = { workerModel: Worker, validateWorker };
