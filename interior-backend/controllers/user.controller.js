const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/userModel");
const { validateUser } = require("../models/userModel");
const sendEmail = require("../utils/emailNotification");
const path = require('path');
const generatePassword = require("../utils/passwordGenerator");
const { blacklistModel } = require("../models/blacklisttoken");
const {projectModel} = require("../models/projectModel");
const {reportModel} = require("../models/reportModel");
const {updateModel} = require("../models/updateModel");
const {taskListModel} = require("../models/taskListModel");
const {commentModel} = require("../models/commentModel");
const {designModel} = require("../models/designModel");

// In-memory OTP store: email -> { otp, expiresAt }
const otpStore = new Map();

module.exports.userCreateController = async (req, res) => {
  const { name, email, phone } = req.body;
  const password = generatePassword()
  const { error } = validateUser({ name, email, password, phone });
  if (error) return res.status(400).send("Invalide entry");


  try {
    let user = await userModel.findOne({ email });
    if (user) return res.status(400).send("User already existing");
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    user = await userModel.create({
      name,
      email,
      phone,
      password: encryptedPassword,
    });



    const client= {
      name : user.name,
      email : user.email,
      password : password,
      subject: "Your Login Credentials For the Tanika Associate"
    }

    sendEmail(client, path.join(__dirname,"../views/credentialEmail.ejs"))

    res.status(201).send(user);
  } catch (error) {
    console.error(error)
    res.status(500).send("Something went Wrong");
  }
};


module.exports.userChangePassword = async(req,res)=>{
  const {email, OldPassword, NewPassword} = req.body;
  try {
    let user = await userModel.findOne({email : email})
  if(!user) return res.status(400).send("Email Does Not Exist");
  const check = await bcrypt.compare(OldPassword,user.password)
  if(!check) return res.status(400).send("Invalid Temp Password");
  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(NewPassword,salt);
  user.password = encryptedPassword;
  await user.save()
  res.status(200).send("User Password Changed!")
  } catch (error) {
    console.error("Error" + error);
    res.status(500).send("Something went wrong!")
  }

  
}


module.exports.userLogInController = async(req,res)=>{
    try {
        const {email,password} = req.body;
        console.log(`[LOGIN] Attempt - email: ${email}, origin: ${req.headers.origin}, ip: ${req.ip}`);
        let user = await userModel.findOne({email});
        if(!user){
            console.log(`[LOGIN] Failed - user not found: ${email}`);
            return res.status(400).send("User does not exist");
        }
        let checkPassword = await bcrypt.compare(password,user.password);
        if(!checkPassword){
            console.log(`[LOGIN] Failed - wrong password for: ${email}`);
            return res.status(400).send("Wrong Password");
        }
        const token = jwt.sign({email: email}, process.env.USER_JWT_SECRET, { expiresIn: '24h' });
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
        });
        console.log(`[LOGIN] Success - ${email}`);
        return res.status(200).send("Logged in Succesfully!!");
    } catch (error) {
        console.error(`[LOGIN] Error:`, error);
        res.status(500).send('Something went wrong')
    }
}


module.exports.userLogOutController = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) await blacklistModel.create({ token });
    res.cookie("token", "", { httpOnly: true, secure: true, sameSite: "none", maxAge: 0 });
    res.status(200).send("Logged out successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};


module.exports.userUpdateController = async (req, res) => {
  const { id, name, phone } = req.body;
  if (!id || !name || !phone) return res.status(400).send('Incomplete entries');
  try {
    const user = await userModel.findById(id);
    if (!user) return res.status(404).send('Client not found');
    user.name = name;
    user.phone = phone;
    await user.save();
    res.status(200).json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};

module.exports.userDeleteController = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send('Client ID is required');
  try {
    const user = await userModel.findById(id);
    if (!user) return res.status(404).send('Client not found');

    // Find the client's project
    const project = await projectModel.findOne({ clientId: id });

    if (project) {
      const projectId = project._id;
      // Delete all related data
      await updateModel.deleteMany({ projectId });
      await reportModel.deleteMany({ projectId });
      await taskListModel.deleteMany({ projectId });
      await commentModel.deleteMany({ projectId });
      await designModel.deleteMany({ projectId });
      await projectModel.deleteOne({ _id: projectId });
    }

    await userModel.deleteOne({ _id: id });

    res.status(200).send('Client and all related data deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};

module.exports.userGetAllController = async (req, res) => {
  try {
    const users = await userModel.find({}).select('-password').sort({ _id: -1 }).lean();
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports.forgotPasswordSendOtpController = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required");
  try {
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).send("No account found with this email");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(user.email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    sendEmail(
      { name: user.name, email: user.email, otp, subject: "Password Reset OTP - GatiVidhi" },
      path.join(__dirname, "../views/otpEmail.ejs")
    );
    res.status(200).send("OTP sent to your email");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.forgotPasswordResetController = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).send("All fields are required");
  try {
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).send("No account found with this email");
    const record = otpStore.get(user.email);
    if (!record) return res.status(400).send("No OTP requested. Please request a new one.");
    if (Date.now() > record.expiresAt) {
      otpStore.delete(user.email);
      return res.status(400).send("OTP has expired. Please request a new one.");
    }
    if (record.otp !== otp.toString()) return res.status(400).send("Invalid OTP");
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    otpStore.delete(user.email);
    res.status(200).send("Password reset successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.sendOtpController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).send("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(user.email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    const client = {
      name: user.name,
      email: user.email,
      otp,
      subject: "Your Password Change OTP - GatiVidhi",
    };
    sendEmail(client, path.join(__dirname, "../views/otpEmail.ejs"));

    res.status(200).send("OTP sent to your email");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.verifyOtpChangePasswordController = async (req, res) => {
  const { otp, newPassword } = req.body;
  if (!otp || !newPassword) return res.status(400).send("OTP and new password are required");
  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).send("User not found");

    const record = otpStore.get(user.email);
    if (!record) return res.status(400).send("No OTP requested. Please request a new one.");
    if (Date.now() > record.expiresAt) {
      otpStore.delete(user.email);
      return res.status(400).send("OTP has expired. Please request a new one.");
    }
    if (record.otp !== otp.toString()) return res.status(400).send("Invalid OTP");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    otpStore.delete(user.email);

    res.status(200).send("Password changed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.updateSelfController = async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).send("Name and phone are required");
  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).send("User not found");
    user.name = name;
    user.phone = phone;
    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user: { name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.userProfileController = async (req, res) => {
  try {
    const user = await userModel
      .findOne({ email: req.user.email })
      .select("-password")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    const project = await projectModel
      .findOne({ clientId: user._id })
      .lean();

    // Latest report (sorted by date descending)
    const report = project
      ? await reportModel.findOne({ projectId: project._id }).sort({ PublishedDate: -1 }).lean()
      : null;

    // Last update document (last ID in the updates array)
    let lastUpdate = null;
    if (project && project.updates && project.updates.length > 0) {
      const lastUpdateId = project.updates[project.updates.length - 1];
      lastUpdate = await updateModel.findById(lastUpdateId).lean();
    }

    res.status(200).json({ user, project, lastUpdate, report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load profile from backend" });
  }
};
