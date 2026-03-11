const mongoose = require('mongoose');
const { Schema } = mongoose;

const STATUSES = ['not started', 'ongoing', 'completed'];

const taskSchema = new Schema({
  status: {
    type: String,
    enum: STATUSES,
    default: 'not started',
  },
  date: {
    type: Date,
    default: null,
  },
}, { _id: false });

const taskListSchema = new Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project',
    required: true,
    unique: true,
  },
  lastUpdated: {
    type: Date,
    default: null,
  },
  Layout:         { type: taskSchema, default: () => ({}) },
  PopChannel:     { type: taskSchema, default: () => ({}) },
  Electrification:{ type: taskSchema, default: () => ({}) },
  Ceiling:        { type: taskSchema, default: () => ({}) },
  Furniture:      { type: taskSchema, default: () => ({}) },
  Laminate:       { type: taskSchema, default: () => ({}) },
  Paint:          { type: taskSchema, default: () => ({}) },
  Lights:         { type: taskSchema, default: () => ({}) },
  Cleaning:       { type: taskSchema, default: () => ({}) },
  HandOver:       { type: taskSchema, default: () => ({}) },
});

const taskList = mongoose.model('tasklist', taskListSchema);
module.exports = { taskListModel: taskList };
