const { commentModel } = require('../models/commentModel');
const { userModel } = require('../models/userModel');
const { projectModel } = require('../models/projectModel');

module.exports.createCommentController = async (req, res) => {
  const { note, priorityLevel } = req.body;
  if (!note || note.trim().length < 3) return res.status(400).send("Note must be at least 3 characters");

  try {
    const user = await userModel.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).send("User not found");

    const project = await projectModel.findOne({ clientId: user._id }).lean();
    if (!project) return res.status(404).send("No project found for this user");

    const comment = await commentModel.create({
      note: note.trim(),
      priorityLevel: priorityLevel || 'medium',
      projectId: project._id,
    });

    console.log(`[TICKET CREATED] user: "${user.email}" | name: "${user.name}" | project: "${project.projectName}" | priority: "${priorityLevel || 'medium'}" | ticketId: ${comment._id}`);

    res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.getAllCommentsController = async (req, res) => {
  try {
    const comments = await commentModel
      .find()
      .populate({
        path: 'projectId',
        select: 'projectName clientId',
        populate: { path: 'clientId', select: 'name phone email', model: 'user' }
      })
      .sort({ receivedDate: -1 })
      .lean();

    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.resolveCommentController = async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await commentModel.findByIdAndUpdate(id, { resolved: true }, { new: true });
    if (!comment) return res.status(404).send("Ticket not found");
    await projectModel.updateOne(
      { _id: comment.projectId },
      { $push: { notifications: { type: 'ticket', message: 'Your support ticket has been resolved' } } }
    );
    res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.getMyCommentsController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).send("User not found");

    const project = await projectModel.findOne({ clientId: user._id }).lean();
    if (!project) return res.status(404).send("No project found");

    const comments = await commentModel
      .find({ projectId: project._id })
      .sort({ receivedDate: -1 })
      .lean();

    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
