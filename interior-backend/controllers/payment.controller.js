const { paymentModel } = require('../models/paymentModel');
const { projectModel } = require('../models/projectModel');
const { userModel } = require('../models/userModel');
const sendEmail = require('../utils/emailNotification');
const path = require('path');

module.exports.createPaymentPlanController = async (req, res) => {
  const { projectId, totalAmount, installments } = req.body;
  if (!projectId || !totalAmount || !Array.isArray(installments) || installments.length === 0) {
    return res.status(400).send('projectId, totalAmount and at least one installment are required');
  }

  try {
    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).send('Project not found');

    const existing = await paymentModel.findOne({ projectId });
    if (existing) return res.status(400).send('Payment plan already exists for this project');

    const plan = await paymentModel.create({ projectId, totalAmount, installments });
    const populated = await plan.populate('projectId', 'projectName');
    res.status(201).json({ plan: populated });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.getPaymentPlanController = async (req, res) => {
  const { projectId } = req.params;
  try {
    const plan = await paymentModel.findOne({ projectId }).populate('projectId', 'projectName');
    if (!plan) return res.status(404).send('No payment plan found');
    res.status(200).json({ plan });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.getAllPaymentPlansController = async (req, res) => {
  try {
    const plans = await paymentModel.find({}).populate('projectId', 'projectName');
    res.status(200).json({ plans });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.markInstallmentPaidController = async (req, res) => {
  const { planId, installmentId } = req.body;
  if (!planId || !installmentId) return res.status(400).send('planId and installmentId are required');

  try {
    const plan = await paymentModel.findById(planId);
    if (!plan) return res.status(404).send('Payment plan not found');

    const installment = plan.installments.id(installmentId);
    if (!installment) return res.status(404).send('Installment not found');

    installment.status = 'paid';
    installment.paidAt = new Date();
    await plan.save();

    const populated = await plan.populate('projectId', 'projectName');
    res.status(200).json({ plan: populated });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.updatePaymentPlanController = async (req, res) => {
  const { planId, totalAmount, installments } = req.body;
  if (!planId) return res.status(400).send('planId is required');

  try {
    const plan = await paymentModel.findById(planId);
    if (!plan) return res.status(404).send('Payment plan not found');

    plan.totalAmount = totalAmount ?? plan.totalAmount;
    plan.installments = installments ?? plan.installments;
    await plan.save();

    const populated = await plan.populate('projectId', 'projectName');
    res.status(200).json({ plan: populated });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.editInstallmentController = async (req, res) => {
  const { planId, installmentId, amount, dueDate, notes } = req.body;
  if (!planId || !installmentId) return res.status(400).send('planId and installmentId are required');

  try {
    const plan = await paymentModel.findById(planId);
    if (!plan) return res.status(404).send('Payment plan not found');

    const installment = plan.installments.id(installmentId);
    if (!installment) return res.status(404).send('Installment not found');

    if (amount !== undefined) installment.amount = parseFloat(amount);
    if (dueDate !== undefined) installment.dueDate = dueDate;
    if (notes !== undefined) installment.notes = notes;

    await plan.save();
    const populated = await plan.populate('projectId', 'projectName');
    res.status(200).json({ plan: populated });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.getDueInstallmentsController = async (req, res) => {
  try {
    const now = new Date();
    const plans = await paymentModel.find({}).populate({
      path: 'projectId',
      select: 'projectName clientId',
      populate: { path: 'clientId', select: 'name email' },
    });

    const due = [];
    plans.forEach(plan => {
      plan.installments.forEach(ins => {
        if (ins.status === 'pending' && new Date(ins.dueDate) < now) {
          due.push({
            planId: plan._id,
            installmentId: ins._id,
            amount: ins.amount,
            dueDate: ins.dueDate,
            notes: ins.notes,
            lastReminderAt: ins.lastReminderAt,
            projectName: plan.projectId?.projectName || 'Unknown',
            projectId: plan.projectId?._id,
            clientName: plan.projectId?.clientId?.name || 'Client',
            clientEmail: plan.projectId?.clientId?.email || null,
          });
        }
      });
    });

    // Sort by most overdue first
    due.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    res.status(200).json({ due });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.sendPaymentReminderController = async (req, res) => {
  const { planId, installmentId } = req.body;
  if (!planId || !installmentId) return res.status(400).send('planId and installmentId are required');

  try {
    const plan = await paymentModel.findById(planId).populate({
      path: 'projectId',
      select: 'projectName clientId',
      populate: { path: 'clientId', select: 'name email' },
    });
    if (!plan) return res.status(404).send('Payment plan not found');

    const installment = plan.installments.id(installmentId);
    if (!installment) return res.status(404).send('Installment not found');

    const client = plan.projectId?.clientId;
    if (!client?.email) return res.status(400).send('Client email not found');

    const dueDateFormatted = new Date(installment.dueDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    await sendEmail(
      {
        name: client.name,
        email: client.email,
        projectName: plan.projectId.projectName,
        amount: installment.amount.toLocaleString('en-IN'),
        dueDate: dueDateFormatted,
        notes: installment.notes || '',
        subject: `Payment Reminder – ₹${installment.amount.toLocaleString('en-IN')} Due – Tanika Associate`,
      },
      path.join(__dirname, '../views/paymentReminderEmail.ejs')
    );

    installment.lastReminderAt = new Date();
    await plan.save();

    res.status(200).json({ message: 'Reminder sent', lastReminderAt: installment.lastReminderAt });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.deletePaymentPlanController = async (req, res) => {
  const { planId } = req.body;
  if (!planId) return res.status(400).send('planId is required');

  try {
    await paymentModel.findByIdAndDelete(planId);
    res.status(200).send('Payment plan deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};
