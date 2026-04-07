const express = require('express');
const adminAuthentification = require('../middlewares/adminAuthentification');
const workerAuthentification = require('../middlewares/workerAuthentification');
const upload = require('../config/multer');
const {
  createWorkerController,
  getAllWorkersController,
  assignProjectController,
  deleteWorkerController,
  workerLoginController,
  workerProfileController,
  workerSubmitUpdateController,
  workerTodayUpdateController,
  getWorkerUpdatesForProjectController,
  getRecentWorkerImagesController,
  useWorkerUpdateController,
  retakeWorkerUpdateController,
  workerNotificationsController,
  markWorkerNotificationsReadController,
  workerLogoutController,
  updateWorkerSelfController,
  sendWorkerOtpController,
  verifyWorkerOtpChangePasswordController,
  workerForgotPasswordSendOtpController,
  workerForgotPasswordResetController,
} = require('../controllers/worker.controller');

const route = express.Router();

// Worker auth
route.post('/login', workerLoginController);
route.post('/forgot-password', workerForgotPasswordSendOtpController);
route.post('/reset-password', workerForgotPasswordResetController);
route.post('/logout', workerAuthentification, workerLogoutController);
route.get('/profile', workerAuthentification, workerProfileController);
route.post('/update', workerAuthentification, upload.array('updateImages'), workerSubmitUpdateController);
route.get('/today-update/:projectId', workerAuthentification, workerTodayUpdateController);
route.get('/notifications', workerAuthentification, workerNotificationsController);
route.post('/notifications/read', workerAuthentification, markWorkerNotificationsReadController);
route.post('/update-self', workerAuthentification, updateWorkerSelfController);
route.post('/send-otp', workerAuthentification, sendWorkerOtpController);
route.post('/verify-change-password', workerAuthentification, verifyWorkerOtpChangePasswordController);

// Admin auth
route.post('/create', adminAuthentification, createWorkerController);
route.get('/all', adminAuthentification, getAllWorkersController);
route.post('/assign-project', adminAuthentification, assignProjectController);
route.post('/delete', adminAuthentification, deleteWorkerController);
route.get('/updates/:projectId', adminAuthentification, getWorkerUpdatesForProjectController);
route.get('/recent-images', adminAuthentification, getRecentWorkerImagesController);
route.post('/use/:updateId', adminAuthentification, useWorkerUpdateController);
route.post('/retake/:updateId', adminAuthentification, retakeWorkerUpdateController);

module.exports = route;
