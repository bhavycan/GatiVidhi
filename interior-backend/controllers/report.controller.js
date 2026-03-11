
const {reportModel} = require('../models/reportModel');
const {projectModel} = require('../models/projectModel');
const {userModel} = require('../models/userModel');
const createReport = require('../utils/aiReportGeneration')


module.exports.reportGetAllController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const project = await projectModel.findOne({ clientId: user._id }).lean();
    if (!project) return res.status(404).json({ message: "No project found" });

    const reports = await reportModel
      .find({ projectId: project._id })
      .sort({ PublishedDate: -1 })
      .lean();

    res.status(200).json({ reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports.reportCreateController = async (req, res) => {
  const id = req.params.id;
  try{
    const reporttext = await createReport(id)
    const report = await reportModel.create({
      projectId: id,
      summary: reporttext,
      PublishedDate: new Date(),
    });
    await projectModel.updateOne(
      { _id: id },
      { $push: { notifications: { type: 'report', message: 'A new project report has been published' } } }
    );
    console.log("new report generated")
    res.status(200).send(report);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
