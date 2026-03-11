const {updateModel} = require('../models/updateModel');
const {userModel} = require('../models/userModel');
const {projectModel} = require('../models/projectModel');
const {generateReport} = require('../config/gemini');
const {reportModel} = require('../models/reportModel');
const isNewWeek = require('../utils/checkNewWeek');




const createReport = async(id)=>{
    let newweek = true;
    let date = new Date()
  
    const latestReport = await reportModel
      .findOne({ projectId: id })
      .sort({ PublishedDate: -1 })
      .limit(1);

    if (latestReport) {
      date = new Date(latestReport.PublishedDate);
      newweek = isNewWeek(date);
    }

    if (!newweek) return console.log("newweek function is not available")

    const updates = await updateModel.find({ projectId: id,  createdAt: { $gt: date }  });
    if (!updates || updates.length === 0)
      return console.log("No updates found for this project");

    const project = await projectModel.findById(id);
    if (!project) console.log("Project does not exist");

    const client = await userModel.findById(project.clientId);
    if (!client) console.log("Client does not exist");

    const reportObject = {
      updates,
      projectName: project.projectName,

      description: project.description,
      clientName: client.name,
    };

    const reporttext = await generateReport(reportObject);
    if (!reporttext) return console.log("Failed to generate report text");

    return reporttext

}


module.exports = createReport