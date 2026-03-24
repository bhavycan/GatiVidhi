const {projectModel} = require('../models/projectModel');
const {updateModel} = require('../models/updateModel');
const {userModel} = require('../models/userModel');
const {taskListModel} = require('../models/taskListModel');
const uploadToCloudinary = require('../utils/cloudinary.multer');

const VIDEO_MIMETYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/avi'];

module.exports.updateCreateController = async(req,res)=>{
    const {projectName , workDone, workLeft, notes, task, activeRooms, existingImages, existingVideos} = req.body;
    if(!projectName || !workDone || !workLeft || !notes) {return res.status(400).send("Invalid Entry")}

try {
    let project = await projectModel.findOne({projectName : projectName});
    if(!project) return res.status(400).send("The Project does Not exist");
    const projectId = project._id;

    const allFiles = req.files || [];
    const imageFiles = allFiles.filter(f => !VIDEO_MIMETYPES.includes(f.mimetype));
    const videoFiles = allFiles.filter(f => VIDEO_MIMETYPES.includes(f.mimetype));

    // Upload new images
    const uploadedImageUrls = await Promise.all(
        imageFiles.map(async(file)=>{
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = "data:" + file.mimetype + ";base64," + b64;
            const { secure_url } = await uploadToCloudinary(dataURI, `${projectName}_img_${Date.now()}`, 'image');
            return secure_url;
        })
    );

    // Upload new videos
    const uploadedVideoUrls = await Promise.all(
        videoFiles.map(async(file)=>{
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = "data:" + file.mimetype + ";base64," + b64;
            const { secure_url } = await uploadToCloudinary(dataURI, `${projectName}_vid_${Date.now()}`, 'video');
            return secure_url;
        })
    );

    // Merge with any pre-existing URLs (from worker updates)
    const existingUrls = existingImages
      ? (Array.isArray(existingImages) ? existingImages : [existingImages])
      : [];
    const imageUrls = [...existingUrls, ...uploadedImageUrls];

    const existingVideoUrls = existingVideos
      ? (Array.isArray(existingVideos) ? existingVideos : [existingVideos])
      : [];
    const videoUrls = [...existingVideoUrls, ...uploadedVideoUrls];

    if (imageUrls.length < 1) return res.status(400).send("At least one image is required");

    const update = await updateModel.create({
        projectId : projectId,
        workDone,
        workLeft,
        notes,
        task: task || null,
        images : imageUrls,
        videos: videoUrls,
        activeRooms: Array.isArray(activeRooms) ? activeRooms : (activeRooms ? JSON.parse(activeRooms) : [])
    })

    console.log(`[UPDATE CREATED] project: "${projectName}" | task: "${task || 'none'}" | images: ${imageUrls.length} | videos: ${uploadedVideoUrls.length} | updateId: ${update._id}`);

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

    const countMap = {};
    counts.forEach(({ _id, count }) => {
      if (_id) countMap[_id] = count;
    });

    // Use task names from the project's task list (dynamic)
    const taskList = await taskListModel.findOne({ projectId: project._id }).lean();
    const taskNames = taskList?.tasks?.map(t => t.name) || [];
    const taskCounts = taskNames.map(name => ({ name, update: countMap[name] || 0 }));

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

module.exports.updateGetAllAdminController = async (req, res) => {
  try {
    const updates = await updateModel
      .find({})
      .sort({ createdAt: -1 })
      .lean();

    const projectIds = [...new Set(updates.map(u => u.projectId.toString()))];
    const projects = await projectModel.find({ _id: { $in: projectIds } }, { projectName: 1 }).lean();
    const projectMap = {};
    projects.forEach(p => { projectMap[p._id.toString()] = p.projectName; });

    const result = updates.map(u => ({
      ...u,
      projectName: projectMap[u.projectId.toString()] || 'Unknown',
    }));

    res.status(200).json({ updates: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports.updateGetAllController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(200).json({ updates: [] });

    const project = await projectModel.findOne({ clientId: user._id }).lean();
    if (!project) return res.status(200).json({ updates: [] });

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