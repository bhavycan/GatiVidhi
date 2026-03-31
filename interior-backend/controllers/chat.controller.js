const { chatMessageModel } = require('../models/chatMessageModel');

module.exports.getconnectingSocket = async (req, res) => {
  const id = req.params.id;
  res.render('chatbot', { userId: id });
};

// GET /chat/conversations — all clients who have chatted, with last message
module.exports.getAllConversationsController = async (req, res) => {
  try {
    const conversations = await chatMessageModel.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$clientId',
          projectId: { $first: '$projectId' },
          lastText: { $first: '$text' },
          lastRole: { $first: '$role' },
          lastAt: { $first: '$createdAt' },
          total: { $sum: 1 },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);

    // Populate client and project names
    const { userModel } = require('../models/userModel');
    const { projectModel } = require('../models/projectModel');

    const populated = await Promise.all(
      conversations.map(async (c) => {
        const client = await userModel.findById(c._id).select('name email').lean();
        const project = await projectModel.findById(c.projectId).select('projectName').lean();
        return {
          clientId: c._id,
          clientName: client?.name || 'Unknown',
          clientEmail: client?.email || '',
          projectId: c.projectId,
          projectName: project?.projectName || 'Unknown',
          lastText: c.lastText,
          lastRole: c.lastRole,
          lastAt: c.lastAt,
          total: c.total,
        };
      })
    );

    return res.status(200).json({ conversations: populated });
  } catch (error) {
    console.error('[CHAT CONVERSATIONS ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// GET /chat/history/:clientId — full message history for a client
module.exports.getChatHistoryController = async (req, res) => {
  const { clientId } = req.params;
  if (!clientId) return res.status(400).json({ message: 'clientId is required' });
  try {
    const messages = await chatMessageModel
      .find({ clientId })
      .sort({ createdAt: 1 })
      .lean();
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('[CHAT HISTORY ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};


