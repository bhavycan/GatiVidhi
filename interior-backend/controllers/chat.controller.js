const { chatMessageModel } = require('../models/chatMessageModel');
const { directMessageModel } = require('../models/directMessageModel');

// ── AI Chatbot (existing) ──────────────────────────────────────────────────

module.exports.getconnectingSocket = async (req, res) => {
  const id = req.params.id;
  res.render('chatbot', { userId: id });
};

// GET /chat/conversations — all clients who have chatted (AI), with last message
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

// GET /chat/history/:clientId — full AI message history for a client
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

// ── Direct Client-Admin Messaging ─────────────────────────────────────────

// GET /chat/dm/conversations — all clients with a direct message, with last message (admin)
module.exports.getDMConversationsController = async (req, res) => {
  try {
    const conversations = await directMessageModel.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$clientId',
          projectId: { $first: '$projectId' },
          lastText: { $first: '$text' },
          lastRole: { $first: '$senderRole' },
          lastAt: { $first: '$createdAt' },
          total: { $sum: 1 },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);

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
    console.error('[DM CONVERSATIONS ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// GET /chat/dm/history/:clientId — full DM history for a client (admin view)
module.exports.getDMHistoryController = async (req, res) => {
  const { clientId } = req.params;
  if (!clientId) return res.status(400).json({ message: 'clientId is required' });
  try {
    const messages = await directMessageModel
      .find({ clientId })
      .sort({ createdAt: 1 })
      .lean();
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('[DM HISTORY ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// GET /chat/dm/my — client's own DM history
module.exports.getMyDMHistoryController = async (req, res) => {
  try {
    const { userModel } = require('../models/userModel');
    const user = await userModel.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const messages = await directMessageModel
      .find({ clientId: user._id })
      .sort({ createdAt: 1 })
      .lean();
    return res.status(200).json({ messages, userId: user._id });
  } catch (error) {
    console.error('[DM MY HISTORY ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
