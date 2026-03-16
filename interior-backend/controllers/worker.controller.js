const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { workerModel } = require('../models/workerModel');
const { projectModel } = require('../models/projectModel');
const generatePassword = require('../utils/passwordGenerator');
const sendEmail = require('../utils/emailNotification');

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
    const token = jwt.sign({ email: worker.email, id: worker._id }, secret);
    res.cookie('workertoken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
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
