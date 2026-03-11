const path = require('path')
const { projectModel } = require("../models/projectModel");
const {reportModel} = require("../models/reportModel");
const { updateModel } = require("../models/updateModel");
const { userModel } = require("../models/userModel");
const sendEmail = require("../utils/emailNotification");

module.exports.projectCreateController = async (req, res) => {
  //clientId will be email of client/user
  const {
    projectName,
    description,
    clientEmail,

    estimatedEndDate,
    paymentRecords,
  } = req.body;
  if (!projectName || !clientEmail || !estimatedEndDate || !description)
    return res.status(400).send("Incomplete Entries ");

  try {
    let project = await projectModel.findOne({
      projectName,
    });
    if (project) return res.status(400).send("Project ALready exist");
    let client = await userModel.findOne({ email: clientEmail });
    console.log(client);
    if (!client) return res.status(400).send("Client Does not exist");
    const id = client._id;
    project = await projectModel.create({
      projectName,
      startDate: Date(),
      estimatedEndDate,
      description,
      paymentRecords,
      clientId: id,
    });

    const report = await reportModel.create({
      projectId : project._id,
      summary : "welcome report",

    })

    const user = {
      name : client.name,
      email : client.email,
      subject : "Welcome to Tanika Interior Design"
    }

    await sendEmail(user,path.join(__dirname,'../views/welcomeEmail.ejs'))



    res.status(200).send(project,report);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong!");
  }
};

module.exports.projectUpdateController = async (req, res) => {
const { estimatedEndDate, projectName, description} = req.body;
  const id = req.body.id;
  
  try {
    let project = await projectModel.findOne({ _id: id });
  if (!project) return res.status(400).send("Project does not exist");
  project = await projectModel.findOneAndUpdate(
    { _id: id },
    {
      estimatedEndDate: estimatedEndDate,
      projectName,
      description
    },
    {new : true}
  );

  await project.save();
  res.status(200).send("Updated succesfully" + project)
  } catch (error) {
    console.error(error)
    return res.status(500).send("Something went wrong")
  }
  
};


module.exports.projectGetAllController = async (req, res) => {
  try {
    const projects = await projectModel.find({}, { projectName: 1, status: 1 }).lean();
    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports.projectDeleteController = async (req,res)=>{
const id = req.body.id;
  try {


  let project = await projectModel.findOne({_id : id});
  if(!project) return res.status(400).send("Project does not exist");
  project = await projectModel.deleteOne({_id: id});

  await updateModel.deleteMany({projectId : id})
  res.status(200).send("Project deleted succesfully")
  } catch (error) {
    console.error("error" + error)
    res.status(500).send("Something went wrong")
  }

}

module.exports.getNotificationsController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).send("User not found");

    const project = await projectModel.findOne({ clientId: user._id }, { notifications: 1 }).lean();
    if (!project) return res.status(404).send("No project found");

    const notifications = [...(project.notifications || [])].reverse();
    res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

module.exports.clearNotificationsController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).send("User not found");

    await projectModel.updateOne({ clientId: user._id }, { $set: { notifications: [] } });
    res.status(200).send("Notifications cleared");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};


module.exports.DeleteNotificationsController = async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).send("User not found");

    const project = await projectModel.findOne({ clientId: user._id });
    if (!project) return res.status(404).send("Project not found");

    // remove notification at index
    project.notifications.splice(index, 1);

    await project.save();

    res.status(200).send("Notification deleted");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
