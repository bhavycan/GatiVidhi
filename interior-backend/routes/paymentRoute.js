const express = require('express');
const {
  createPaymentPlanController,
  getPaymentPlanController,
  getAllPaymentPlansController,
  markInstallmentPaidController,
  updatePaymentPlanController,
  deletePaymentPlanController,
  editInstallmentController,
  getDueInstallmentsController,
  sendPaymentReminderController,
  addSpendingController,
  getSpendingsController,
  deleteSpendingController,
} = require('../controllers/payment.controller');
const adminAuthentification = require('../middlewares/adminAuthentification');
const route = express.Router();

route.get('/all', adminAuthentification, getAllPaymentPlansController);
route.get('/due', adminAuthentification, getDueInstallmentsController);
route.get('/project/:projectId', adminAuthentification, getPaymentPlanController);
route.post('/create', adminAuthentification, createPaymentPlanController);
route.post('/mark-paid', adminAuthentification, markInstallmentPaidController);
route.post('/update', adminAuthentification, updatePaymentPlanController);
route.post('/delete', adminAuthentification, deletePaymentPlanController);
route.post('/edit-installment', adminAuthentification, editInstallmentController);
route.post('/send-reminder', adminAuthentification, sendPaymentReminderController);

// Spending
route.get('/spendings', adminAuthentification, getSpendingsController);
route.post('/spending', adminAuthentification, addSpendingController);
route.delete('/spending/:id', adminAuthentification, deleteSpendingController);

module.exports = route;
