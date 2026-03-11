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
        let user = await userModel.findOne({email});
        if(!user) return res.status(400).send("User does not exist");
        let checkPassword = await bcrypt.compare(password,user.password);
        if(!checkPassword) return res.status(400).send("Wrong Password");
        const token = jwt.sign({email: email}, process.env.USER_JWT_SECRET);
        res.cookie("token",token,{ httpOnly: true,
    secure: true, 
    sameSite: 'Strict',maxAge: 24 * 60 * 60 * 1000,});
        return res.status(200).send("Logged in Succesfully!!");
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong')
    }
}


module.exports.userLogOutController = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await userModel.findById(id);

    if (!user) return res.status(400).send("Invalid ID");

    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(400).send("Token missing");

    const token = authHeader.split(" ")[1];

  
    await blacklistModel.create({ token });

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.status(200).send("Logged out successfully");
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
