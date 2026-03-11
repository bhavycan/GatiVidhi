const {projectModel} = require("../models/projectModel");
const uploadImage = require("../utils/cloudinary.multer");
const {designModel} = require("../models/designModel");



module.exports.designCreateController = async (req, res) => {
  const { projectName } = req.body;

    try {
        let project = await projectModel.findOne({ projectName: projectName });
  if (!project) return res.status(400).send("project doesnt exist");
  if (!req.files) return res.status(400).send("Image is not available");
  const projectId = project._id;

  const imageUrls = await Promise.all(
    req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      let dataURI = "data:" + file.mimetype + ";base64," + b64;
      const { secure_url } = await uploadImage(dataURI, projectName);
      return secure_url;
    })
  );

  const design = await designModel.create({
    projectId: projectId,
    images :imageUrls
  })

  res.status(200).send("design succesfully uploades " + design)
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong")
    }



  

}


module.exports.designDeleteController = async(req,res)=>{
 const {id} = req.body;
    try {
        
    let design = await designModel.findOne({_id: id});
    if(!design) return res.status(400).send("Design does not exist");
    await designModel.deleteOne({_id: id});
    res.status(200).send("Design deleted!")
    } catch (error) {
        console.error(error)
        res.status(500).send("Something went wrong")
    }

   

}