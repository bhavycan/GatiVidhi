const path = require('path')
const cloudinary = require('cloudinary').v2;
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

    const welcomeUpdate = await updateModel.create({
      projectId: project._id,
      workDone: "Welcome to Tanika Interior Design! Your project has been officially registered and our team is all set to begin. We have completed the initial site assessment and measurements, reviewed your design brief, and assigned a dedicated project manager who will oversee every stage of your transformation.",
      workLeft: "Our design team is now preparing your personalised concept board, material palette, and 3D layout plan. Once approved, we will begin procurement and scheduling so work can commence at the earliest without any delays.",
      notes: "This is your very first progress update — a small beginning to what will be a beautiful journey! You will receive detailed daily updates here as your project moves forward, complete with photos and task-wise breakdowns. We are excited to bring your vision to life. Welcome aboard!",
      images: [
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80",
      ],
    })

    project.updates.push(welcomeUpdate._id)
    await project.save()

    const user = {
      name : client.name,
      email : client.email,
      subject : "Welcome to Tanika Interior Design"
    }

    await sendEmail(user,path.join(__dirname,'../views/welcomeEmail.ejs'))



    res.status(200).send(project);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong!");
  }
};

module.exports.projectUpdateController = async (req, res) => {
const { estimatedEndDate, projectName, description, status } = req.body;
  const id = req.body.id;

  try {
    let project = await projectModel.findOne({ _id: id });
  if (!project) return res.status(400).send("Project does not exist");

  const updateFields = {};
  if (estimatedEndDate) updateFields.estimatedEndDate = estimatedEndDate;
  if (projectName) updateFields.projectName = projectName;
  if (description) updateFields.description = description;
  if (status) updateFields.status = status;

  project = await projectModel.findOneAndUpdate(
    { _id: id },
    updateFields,
    {new : true}
  );

  res.status(200).json({ message: 'Updated successfully', project })
  } catch (error) {
    console.error(error)
    return res.status(500).send("Something went wrong")
  }

};


module.exports.projectGetAllController = async (req, res) => {
  try {
    const projects = await projectModel.find({}).populate('clientId', 'name email phone').lean();
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
    if (!user) return res.status(200).json({ notifications: [] });

    const project = await projectModel.findOne({ clientId: user._id }, { notifications: 1 }).lean();
    if (!project) return res.status(200).json({ notifications: [] });

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


// Stream a buffer directly to Cloudinary — avoids base64 size inflation
const uploadBufferToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });

module.exports.projectAdditionalInfoController = async (req, res) => {
  const { projectId, squareFeet, totalRooms } = req.body;
  if (!projectId || !squareFeet || !totalRooms) return res.status(400).send('Incomplete entries');

  try {
    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).send('Project not found');

    const updateFields = { squareFeet: Number(squareFeet), totalRooms: Number(totalRooms) };

    // Handle PDF upload
    const pdfFile = req.files?.designPdf?.[0];
    if (pdfFile) {
      const result = await uploadBufferToCloudinary(pdfFile.buffer, {
        public_id: `design_pdf_${projectId}`,
        resource_type: 'raw',
      });
      updateFields.designPdfUrl = result.secure_url;
    }

    // Handle GLB upload
    const glbFile = req.files?.designGlb?.[0];
    if (glbFile) {
      const result = await uploadBufferToCloudinary(glbFile.buffer, {
        public_id: `design_glb_${projectId}`,
        resource_type: 'raw',
        format: 'glb',
      });
      updateFields.modelGlbUrl = result.secure_url;
    }

    await projectModel.findByIdAndUpdate(projectId, updateFields);
    res.status(200).send('Additional info saved');
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
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
