const { taskListModel } = require('../models/taskListModel');
const { projectModel } = require('../models/projectModel');

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

    const taskList = await taskListModel.create({ projectId, tasks: [] });
    res.status(201).json(taskList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


// Save the full tasks array for a project (upsert)
module.exports.taskUpdateController = async (req, res) => {
  const { projectId, tasks } = req.body;

  if (!projectId) return res.status(400).json({ message: 'projectId is required' });
  if (!Array.isArray(tasks)) return res.status(400).json({ message: 'tasks must be an array' });

  for (const t of tasks) {
    if (!t.name || typeof t.name !== 'string') {
      return res.status(400).json({ message: 'Each task must have a name' });
    }
    if (t.status && !VALID_STATUSES.includes(t.status)) {
      return res.status(400).json({ message: `Invalid status: ${t.status}` });
    }
  }

  try {
    let taskList = await taskListModel.findOne({ projectId });

    const mappedTasks = tasks.map(t => ({
      name: t.name,
      status: t.status || 'not started',
      date: (t.status === 'ongoing' || t.status === 'completed')
        ? (t.date ? new Date(t.date) : new Date())
        : null,
    }));

    if (!taskList) {
      taskList = await taskListModel.create({ projectId, tasks: mappedTasks, lastUpdated: new Date() });
    } else {
      taskList.tasks = mappedTasks;
      taskList.lastUpdated = new Date();
      await taskList.save();
    }

    const completedNames = mappedTasks.filter(t => t.status === 'completed').map(t => t.name);
    if (completedNames.length) {
      await projectModel.updateOne(
        { _id: projectId },
        {
          $push: {
            notifications: {
              type: 'task',
              message: `Task(s) marked as completed: ${completedNames.join(', ')}`,
            },
          },
        }
      );
    }

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
