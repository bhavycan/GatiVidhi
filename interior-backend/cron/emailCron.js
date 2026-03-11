const cron = require('node-cron');
const moment = require('moment');
const path = require('path');
const { projectModel } = require('../models/projectModel');
const isNewWeek = require('../utils/checkNewWeek');
const { reportModel } = require('../models/reportModel');
const sendEmail = require('../utils/emailNotification');
const {userModel} = require('../models/userModel');
const createReport = require('../utils/aiReportGeneration');

const emailCron = cron.schedule('0 9 * * 1', async () => {
  const allProjects = await projectModel.find({ status: "ongoing" });

  for (const project of allProjects) {
    let newweek = true;
   

    const latestReport = await reportModel
      .findOne({ projectId: project._id })
      .sort({ PublishedDate: -1 });

    if (latestReport) {
      const date = new Date(latestReport.PublishedDate);
      newweek = isNewWeek(date);
    }

    if (newweek && latestReport) {
    const reporttext = await createReport(project._id)
    const report = await reportModel.create({
      projectId: project._id,
      summary: reporttext,
      PublishedDate: new Date(),
    });
    console.log("new report generated")
      console.log(`Email should be sent for ${project.projectName}`);
      
      const user = await userModel.findById(project.clientId);
      if (!user) {
        console.warn(`No user found for project: ${project.projectName}`);
        continue;
      }

      const userDetail = {
        name: user.name,
        email: user.email,
        subject: "Your Weekly Home Makeover Report",
        date: moment().format("MMMM Do YYYY, h:mm a"),
        url: 'https://coopswing.ca/'
      };

      await sendEmail(userDetail, path.join(__dirname, '../views/reportEmail.ejs'));
    } else {
      console.log(`No email needed for ${project.projectName}`);
    }
  }
}, { scheduled: false });

module.exports = emailCron;
