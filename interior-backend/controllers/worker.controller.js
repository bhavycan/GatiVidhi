const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { workerModel } = require('../models/workerModel');
const { workerUpdateModel } = require('../models/workerUpdateModel');
const { blacklistModel } = require('../models/blacklisttoken');
const { projectModel } = require('../models/projectModel');
const uploadImage = require('../utils/cloudinary.multer');
const generatePassword = require('../utils/passwordGenerator');
const sendEmail = require('../utils/emailNotification');

// In-memory OTP store for workers: email -> { otp, expiresAt }
const workerOtpStore = new Map();

module.exports.createWorkerController = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).send('Name and email are required');

  try {
    const existing = await workerModel.findOne({ email });
    if (existing) return res.status(400).send('Worker with this email already exists');

    const password = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const worker = await workerModel.create({
      name,
      email,
      password: encryptedPassword,
      adminId: req.admin.email,
    });

    sendEmail(
      { name: worker.name, email: worker.email, password, subject: 'Your Worker Login Credentials — Tanika Associate' },
      path.join(__dirname, '../views/credentialEmail.ejs')
    );

    res.status(201).send(worker);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.getAllWorkersController = async (req, res) => {
  try {
    const workers = await workerModel
      .find({})
      .populate('assignedProjectId', 'projectName status')
      .populate('assignedClientId', 'name');
    res.status(200).send({ workers });
  } catch (err) {
    res.status(500).send('Something went wrong');
  }
};

module.exports.assignProjectController = async (req, res) => {
  const { workerId, projectId } = req.body;
  if (!workerId || !projectId) return res.status(400).send('workerId and projectId are required');

  try {
    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).send('Project not found');

    const worker = await workerModel.findByIdAndUpdate(
      workerId,
      { assignedProjectId: projectId, assignedClientId: project.clientId },
      { new: true }
    ).populate('assignedProjectId', 'projectName status');

    if (!worker) return res.status(404).send('Worker not found');

    res.status(200).send({ worker });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.deleteWorkerController = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send('Worker id is required');

  try {
    await workerModel.findByIdAndDelete(id);
    res.status(200).send('Worker deleted');
  } catch (err) {
    res.status(500).send('Something went wrong');
  }
};

module.exports.workerLoginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('Email and password are required');

  try {
    const worker = await workerModel.findOne({ email: email.toLowerCase() });
    if (!worker) return res.status(400).send('Worker does not exist');

    const isMatch = await bcrypt.compare(password, worker.password);
    if (!isMatch) return res.status(400).send('Wrong password');

    const secret = process.env.WORKER_JWT_SECRET || 'workerxsecretkey99';
    const token = jwt.sign({ email: worker.email, id: worker._id }, secret, { expiresIn: '24h' });
    res.cookie('workertoken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).send('Logged in successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.workerProfileController = async (req, res) => {
  try {
    const worker = await workerModel
      .findOne({ email: req.worker.email })
      .populate('assignedProjectId', 'projectName status estimatedEndDate startDate')
      .populate('assignedClientId', 'name');

    if (!worker) return res.status(404).send('Worker not found');

    const projects = worker.assignedProjectId ? [worker.assignedProjectId] : [];

    res.status(200).send({ worker, projects });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

// Worker submits an update (images + notes) for a project
module.exports.workerSubmitUpdateController = async (req, res) => {
  const { projectId, notes } = req.body;
  if (!projectId) return res.status(400).send('projectId is required');

  try {
    const worker = await workerModel.findOne({ email: req.worker.email });
    if (!worker) return res.status(404).send('Worker not found');

    const imageUrls = await Promise.all(
      (req.files || []).map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
        const { secure_url } = await uploadImage(dataURI, `worker_${worker._id}_${Date.now()}`);
        return secure_url;
      })
    );

    const update = await workerUpdateModel.create({
      workerId: worker._id,
      projectId,
      notes: notes || '',
      updateImages: imageUrls,
    });

    res.status(201).json({ update });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

// Worker fetches today's update for a project
module.exports.workerTodayUpdateController = async (req, res) => {
  const { projectId } = req.params;
  try {
    const worker = await workerModel.findOne({ email: req.worker.email });
    if (!worker) return res.status(404).send('Worker not found');

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const update = await workerUpdateModel.findOne({
      workerId: worker._id,
      projectId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.status(200).json({ update: update || null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

// Admin fetches all worker updates for a project from the last 24 hours
module.exports.getWorkerUpdatesForProjectController = async (req, res) => {
  const { projectId } = req.params;
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const updates = await workerUpdateModel
      .find({ projectId, date: { $gte: since } })
      .populate('workerId', 'name email')
      .sort({ date: -1 });

    res.status(200).json({ updates });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

// Admin marks a worker update as "used"
module.exports.useWorkerUpdateController = async (req, res) => {
  const { updateId } = req.params;
  try {
    const update = await workerUpdateModel.findByIdAndUpdate(
      updateId,
      { status: 'used' },
      { new: true }
    );
    if (!update) return res.status(404).send('Update not found');
    res.status(200).json({ update });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

// Admin requests a retake — marks update and notifies worker
module.exports.retakeWorkerUpdateController = async (req, res) => {
  const { updateId } = req.params;
  try {
    const update = await workerUpdateModel.findByIdAndUpdate(
      updateId,
      { status: 'retake' },
      { new: true }
    ).populate('workerId');

    if (!update) return res.status(404).send('Update not found');

    await workerModel.findByIdAndUpdate(update.workerId._id, {
      $push: {
        notifications: {
          message: 'Admin has requested a retake for your latest update. Please re-upload the photos.',
        },
      },
    });

    res.status(200).json({ update });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

// Worker fetches their notifications
module.exports.workerNotificationsController = async (req, res) => {
  try {
    const worker = await workerModel.findOne({ email: req.worker.email }).select('notifications');
    if (!worker) return res.status(404).send('Worker not found');
    res.status(200).json({ notifications: worker.notifications });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

// Worker marks all notifications as read
module.exports.markWorkerNotificationsReadController = async (req, res) => {
  try {
    await workerModel.updateOne(
      { email: req.worker.email },
      { $set: { 'notifications.$[].read': true } }
    );
    res.status(200).send('Marked as read');
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.workerForgotPasswordSendOtpController = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required");
  try {
    const worker = await workerModel.findOne({ email: email.toLowerCase() });
    if (!worker) return res.status(404).send("No worker account found with this email");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    workerOtpStore.set(worker.email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    await sendEmail(
      { name: worker.name, email: worker.email, otp, subject: "Password Reset OTP - GatiVidhi" },
      path.join(__dirname, "../views/otpEmail.ejs")
    );
    res.status(200).send("OTP sent to your email");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send OTP email. Please try again.");
  }
};

module.exports.workerForgotPasswordResetController = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).send("All fields are required");
  try {
    const worker = await workerModel.findOne({ email: email.toLowerCase() });
    if (!worker) return res.status(404).send("No worker account found with this email");
    const record = workerOtpStore.get(worker.email);
    if (!record) return res.status(400).send("No OTP requested. Please request a new one.");
    if (Date.now() > record.expiresAt) {
      workerOtpStore.delete(worker.email);
      return res.status(400).send("OTP has expired. Please request a new one.");
    }
    if (record.otp !== otp.toString()) return res.status(400).send("Invalid OTP");
    const salt = await bcrypt.genSalt(10);
    worker.password = await bcrypt.hash(newPassword, salt);
    await worker.save();
    workerOtpStore.delete(worker.email);
    res.status(200).send("Password reset successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

module.exports.updateWorkerSelfController = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send("Name is required");
  try {
    const worker = await workerModel.findOne({ email: req.worker.email });
    if (!worker) return res.status(404).send("Worker not found");
    worker.name = name;
    await worker.save();
    res.status(200).json({ message: "Profile updated", worker: { name: worker.name, email: worker.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

module.exports.sendWorkerOtpController = async (req, res) => {
  try {
    const worker = await workerModel.findOne({ email: req.worker.email });
    if (!worker) return res.status(404).send("Worker not found");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    workerOtpStore.set(worker.email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    await sendEmail(
      { name: worker.name, email: worker.email, otp, subject: "Your Password Change OTP - GatiVidhi" },
      path.join(__dirname, "../views/otpEmail.ejs")
    );
    res.status(200).send("OTP sent to your email");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send OTP email. Please try again.");
  }
};

module.exports.verifyWorkerOtpChangePasswordController = async (req, res) => {
  const { otp, newPassword } = req.body;
  if (!otp || !newPassword) return res.status(400).send("OTP and new password are required");
  try {
    const worker = await workerModel.findOne({ email: req.worker.email });
    if (!worker) return res.status(404).send("Worker not found");
    const record = workerOtpStore.get(worker.email);
    if (!record) return res.status(400).send("No OTP requested. Please request a new one.");
    if (Date.now() > record.expiresAt) {
      workerOtpStore.delete(worker.email);
      return res.status(400).send("OTP has expired. Please request a new one.");
    }
    if (record.otp !== otp.toString()) return res.status(400).send("Invalid OTP");
    const salt = await bcrypt.genSalt(10);
    worker.password = await bcrypt.hash(newPassword, salt);
    await worker.save();
    workerOtpStore.delete(worker.email);
    res.status(200).send("Password changed successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

module.exports.workerLogoutController = async (req, res) => {
  try {
    const token = req.cookies.workertoken;
    if (token) await blacklistModel.create({ token });
    res.cookie('workertoken', '', { httpOnly: true, secure: true, sameSite: 'none', maxAge: 0 });
    res.status(200).send('Logged out successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};
