const {projectModel} = require('../models/projectModel');
const {updateModel} = require('../models/updateModel');
const {userModel} = require('../models/userModel');
const {taskListModel} = require('../models/taskListModel');
const uploadImage = require('../utils/cloudinary.multer');


module.exports.updateCreateController = async(req,res)=>{
    const {projectName , workDone, workLeft, notes, task} = req.body;
    if(!projectName || !workDone || !workLeft || !notes) {return res.status(400).send("Invalid Entry")}
    const images = req.files
    if(!images) return res.status(400).send("Image Does not exist")


try {
    let project = await projectModel.findOne({projectName : projectName});
    if(!project) return res.status(400).send("The Project does Not exist");
    const projectId = project._id;

    const imageUrls = await Promise.all(
        req.files.map(async(file)=>{
            const b64 = Buffer.from(file.buffer).toString("base64");
          let dataURI = "data:" + file.mimetype + ";base64," + b64;
           const { secure_url } = await uploadImage(dataURI, projectName);
        return secure_url;
        })
    )

    const update = await updateModel.create({
        projectId : projectId,
        workDone,
        workLeft,
        notes,
        task: task || null,
        images : imageUrls
    })

    project.updates.push(update._id);
    await project.save();

    await projectModel.updateOne(
      { _id: projectId },
      { $push: { notifications: { type: 'update', message: `New daily update has been posted for your project` } } }
    );

    await taskListModel.updateOne(
        { projectId: projectId },
        { $inc: { updateNumber: 1 } }
    );

    res.status(200).send(update)
    
} catch (error) {
    console.error(error)
    res.status(500).send("Something Went Wrong")
}


    
}


module.exports.updateDeleteController = async(req,res)=>{
    const {id} = req.body;

try {
    let update = await updateModel.findOne({_id: id})
    if(!update) return res.status(400).send("Update does not exist")
    await updateModel.deleteOne({_id : id});

    let project = await projectModel.findOne({_id : update.projectId});
    if(!project) return res.status(400).send("Associated Project Does not exist!")
    project.updates =  project.updates.filter((update) => {
        return update.toString() !== id.toString()
 })
    await project.save()

    
    res.status(200).send("Update Deleted Succesfully");
} catch (error) {
    console.error(error)
    res.status(500).send("Something went wrong")
}

}


module.exports.updateTaskCountsController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const project = await projectModel.findOne({ clientId: user._id }).lean();
    if (!project) return res.status(404).json({ message: "No project found" });

    const counts = await updateModel.aggregate([
      { $match: { projectId: project._id } },
      { $group: { _id: "$task", count: { $sum: 1 } } }
    ]);

    // Build a map from task name -> count
    const countMap = {};
    counts.forEach(({ _id, count }) => {
      if (_id) countMap[_id] = count;
    });

    const TASKS = ['Layout', 'PopChannel', 'Electrification', 'Ceiling', 'Furniture', 'Laminate', 'Paint', 'Lights', 'Cleaning', 'HandOver'];
    const taskCounts = TASKS.map(name => ({ name, update: countMap[name] || 0 }));

    res.status(200).json({ taskCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports.updateDueTodayController = async (req, res) => {
  try {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const ongoingProjects = await projectModel.find({ status: 'ongoing' }).lean()
    if (!ongoingProjects.length) return res.status(200).json([])

    const projectIds = ongoingProjects.map(p => p._id)

    // Find project IDs that already have an update submitted today
    const updatedTodayIds = await updateModel
      .find({ projectId: { $in: projectIds }, createdAt: { $gte: startOfDay } })
      .distinct('projectId')

    const updatedSet = new Set(updatedTodayIds.map(id => id.toString()))

    const dueProjects = ongoingProjects.filter(p => !updatedSet.has(p._id.toString()))

    const result = await Promise.all(
      dueProjects.map(async (p) => {
        const last = await updateModel
          .findOne({ projectId: p._id })
          .sort({ createdAt: -1 })
          .select('createdAt')
          .lean()
        return {
          projectId: p._id,
          projectName: p.projectName,
          lastUpdate: last?.createdAt || null,
        }
      })
    )

    res.status(200).json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

module.exports.updateGetAllController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const project = await projectModel.findOne({ clientId: user._id }).lean();
    if (!project) return res.status(404).json({ message: "No project found" });

    const updates = await updateModel
      .find({ projectId: project._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ updates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};