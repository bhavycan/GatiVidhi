const mongoose = require('mongoose');
const { Schema } = mongoose;

const STATUSES = ['not started', 'ongoing', 'completed'];

const taskEntrySchema = new Schema({
  name: { type: String, required: true },
  status: { type: String, enum: STATUSES, default: 'not started' },
  date: { type: Date, default: null },
}, { _id: false });

const taskListSchema = new Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project',
    required: true,
    unique: true,
  },
  tasks: { type: [taskEntrySchema], default: [] },
  lastUpdated: { type: Date, default: null },
  updateNumber: { type: Number, default: 0 },
});

const taskList = mongoose.model('tasklist', taskListSchema);
module.exports = { taskListModel: taskList };
