const path = require('path');
const { approvalModel } = require('../models/approvalModel');
const { projectModel } = require('../models/projectModel');
const { userModel } = require('../models/userModel');
const uploadImage = require('../utils/cloudinary.multer');
const sendEmail = require('../utils/emailNotification');

// POST /approval/create
module.exports.createApprovalController = async (req, res) => {
  const { projectId, projectName, title, date, priority, note } = req.body;

  if (!projectId || !title || !date || !priority) {
    return res.status(400).json({ message: 'projectId, title, date, and priority are required' });
  }

  try {
    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      (req.files || []).map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const { secure_url } = await uploadImage(dataURI, `approval_${projectName}_${Date.now()}`);
        return secure_url;
      })
    );

    const approval = await approvalModel.create({
      projectId,
      projectName: project.projectName,
      title,
      date: new Date(date),
      priority: priority.toLowerCase(),
      images: imageUrls,
      note: note || '',
    });

    // Push in-app notification to the project's client
    await projectModel.updateOne(
      { _id: projectId },
      {
        $push: {
          notifications: {
            type: 'approval',
            message: `Approval required: ${title}`,
          },
        },
      }
    );

    console.log(`[APPROVAL CREATED] project: "${project.projectName}" | title: "${title}" | priority: "${priority}" | id: ${approval._id}`);

    // Send email notification to client
    try {
      const clientUser = await userModel.findById(project.clientId).select('name email');
      if (clientUser && clientUser.email) {
        const approvalDate = new Date(date);
        const formattedDate = !isNaN(approvalDate)
          ? approvalDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'N/A';

        const userDetail = {
          name: clientUser.name || 'Client',
          email: clientUser.email,
          subject: `Approval Required: ${title} — ${project.projectName}`,
          projectName: project.projectName,
          title,
          priority: priority.toLowerCase(),
          note: note || '',
          date: formattedDate,
        };

        console.log(`[APPROVAL EMAIL] Sending to: ${clientUser.email}`);
        await sendEmail(userDetail, path.join(__dirname, '../views/approvalEmail.ejs'));
        console.log(`[APPROVAL EMAIL] Sent successfully to: ${clientUser.email}`);
      }
    } catch (emailError) {
      // Email failure should not block the creation response
      console.error('[APPROVAL CREATE EMAIL ERROR]', emailError.message || emailError);
    }

    return res.status(201).json({ approval });
  } catch (error) {
    console.error('[APPROVAL CREATE ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// GET /approval/by-project/:projectId
module.exports.getApprovalsByProjectController = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) return res.status(400).json({ message: 'projectId is required' });

  try {
    const approvals = await approvalModel
      .find({ projectId })
      .sort({ createdAt: -1 });

    // Return client contact info so the frontend can offer a Call button
    let clientPhone = null;
    let clientName = null;
    const project = await projectModel.findById(projectId).select('clientId');
    if (project) {
      const user = await userModel.findById(project.clientId).select('phone name');
      if (user) {
        clientPhone = user.phone;
        clientName = user.name;
      }
    }

    return res.status(200).json({ approvals, clientPhone, clientName });
  } catch (error) {
    console.error('[APPROVAL FETCH ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// POST /approval/remind/:id
module.exports.sendApprovalReminderController = async (req, res) => {
  const { id } = req.params;

  try {
    const approval = await approvalModel.findById(id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });
    if (approval.status === 'approved') return res.status(400).json({ message: 'Approval already approved' });

    const project = await projectModel.findById(approval.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const user = await userModel.findById(project.clientId);
    if (!user) return res.status(404).json({ message: 'Client not found for this project' });
    if (!user.email) return res.status(400).json({ message: 'Client has no email address on record' });

    const approvalDate = approval.date ? new Date(approval.date) : null;
    const formattedDate = approvalDate && !isNaN(approvalDate)
      ? approvalDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'N/A';

    const userDetail = {
      name: user.name || 'Client',
      email: user.email,
      subject: `Action Required: Approval Needed for ${project.projectName}`,
      projectName: project.projectName,
      title: approval.title || 'Untitled',
      priority: approval.priority || 'low',
      note: approval.note || '',
      date: formattedDate,
    };

    console.log(`[APPROVAL EMAIL] Attempting to send reminder to: ${user.email} | approval: ${approval._id}`);

    try {
      await sendEmail(userDetail, path.join(__dirname, '../views/approvalEmail.ejs'));
      console.log(`[APPROVAL EMAIL] Successfully sent to: ${user.email}`);
    } catch (emailError) {
      console.error('[APPROVAL EMAIL SEND FAILED]', emailError.message || emailError);
      return res.status(500).json({
        message: 'Failed to send email',
        detail: emailError.message || String(emailError),
      });
    }

    approval.reminderSentAt = new Date();
    await approval.save();

    console.log(`[APPROVAL REMINDER SENT] approval: ${approval._id} | client: ${user.email}`);

    return res.status(200).json({ message: 'Reminder sent successfully' });
  } catch (error) {
    console.error('[APPROVAL REMIND ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong', detail: error.message });
  }
};

// PUT /approval/edit/:id  — admin edits a rejected approval and resubmits (resets to pending)
module.exports.editApprovalController = async (req, res) => {
  const { id } = req.params;
  const { title, date, priority, note } = req.body;

  if (!title || !date || !priority) {
    return res.status(400).json({ message: 'title, date, and priority are required' });
  }

  try {
    const approval = await approvalModel.findById(id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });

    // Upload any newly added images
    const newImageUrls = await Promise.all(
      (req.files || []).map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const { secure_url } = await uploadImage(dataURI, `approval_edit_${approval.projectName}_${Date.now()}`);
        return secure_url;
      })
    );

    approval.title = title;
    approval.date = new Date(date);
    approval.priority = priority.toLowerCase();
    approval.note = note || '';
    if (newImageUrls.length > 0) {
      approval.images = [...approval.images, ...newImageUrls];
    }
    approval.status = 'pending';
    await approval.save();

    console.log(`[APPROVAL EDITED] approval: ${approval._id} | new status: pending`);

    return res.status(200).json({ approval });
  } catch (error) {
    console.error('[APPROVAL EDIT ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// GET /approval/my  — client fetches all approvals for their project
module.exports.getApprovalsForClientController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).select('_id');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = await projectModel.findOne({ clientId: user._id }).select('_id projectName');
    if (!project) return res.status(404).json({ message: 'No project found for this client' });

    const approvals = await approvalModel
      .find({ projectId: project._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ approvals, projectName: project.projectName });
  } catch (error) {
    console.error('[CLIENT APPROVAL FETCH ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// POST /approval/approve/:id  (client approves with optional note)
module.exports.approveApprovalController = async (req, res) => {
  const { id } = req.params;
  const { clientNote } = req.body;

  try {
    const approval = await approvalModel.findById(id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });

    approval.status = 'approved';
    approval.clientNote = clientNote || '';
    approval.respondedAt = new Date();
    approval.adminSeen = false;
    await approval.save();

    console.log(`[APPROVAL APPROVED] approval: ${approval._id}`);

    return res.status(200).json({ approval });
  } catch (error) {
    console.error('[APPROVAL APPROVE ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// POST /approval/reject/:id  (client rejects with optional note)
module.exports.rejectApprovalController = async (req, res) => {
  const { id } = req.params;
  const { clientNote } = req.body;

  try {
    const approval = await approvalModel.findById(id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });

    approval.status = 'rejected';
    approval.clientNote = clientNote || '';
    approval.respondedAt = new Date();
    approval.adminSeen = false;
    await approval.save();

    console.log(`[APPROVAL REJECTED] approval: ${approval._id}`);

    return res.status(200).json({ approval });
  } catch (error) {
    console.error('[APPROVAL REJECT ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// POST /approval/admin-clear — mark all responded approvals as seen by admin
module.exports.markAdminSeenController = async (req, res) => {
  try {
    await approvalModel.updateMany(
      { status: { $in: ['approved', 'rejected'] }, adminSeen: false },
      { $set: { adminSeen: true } }
    );
    return res.status(200).json({ message: 'Marked as seen' });
  } catch (error) {
    console.error('[APPROVAL MARK SEEN ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
