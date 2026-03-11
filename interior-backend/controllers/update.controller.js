const {projectModel} = require('../models/projectModel');
const {updateModel} = require('../models/updateModel');
const {userModel} = require('../models/userModel');
const uploadImage = require('../utils/cloudinary.multer');


module.exports.updateCreateController = async(req,res)=>{
    const {projectName , workDone, workLeft, notes} = req.body;
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
        images : imageUrls
    })


    project.updates.push(update._id);
    await project.save();
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