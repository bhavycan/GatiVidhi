const mongoose = require('mongoose');

const workerUpdateSchema = new mongoose.Schema({
  workerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'worker', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'project', required: true },
  notes:        { type: String, default: '' },
  updateImages: { type: [String], default: [] },
  date:   { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'used', 'retake'], default: 'pending' },
});

const WorkerUpdate = mongoose.model('workerupdate', workerUpdateSchema);
module.exports = { workerUpdateModel: WorkerUpdate };
