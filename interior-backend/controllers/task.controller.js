const { taskListModel } = require('../models/taskListModel');
const { projectModel } = require('../models/projectModel');

const VALID_TASKS = [
  'Layout', 'PopChannel', 'Electrification', 'Ceiling',
  'Furniture', 'Laminate', 'Paint', 'Lights', 'Cleaning', 'HandOver'
];

const VALID_STATUSES = ['not started', 'ongoing', 'completed'];


module.exports.taskGetController = async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) return res.status(400).json({ message: 'projectId is required' });

  try {
    const taskList = await taskListModel.findOne({ projectId }).lean();
    if (!taskList) return res.status(404).json({ message: 'TaskList not found' });
    res.status(200).json(taskList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports.taskCreateController = async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json({ message: 'projectId is required' });

  try {
    const existing = await taskListModel.findOne({ projectId });
    if (existing) return res.status(400).json({ message: 'TaskList already exists for this project' });

    const taskList = await taskListModel.create({ projectId });
    res.status(201).json(taskList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


module.exports.taskUpdateController = async (req, res) => {
  const { projectId, task, status, date } = req.body;

  if (!projectId) return res.status(400).json({ message: 'projectId is required' });
  if (!task || !VALID_TASKS.includes(task)) return res.status(400).json({ message: `task must be one of: ${VALID_TASKS.join(', ')}` });
  if (!status || !VALID_STATUSES.includes(status)) return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });

  try {
    const taskList = await taskListModel.findOne({ projectId });
    if (!taskList) return res.status(404).json({ message: 'TaskList not found for this project' });

    taskList[task].status = status;
    taskList[task].date = (status === 'ongoing' || status === 'completed')
      ? (date ? new Date(date) : new Date())
      : null;
    taskList.lastUpdated = new Date();

    await taskList.save();
    const msg = status === 'completed'
      ? `Task "${task}" has been marked as completed`
      : `Task "${task}" status updated to ${status}`;
    await projectModel.updateOne(
      { _id: projectId },
      { $push: { notifications: { type: 'task', message: msg } } }
    );
    res.status(200).json(taskList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


module.exports.taskStaleController = async (req, res) => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const staleLists = await taskListModel
      .find({ lastUpdated: { $lt: threeDaysAgo } })
      .populate('projectId', 'projectName')
      .lean();

    const result = staleLists.map(t => ({
      projectId: t.projectId._id,
      projectName: t.projectId.projectName,
      lastUpdated: t.lastUpdated,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


module.exports.taskDeleteController = async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json({ message: 'projectId is required' });

  try {
    const taskList = await taskListModel.findOneAndDelete({ projectId });
    if (!taskList) return res.status(404).json({ message: 'TaskList not found for this project' });

    res.status(200).json({ message: 'TaskList deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
