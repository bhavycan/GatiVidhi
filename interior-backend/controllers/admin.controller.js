const { adminModel } = require("../models/adminModel");
const { blacklistModel } = require("../models/blacklisttoken");
const { taskListModel } = require("../models/taskListModel");
const { projectModel } = require("../models/projectModel");
const { updateModel } = require("../models/updateModel");
const { commentModel } = require("../models/commentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const sendEmail = require("../utils/emailNotification");

// In-memory OTP store for admin: email -> { otp, expiresAt }
const adminOtpStore = new Map();


module.exports.adminLogInController = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[ADMIN LOGIN] Attempt - email: ${email}, origin: ${req.headers.origin}, ip: ${req.ip}`);
  if (!email | !password) {
    console.log(`[ADMIN LOGIN] Failed - missing email or password`);
    return res.status(400).send("Email and password not available");
  }

  try {
    let admin = await adminModel.findOne({ email });
    if (!admin) {
      console.log(`[ADMIN LOGIN] Failed - admin not found: ${email}`);
      return res.status(400).send("Admin does not exist");
    }
    const check = await bcrypt.compare(password, admin.password);
    if (!check) {
      console.log(`[ADMIN LOGIN] Failed - wrong password for: ${email}`);
      return res.status(400).send("Wrong Password");
    }
    const token = jwt.sign({ email: email }, process.env.ADMIN_JWT_SECRET, { expiresIn: '24h' });
    res.cookie("admintoken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    console.log(`[ADMIN LOGIN] Success - ${email}`);
    res.status(200).send("Admin Login Succesful");
  } catch (error) {
    console.error(`[ADMIN LOGIN] Error:`, error);
    res.status(500).send("Something went wrong");
  }
}

module.exports.adminLogOutController = async(req,res)=>{
    try {
            const token = req.cookies.admintoken;
            if(token) await blacklistModel.create({ token });
            res.cookie("admintoken", "", { httpOnly: true, secure: true, sameSite: "none", maxAge: 0 });
            res.status(200).send("Logged Out succesfully")
        } catch (error) {
            console.error(error);
            res.status(500).send("Something went wrong!")
        }
}

module.exports.adminForgotPasswordSendOtpController = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required");
  try {
    const admin = await adminModel.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(404).send("No admin account found with this email");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    adminOtpStore.set(admin.email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    await sendEmail(
      { name: admin.name, email: admin.email, otp, subject: "Password Reset OTP - GatiVidhi" },
      path.join(__dirname, "../views/otpEmail.ejs")
    );
    res.status(200).send("OTP sent to your email");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send OTP email. Please try again.");
  }
};

module.exports.adminForgotPasswordResetController = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).send("All fields are required");
  try {
    const admin = await adminModel.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(404).send("No admin account found with this email");
    const record = adminOtpStore.get(admin.email);
    if (!record) return res.status(400).send("No OTP requested. Please request a new one.");
    if (Date.now() > record.expiresAt) {
      adminOtpStore.delete(admin.email);
      return res.status(400).send("OTP has expired. Please request a new one.");
    }
    if (record.otp !== otp.toString()) return res.status(400).send("Invalid OTP");
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();
    adminOtpStore.delete(admin.email);
    res.status(200).send("Password reset successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.adminProfileInfoController = async (req, res) => {
  try {
    const admin = await adminModel.findOne({ email: req.admin.email }).select("-password").lean();
    if (!admin) return res.status(404).send("Admin not found");
    res.status(200).json({ admin });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.updateAdminSelfController = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send("Name is required");
  try {
    const admin = await adminModel.findOne({ email: req.admin.email });
    if (!admin) return res.status(404).send("Admin not found");
    admin.name = name;
    await admin.save();
    res.status(200).json({ message: "Profile updated", admin: { name: admin.name, email: admin.email } });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.sendAdminOtpController = async (req, res) => {
  try {
    const admin = await adminModel.findOne({ email: req.admin.email });
    if (!admin) return res.status(404).send("Admin not found");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    adminOtpStore.set(admin.email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    sendEmail(
      { name: admin.name, email: admin.email, otp, subject: "Your Password Change OTP - GatiVidhi" },
      path.join(__dirname, "../views/otpEmail.ejs")
    );
    res.status(200).send("OTP sent to your email");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.verifyAdminOtpChangePasswordController = async (req, res) => {
  const { otp, newPassword } = req.body;
  if (!otp || !newPassword) return res.status(400).send("OTP and new password are required");
  try {
    const admin = await adminModel.findOne({ email: req.admin.email });
    if (!admin) return res.status(404).send("Admin not found");
    const record = adminOtpStore.get(admin.email);
    if (!record) return res.status(400).send("No OTP requested. Please request a new one.");
    if (Date.now() > record.expiresAt) {
      adminOtpStore.delete(admin.email);
      return res.status(400).send("OTP has expired. Please request a new one.");
    }
    if (record.otp !== otp.toString()) return res.status(400).send("Invalid OTP");
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();
    adminOtpStore.delete(admin.email);
    res.status(200).send("Password changed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.adminNotificationsController = async (req, res) => {
  try {
    const now = new Date();
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
    const notifications = [];

    // 1. Overdue tasks — date is set, date <= now, status !== 'completed'
    const taskLists = await taskListModel
      .find()
      .populate('projectId', 'projectName status');

    taskLists.forEach(list => {
      if (!list.projectId || list.projectId.status !== 'ongoing') return;
      list.tasks.forEach(task => {
        if (task.date && new Date(task.date) <= now && task.status !== 'completed') {
          notifications.push({
            type: 'task',
            message: `"${task.name}" is overdue`,
            projectName: list.projectId.projectName,
            projectId: list.projectId._id,
            date: task.date,
          });
        }
      });
    });

    // 2. Ongoing projects with no update in the last 2 days
    const ongoingProjects = await projectModel
      .find({ status: 'ongoing' })
      .select('_id projectName');

    for (const project of ongoingProjects) {
      const recentUpdate = await updateModel.findOne({
        projectId: project._id,
        createdAt: { $gte: twoDaysAgo },
      });
      if (!recentUpdate) {
        notifications.push({
          type: 'update',
          message: 'No update posted in the last 2 days',
          projectName: project.projectName,
          projectId: project._id,
        });
      }
    }

    // 3. Unresolved tickets
    const openTickets = await commentModel
      .find({ resolved: false })
      .populate('projectId', 'projectName')
      .sort({ receivedDate: -1 });

    openTickets.forEach(t => {
      notifications.push({
        type: 'ticket',
        message: t.note.length > 60 ? t.note.slice(0, 60) + '…' : t.note,
        projectName: t.projectId?.projectName || 'Unknown',
        projectId: t.projectId?._id,
        ticketId: t._id,
        priority: t.priorityLevel,
        date: t.receivedDate,
      });
    });

    return res.status(200).json({ notifications, count: notifications.length });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};
