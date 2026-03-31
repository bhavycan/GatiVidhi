const express = require('express');
const route = express.Router();
const upload = require('../config/multer');
const adminAuthentification = require('../middlewares/adminAuthentification');
const userAuthentification = require('../middlewares/userAuthentification');
const {
  createApprovalController,
  getAllApprovalsController,
  getApprovalsByProjectController,
  getApprovalsForClientController,
  sendApprovalReminderController,
  editApprovalController,
  approveApprovalController,
  rejectApprovalController,
  markAdminSeenController,
} = require('../controllers/approval.controller');

route.get('/', (req, res) => {
  res.send('Approval route is live');
});

// Admin: get all approvals across all projects
route.get('/all', adminAuthentification, getAllApprovalsController);

// Admin: create a new approval request
route.post('/create', adminAuthentification, upload.array('images', 10), createApprovalController);

// Admin: get all approvals for a project
route.get('/by-project/:projectId', adminAuthentification, getApprovalsByProjectController);

// Admin: send reminder email to client for a pending approval
route.post('/remind/:id', adminAuthentification, sendApprovalReminderController);

// Admin: edit a rejected approval and resubmit (resets status to pending)
route.put('/edit/:id', adminAuthentification, upload.array('images', 10), editApprovalController);

// Client: get all approvals for their project
route.get('/my', userAuthentification, getApprovalsForClientController);

// Client: approve an approval with optional note
route.post('/approve/:id', userAuthentification, approveApprovalController);

// Client: reject an approval with optional note
route.post('/reject/:id', userAuthentification, rejectApprovalController);

// Admin: mark all client-responded approvals as seen (called when notification panel opens)
route.post('/admin-clear', adminAuthentification, markAdminSeenController);

module.exports = route;
